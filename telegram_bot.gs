const CREDENTIALS = {
  telegramBotToken: 'YOUR_TELEGRAM_BOT_TOKEN',
  webhookUrl: 'YOUR_WEBHOOK_URL',
  chatID: 'YOUR_CHAT_ID',
  sheetUrl: 'YOUR_GOOGLE_SHEET_URL',
  whisperApiUrl: 'YOUR_WHISPER_API_URL',
  whisperApiToken: 'YOUR_WHISPER_API_TOKEN',
  conversionApiUrl: 'YOUR_CONVERSION_API_URL',
  conversionApiKey: 'YOUR_CONVERSION_API_KEY'
};

function setWebhook() {  // run after every deploy and update WEBHOOK_URL
  var credentials = getCredentials();
  var telegramToken = credentials.telegramBotToken;
  var webUrl = credentials.webhookUrl;
  var url = 'https://api.telegram.org/bot' + telegramToken + '/setWebhook?url=' + webUrl;
  UrlFetchApp.fetch(url);
}

function getCredentials() {
  // Directly return the embedded JSON object
  return CREDENTIALS;
}

// Function to log debug messages to Google Sheets
function logDebugMessage(sheetUrl, message) {
  try {
    var sheet = SpreadsheetApp.openByUrl(sheetUrl).getActiveSheet();
    sheet.appendRow([new Date(), message]);
  } catch (e) {
    console.error('Logging error: ' + e.message);
  }
}

// Function to send messages to Telegram
function sendTGMessage(message, telegramToken, chatId, sheetUrl) {
  var url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
  var payload = {
    chat_id: chatId,
    text: message
  };

  logDebugMessage(sheetUrl, 'Sending message: ' + message);
  logDebugMessage(sheetUrl, 'URL: ' + url);

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    logDebugMessage(sheetUrl, 'Response: ' + response.getContentText());
  } catch (e) {
    logDebugMessage(sheetUrl, 'Error sending message: ' + e.message);
  }
}

// Function to send long messages to Telegram
function sendLongMessage(chatId, message, telegramToken, sheetUrl) {
  var maxLength = 4096; // Telegram message character limit
  var parts = Math.ceil(message.length / maxLength);

  for (var i = 0; i < parts; i++) {
    var part = message.substring(i * maxLength, (i + 1) * maxLength);
    sendTGMessage(part, telegramToken, chatId, sheetUrl);
  }
}

function doPost(e) {
  var credentials = getCredentials();
  var chatId = credentials.chatID;
  var telegramToken = credentials.telegramBotToken;
  var sheetUrl = credentials.sheetUrl;

  try {
    logDebugMessage(sheetUrl, 'doPost called. Credentials loaded successfully. Telegram Token: ' + telegramToken + ', Chat ID: ' + chatId);

    if (!e.postData || !e.postData.contents) {
      throw new Error('No postData or contents found in the request.');
    }

    var update = JSON.parse(e.postData.contents);
    logDebugMessage(sheetUrl, 'Update JSON: ' + JSON.stringify(update, null, 2));
    
    chatId = update.message ? update.message.chat.id : chatId;
    logDebugMessage(sheetUrl, 'Update received. Chat ID: ' + chatId);

    var voice = update.message && update.message.voice ? update.message.voice : null;
    var audio = update.message && update.message.audio ? update.message.audio : null;

    if (voice || audio) {
      var file = voice || audio;
      logDebugMessage(sheetUrl, 'Audio message detected. File ID: ' + file.file_id);

      var fileId = file.file_id;
      var fileUrl = getTelegramFileUrl(fileId, telegramToken, sheetUrl);
      logDebugMessage(sheetUrl, 'File URL obtained: ' + fileUrl);

      var audioBlob = UrlFetchApp.fetch(fileUrl).getBlob();
      var contentType = audioBlob.getContentType();
      logDebugMessage(sheetUrl, 'Content Type of audio file: ' + contentType);

      var mp3Blob;
      if (contentType === 'audio/ogg') {
        mp3Blob = convertOggToMp3(fileUrl, credentials, sheetUrl);
      } else {
        logDebugMessage(sheetUrl, 'Audio file is not in OGG format. Skipping conversion.');
        mp3Blob = audioBlob;
      }

      if (mp3Blob) {
        logDebugMessage(sheetUrl, 'Audio ready for transcription.');

        var transcription = transcribeAudio(mp3Blob, credentials.whisperApiUrl, credentials.whisperApiToken, sheetUrl);
        logDebugMessage(sheetUrl, `Transcription: ${transcription.text}\nDetected Language: ${transcription.language}`);

        sendLongMessage(chatId, transcription.text, telegramToken, sheetUrl);
        sendTGMessage(`Detected Language: ${transcription.language}`, telegramToken, chatId, sheetUrl);
      } else {
        logDebugMessage(sheetUrl, 'Error: Failed to convert audio file.');
      }
    } else {
      logDebugMessage(sheetUrl, 'No audio message detected.');
    }
  } catch (error) {
    chatId = chatId || credentials.chatID;
    logDebugMessage(sheetUrl, `Error: ${error.message}`);
  }
}

function getTelegramFileUrl(fileId, telegramToken, sheetUrl) {
  var url = `https://api.telegram.org/bot${telegramToken}/getFile?file_id=${fileId}`;
  logDebugMessage(sheetUrl, 'Getting file URL. Request URL: ' + url);
  
  try {
    var response = UrlFetchApp.fetch(url);
    var filePath = JSON.parse(response.getContentText()).result.file_path;
    logDebugMessage(sheetUrl, 'File path obtained: ' + filePath);

    return `https://api.telegram.org/file/bot${telegramToken}/${filePath}`;
  } catch (e) {
    logDebugMessage(sheetUrl, 'Error getting file URL: ' + e.message);
    throw e;
  }
}

function convertOggToMp3(fileUrl, credentials, sheetUrl) {
  var conversionApiUrl = credentials.conversionApiUrl;
  var conversionApiKey = credentials.conversionApiKey;

  // Create the payload for the CloudConvert API
  var payload = {
    "tasks": {
      "import-task": {
        "operation": "import/url",
        "url": fileUrl
      },
      "convert-task": {
        "operation": "convert",
        "input_format": "ogg",
        "output_format": "mp3",
        "engine": "ffmpeg",
        "input": "import-task",
        "audio_codec": "mp3",
        "audio_qscale": 0
      },
      "export-task": {
        "operation": "export/url",
        "input": ["convert-task"],
        "inline": false,
        "archive_multiple_files": false
      }
    },
    "tag": "jobbuilder"
  };

  logDebugMessage(sheetUrl, 'Payload for CloudConvert: ' + JSON.stringify(payload));

  // Set up the options for the fetch request
  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + conversionApiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  logDebugMessage(sheetUrl, 'Creating conversion job. Conversion API URL: ' + conversionApiUrl);

  try {
    var response = UrlFetchApp.fetch(conversionApiUrl, options);
    var responseCode = response.getResponseCode();
    var responseData = JSON.parse(response.getContentText());

    if (responseCode === 201 || responseCode === 200) {
      logDebugMessage(sheetUrl, 'Job creation successful. Response: ' + JSON.stringify(responseData, null, 2));

      // Wait for the conversion to complete and fetch the result
      var jobId = responseData.data.id;
      var jobStatusUrl = conversionApiUrl + '/' + jobId;
      var statusResponse;
      var statusData;

      // Poll the job status until it is finished
      while (true) {
        statusResponse = UrlFetchApp.fetch(jobStatusUrl, {
          method: 'get',
          headers: {
            'Authorization': 'Bearer ' + conversionApiKey
          },
          muteHttpExceptions: true
        });

        statusData = JSON.parse(statusResponse.getContentText());
        logDebugMessage(sheetUrl, 'Conversion status response: ' + JSON.stringify(statusData, null, 2));

        if (statusData.data.status === 'finished') {
          break;
        } else if (statusData.data.status === 'error') {
          logDebugMessage(sheetUrl, 'Error: Conversion encountered an error.');
          return null;
        }

        Utilities.sleep(5000);  // Wait for 5 seconds before checking the status again
      }

      var exportTask = statusData.data.tasks.find(task => task.name === "export-task");

      if (exportTask && exportTask.result && exportTask.result.files) {
        var resultUrl = exportTask.result.files[0].url;
        var fetchOptions = {
          muteHttpExceptions: true
        };
        var mp3BlobResponse = UrlFetchApp.fetch(resultUrl, fetchOptions);
        if (mp3BlobResponse.getResponseCode() === 200) {
          var mp3Blob = mp3BlobResponse.getBlob();
          logDebugMessage(sheetUrl, 'Audio conversion successful. MP3 file fetched.');
          return mp3Blob;
        } else {
          logDebugMessage(sheetUrl, 'Error fetching MP3 file: ' + mp3BlobResponse.getContentText());
          return null;
        }
      } else {
        logDebugMessage(sheetUrl, 'Error: Conversion did not finish successfully or result files are missing.');
        return null;
      }
    } else {
      logDebugMessage(sheetUrl, 'Error during job creation: ' + response.getContentText());
      return null;
    }
  } catch (e) {
    logDebugMessage(sheetUrl, 'Error during audio conversion: ' + e.message);
    return null;
  }
}

function transcribeAudio(audioBlob, whisperApiUrl, whisperApiToken, sheetUrl) {
  var formData = {
    model: 'whisper-1',
    response_format: 'verbose_json',
    file: audioBlob
  };

  var options = {
    method: 'post',
    payload: formData,
    headers: {
      'Authorization': `Bearer ${whisperApiToken}`
    },
    muteHttpExceptions: true
  };

  logDebugMessage(sheetUrl, 'Transcribing audio. Whisper API URL: ' + whisperApiUrl);

  try {
    var response = UrlFetchApp.fetch(whisperApiUrl, options);
    var contentType = response.getHeaders()['Content-Type'];

    if (contentType.includes('application/json')) {
      var jsonResponse = JSON.parse(response.getContentText());
      logDebugMessage(sheetUrl, 'Transcription response (JSON): ' + JSON.stringify(jsonResponse));
      return {
        text: jsonResponse.text,
        language: jsonResponse.language
      };
    } else {
      var textResponse = response.getContentText();
      logDebugMessage(sheetUrl, 'Transcription response (text): ' + textResponse);
      return {
        text: textResponse,
        language: 'unknown'
      };
    }
  } catch (e) {
    logDebugMessage(sheetUrl, 'Error during transcription: ' + e.message);
    return null;
  }
}

function sendMessage(chatId, text, telegramToken, sheetUrl) {
  sendTGMessage(text, telegramToken, chatId, sheetUrl);
}
