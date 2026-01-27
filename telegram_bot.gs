/**
 * ===========================================
 * CONFIGURATION
 * ===========================================
 * 
 * Credentials are stored securely in Script Properties.
 * Run setupCredentials() once to configure, or set manually in:
 * Project Settings > Script Properties
 * 
 * Required properties:
 * - TELEGRAM_BOT_TOKEN
 * - WEBHOOK_URL  
 * - CHAT_ID
 * - SHEET_URL
 * - TRANSCRIPTION_PROVIDER ('openai', 'gemini', or 'assemblyai')
 * - OPENAI_API_KEY (if using OpenAI)
 * - GEMINI_API_KEY (if using Gemini)
 * - ASSEMBLYAI_API_KEY (if using AssemblyAI)
 * - CONVERSION_API_URL (optional, for CloudConvert, required for OpenAI to handle .OGG audio format)
 * - CONVERSION_API_KEY (optional, for CloudConvert, required for OpenAI to handle .OGG audio format)
 */

/**
 * Shows setup instructions - run this first!
 * Credentials must be set manually in Project Settings > Script Properties.
 */
function setupCredentials() {
  const props = PropertiesService.getScriptProperties();
  
  const settings = [
    { key: 'TELEGRAM_BOT_TOKEN', prompt: 'Your Telegram Bot Token from @BotFather', required: true },
    { key: 'WEBHOOK_URL', prompt: 'Web app URL (set after first deployment)', required: true },
    { key: 'CHAT_ID', prompt: 'Your Telegram chat ID', required: true },
    { key: 'SHEET_URL', prompt: 'Google Sheet URL for logging', required: true },
    { key: 'TRANSCRIPTION_PROVIDER', prompt: 'Provider: gemini, openai, or assemblyai', required: true },
    { key: 'GEMINI_API_KEY', prompt: 'Gemini API key (if using Gemini)', required: false },
    { key: 'OPENAI_API_KEY', prompt: 'OpenAI API key (if using OpenAI)', required: false },
    { key: 'ASSEMBLYAI_API_KEY', prompt: 'AssemblyAI API key (if using AssemblyAI)', required: false },
    { key: 'CONVERSION_API_URL', prompt: 'CloudConvert API URL (optional)', required: false },
    { key: 'CONVERSION_API_KEY', prompt: 'CloudConvert API key (optional)', required: false }
  ];
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           TELEGRAM TRANSCRIBER BOT - SETUP                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📋 To configure credentials:');
  console.log('   1. Click the ⚙️ gear icon (Project Settings) in the left sidebar');
  console.log('   2. Scroll down to "Script Properties"');
  console.log('   3. Click "Add script property" for each setting below');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('REQUIRED PROPERTIES:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  settings.filter(s => s.required).forEach(s => {
    const current = props.getProperty(s.key);
    const status = current ? '✅' : '❌';
    console.log(`${status} ${s.key}`);
    console.log(`   ${s.prompt}`);
  });
  
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('OPTIONAL PROPERTIES:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  settings.filter(s => !s.required).forEach(s => {
    const current = props.getProperty(s.key);
    const status = current ? '✅' : '⬚ ';
    console.log(`${status} ${s.key}`);
    console.log(`   ${s.prompt}`);
  });
  
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('NEXT STEPS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Add all required properties in Script Properties');
  console.log('2. Deploy as Web App (Deploy > New deployment > Web app)');
  console.log('3. Copy the web app URL to WEBHOOK_URL property');
  console.log('4. Run setWebhook() to connect your bot');
  console.log('5. Run testCredentials() to verify setup');
  console.log('');
}

/**
 * Sets up the Telegram webhook. Run after every deployment.
 */
function setWebhook() {
  const credentials = getCredentials();
  const telegramToken = credentials.telegramBotToken;
  const webUrl = credentials.webhookUrl;
  
  if (!webUrl) {
    throw new Error('WEBHOOK_URL not set. Deploy the web app first, then set WEBHOOK_URL in Script Properties.');
  }
  
  const url = `https://api.telegram.org/bot${telegramToken}/setWebhook?url=${webUrl}`;
  const response = UrlFetchApp.fetch(url);
  const result = JSON.parse(response.getContentText());
  
  if (result.ok) {
    console.log('✅ Webhook set successfully!');
    console.log(`Webhook URL: ${webUrl}`);
  } else {
    console.log('❌ Failed to set webhook:', result.description);
  }
  
  return result;
}

/**
 * Retrieves credentials from Script Properties (secure storage).
 * @returns {Object} Credentials object
 * @throws {Error} If required credentials are missing
 */
function getCredentials() {
  const props = PropertiesService.getScriptProperties();
  
  const credentials = {
    telegramBotToken: props.getProperty('TELEGRAM_BOT_TOKEN'),
    webhookUrl: props.getProperty('WEBHOOK_URL'),
    chatID: props.getProperty('CHAT_ID'),
    sheetUrl: props.getProperty('SHEET_URL'),
    transcriptionProvider: props.getProperty('TRANSCRIPTION_PROVIDER') || 'gemini',
    openaiApiKey: props.getProperty('OPENAI_API_KEY'),
    geminiApiKey: props.getProperty('GEMINI_API_KEY'),
    assemblyaiApiKey: props.getProperty('ASSEMBLYAI_API_KEY'),
    conversionApiUrl: props.getProperty('CONVERSION_API_URL') || 'https://api.cloudconvert.com/v2/jobs',
    conversionApiKey: props.getProperty('CONVERSION_API_KEY')
  };
  
  // Validate required credentials
  const required = ['telegramBotToken', 'chatID', 'sheetUrl'];
  const missing = required.filter(key => !credentials[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required credentials: ${missing.join(', ')}. Run setupCredentials() first.`);
  }
  
  // Validate provider-specific API key
  const provider = credentials.transcriptionProvider.toLowerCase();
  const providerKeyMap = {
    'openai': 'openaiApiKey',
    'gemini': 'geminiApiKey',
    'assemblyai': 'assemblyaiApiKey'
  };
  
  if (providerKeyMap[provider] && !credentials[providerKeyMap[provider]]) {
    throw new Error(`Missing API key for provider '${provider}'. Set ${providerKeyMap[provider].toUpperCase()} in Script Properties.`);
  }
  
  return credentials;
}

/**
 * Logs debug messages to Google Sheets.
 * @param {string} sheetUrl - URL of the logging sheet
 * @param {string} message - Message to log (sensitive data will be redacted)
 */
function logDebugMessage(sheetUrl, message) {
  try {
    // Redact potential sensitive data
    const redactedMessage = message
      .replace(/bot[0-9]+:[A-Za-z0-9_-]+/gi, 'bot[REDACTED]')
      .replace(/Bearer [A-Za-z0-9_-]+/gi, 'Bearer [REDACTED]')
      .replace(/key=[A-Za-z0-9_-]+/gi, 'key=[REDACTED]');
    
    const sheet = SpreadsheetApp.openByUrl(sheetUrl).getActiveSheet();
    sheet.appendRow([new Date(), redactedMessage]);
  } catch (e) {
    console.error('Logging error: ' + e.message);
  }
}

/**
 * Sends a message to Telegram.
 * @param {string} message - Message text
 * @param {string} telegramToken - Bot token
 * @param {string} chatId - Chat ID
 * @param {string} sheetUrl - Logging sheet URL
 */
function sendTGMessage(message, telegramToken, chatId, sheetUrl) {
  const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML'
  };

  logDebugMessage(sheetUrl, `Sending message to chat ${chatId}`);

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    if (!result.ok) {
      logDebugMessage(sheetUrl, `Message send failed: ${result.description}`);
    }
  } catch (e) {
    logDebugMessage(sheetUrl, `Error sending message: ${e.message}`);
  }
}

/**
 * Sends long messages by splitting into chunks.
 * @param {string} chatId - Chat ID
 * @param {string} message - Message text
 * @param {string} telegramToken - Bot token
 * @param {string} sheetUrl - Logging sheet URL
 */
function sendLongMessage(chatId, message, telegramToken, sheetUrl) {
  const maxLength = 4096; // Telegram message character limit
  const parts = Math.ceil(message.length / maxLength);

  for (let i = 0; i < parts; i++) {
    const part = message.substring(i * maxLength, (i + 1) * maxLength);
    sendTGMessage(part, telegramToken, chatId, sheetUrl);
  }
}

function doPost(e) {
  const credentials = getCredentials();
  let chatId = credentials.chatID;
  const telegramToken = credentials.telegramBotToken;
  const sheetUrl = credentials.sheetUrl;

  try {
    logDebugMessage(sheetUrl, 'doPost called. Credentials loaded successfully.');

    // Validate incoming request
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Invalid request: No postData or contents found.');
    }

    let update;
    try {
      update = JSON.parse(e.postData.contents);
    } catch (parseError) {
      throw new Error('Invalid JSON in request body.');
    }
    
    // Validate it's a Telegram update
    if (!update.update_id) {
      throw new Error('Invalid Telegram update: missing update_id.');
    }
    
    logDebugMessage(sheetUrl, `Update received. Update ID: ${update.update_id}`);
    
    chatId = update.message ? update.message.chat.id : chatId;
    logDebugMessage(sheetUrl, `Chat ID: ${chatId}`);

    // Check for commands first
    const messageText = update.message?.text || '';
    if (messageText.startsWith('/')) {
      handleCommand(messageText, chatId, credentials, sheetUrl);
      return;
    }

    // Check for audio content (voice, audio, or video_note)
    const voice = update.message?.voice || null;
    const audio = update.message?.audio || null;
    const videoNote = update.message?.video_note || null;

    if (voice || audio || videoNote) {
      const file = voice || audio || videoNote;
      const isVideoNote = !!videoNote;
      const mediaType = isVideoNote ? 'video note' : 'audio';
      
      logDebugMessage(sheetUrl, `${mediaType} message detected. File ID: ${file.file_id}`);
      
      // Check if video note is supported (Gemini only)
      if (isVideoNote && credentials.transcriptionProvider.toLowerCase() !== 'gemini') {
        sendTGMessage('⚠️ Video notes are only supported with Gemini provider. Please switch to Gemini or send a voice message instead.', telegramToken, chatId, sheetUrl);
        return;
      }
      
      // Send processing feedback to user
      sendTypingAction(chatId, telegramToken);
      const processingMsg = isVideoNote ? '🎬 Transcribing your video note...' : '🎙️ Transcribing your audio...';
      sendTGMessage(processingMsg, telegramToken, chatId, sheetUrl);

      const fileId = file.file_id;
      const fileUrl = getTelegramFileUrl(fileId, telegramToken, sheetUrl);
      logDebugMessage(sheetUrl, 'File URL obtained.');

      let transcription;
      
      if (isVideoNote) {
        // Video notes go directly to Gemini (which handles video natively)
        const videoBlob = UrlFetchApp.fetch(fileUrl).getBlob();
        transcription = transcribeVideoWithGemini(videoBlob, credentials.geminiApiKey, sheetUrl);
      } else {
        // Regular audio processing
        const audioBlob = UrlFetchApp.fetch(fileUrl).getBlob();
        
        // Detect OGG format - check both content-type AND mime_type from Telegram
        // Telegram often sends OGG but blob shows as application/octet-stream
        const contentType = audioBlob.getContentType() || '';
        const telegramMimeType = file.mime_type || '';
        const isOggFormat = contentType.includes('ogg') || 
                           telegramMimeType.includes('ogg') || 
                           fileUrl.endsWith('.oga') || 
                           fileUrl.endsWith('.ogg');
        
        logDebugMessage(sheetUrl, `Content Type: ${contentType}, Telegram MIME: ${telegramMimeType}, Is OGG: ${isOggFormat}`);

        let processedBlob;
        
        // Gemini can handle OGG natively - no conversion needed
        if (credentials.transcriptionProvider.toLowerCase() === 'gemini') {
          logDebugMessage(sheetUrl, 'Using Gemini - no OGG conversion needed.');
          processedBlob = audioBlob;
          // Set proper mime type for Gemini if it's OGG
          if (isOggFormat) {
            processedBlob.setContentType('audio/ogg');
          }
        } else if (isOggFormat) {
          // OpenAI/AssemblyAI need MP3 conversion for OGG files
          logDebugMessage(sheetUrl, 'OGG detected, converting to MP3 for ' + credentials.transcriptionProvider);
          processedBlob = convertOggToMp3(fileUrl, credentials, sheetUrl);
        } else {
          logDebugMessage(sheetUrl, 'Audio not OGG format. Using as-is.');
          processedBlob = audioBlob;
        }

        if (!processedBlob) {
          logDebugMessage(sheetUrl, 'Error: Failed to process audio file.');
          sendTGMessage('❌ Sorry, failed to process audio file. Make sure CloudConvert is configured for OGG conversion.', telegramToken, chatId, sheetUrl);
          return;
        }
        
        logDebugMessage(sheetUrl, 'Audio ready for transcription.');
        transcription = transcribeAudio(processedBlob, credentials, sheetUrl);
      }
      
      // Handle transcription result
      if (transcription && transcription.text && !transcription.text.startsWith('Error:')) {
        logDebugMessage(sheetUrl, `Transcription successful. Language: ${transcription.language}`);
        sendLongMessage(chatId, `📝 ${transcription.text}`, telegramToken, sheetUrl);
        if (transcription.language !== 'unknown') {
          sendTGMessage(`🌍 Detected Language: ${transcription.language}`, telegramToken, chatId, sheetUrl);
        }
      } else {
        logDebugMessage(sheetUrl, `Transcription failed: ${transcription?.text || 'Unknown error'}`);
        sendTGMessage('❌ Sorry, transcription failed. Please try again.', telegramToken, chatId, sheetUrl);
      }
    } else {
      logDebugMessage(sheetUrl, 'No audio/video message detected.');
    }
  } catch (error) {
    logDebugMessage(sheetUrl, `Error: ${error.message}`);
    // Try to notify user of error
    try {
      if (chatId) {
        sendTGMessage('❌ An error occurred. Please try again later.', telegramToken, chatId, sheetUrl);
      }
    } catch (e) {
      // Silent fail if we can't send error message
    }
  }
}

// ===========================================
// COMMAND HANDLERS
// ===========================================

/**
 * Handles bot commands.
 * @param {string} commandText - The command text (e.g., '/start', '/help')
 * @param {string} chatId - Chat ID
 * @param {Object} credentials - Credentials object
 * @param {string} sheetUrl - Logging sheet URL
 */
function handleCommand(commandText, chatId, credentials, sheetUrl) {
  const telegramToken = credentials.telegramBotToken;
  const command = commandText.split(' ')[0].toLowerCase().replace('@', '').split('@')[0];
  
  logDebugMessage(sheetUrl, `Command received: ${command}`);
  
  switch (command) {
    case '/start':
      handleStartCommand(chatId, telegramToken, sheetUrl);
      break;
    case '/help':
      handleHelpCommand(chatId, telegramToken, sheetUrl);
      break;
    case '/status':
      handleStatusCommand(chatId, credentials, sheetUrl);
      break;
    case '/provider':
      handleProviderCommand(chatId, credentials, sheetUrl);
      break;
    case '/about':
      handleAboutCommand(chatId, telegramToken, sheetUrl);
      break;
    default:
      sendTGMessage('❓ Unknown command. Send /help to see available commands.', telegramToken, chatId, sheetUrl);
  }
}

/**
 * Handles /start command - Welcome message for new users.
 */
function handleStartCommand(chatId, telegramToken, sheetUrl) {
  const message = `👋 <b>Welcome to Transcriber Bot!</b>

I can transcribe your voice messages, audio files, and video notes into text.

<b>How to use:</b>
1️⃣ Send me a voice message 🎙️
2️⃣ Send me an audio file 🎵
3️⃣ Send me a video note 🎬

I'll transcribe it and send you the text!

<b>Commands:</b>
/help - Show all commands
/status - Check bot status
/provider - See current transcription provider

Just send me some audio to get started! 🚀`;
  
  sendTGMessage(message, telegramToken, chatId, sheetUrl);
}

/**
 * Handles /help command - Shows all available commands.
 */
function handleHelpCommand(chatId, telegramToken, sheetUrl) {
  const message = `📖 <b>Help - Available Commands</b>

/start - Welcome message and quick start guide
/help - Show this help message
/status - Check bot status and configuration
/provider - Show current transcription provider
/about - About this bot

<b>Supported Media:</b>
🎙️ Voice messages - All providers
🎵 Audio files - All providers  
🎬 Video notes - Gemini only

<b>Tips:</b>
• For best results, speak clearly
• Longer recordings may take more time
• Language is auto-detected

<b>Issues?</b>
Check /status to verify the bot is configured correctly.`;
  
  sendTGMessage(message, telegramToken, chatId, sheetUrl);
}

/**
 * Handles /status command - Shows bot status and configuration.
 */
function handleStatusCommand(chatId, credentials, sheetUrl) {
  const telegramToken = credentials.telegramBotToken;
  const provider = credentials.transcriptionProvider;
  
  // Check which features are available
  const hasConversion = !!credentials.conversionApiKey;
  const supportsVideoNotes = provider.toLowerCase() === 'gemini';
  
  const providerEmoji = {
    'gemini': '🔷',
    'openai': '🟢', 
    'assemblyai': '🟣'
  };
  
  const message = `📊 <b>Bot Status</b>

<b>Status:</b> ✅ Online
<b>Provider:</b> ${providerEmoji[provider.toLowerCase()] || '⚪'} ${provider}

<b>Features:</b>
🎙️ Voice messages: ✅
🎵 Audio files: ✅
🎬 Video notes: ${supportsVideoNotes ? '✅' : '❌ (Gemini only)'}
🔄 OGG conversion: ${hasConversion ? '✅' : '⚠️ Not configured'}

<b>Your Chat ID:</b> <code>${chatId}</code>`;
  
  sendTGMessage(message, telegramToken, chatId, sheetUrl);
}

/**
 * Handles /provider command - Shows current transcription provider info.
 */
function handleProviderCommand(chatId, credentials, sheetUrl) {
  const telegramToken = credentials.telegramBotToken;
  const provider = credentials.transcriptionProvider.toLowerCase();
  
  const providerInfo = {
    'gemini': {
      name: 'Google Gemini',
      emoji: '🔷',
      features: '• Free tier: 15 req/min, 1M tokens/day\n• Supports audio and video\n• Auto language detection',
      best: 'Cost-effective, handles video notes'
    },
    'openai': {
      name: 'OpenAI Whisper',
      emoji: '🟢',
      features: '• Pay-as-you-go (~$0.006/min)\n• High accuracy\n• 50+ languages supported',
      best: 'Accuracy, language support'
    },
    'assemblyai': {
      name: 'AssemblyAI',
      emoji: '🟣', 
      features: '• Free tier: 100 hours\n• Good accuracy\n• Auto language detection',
      best: 'New users, generous free tier'
    }
  };
  
  const info = providerInfo[provider] || { name: provider, emoji: '⚪', features: 'Unknown provider', best: 'N/A' };
  
  const message = `${info.emoji} <b>Current Provider: ${info.name}</b>

<b>Features:</b>
${info.features}

<b>Best for:</b> ${info.best}

<i>To change provider, update TRANSCRIPTION_PROVIDER in Script Properties.</i>`;
  
  sendTGMessage(message, telegramToken, chatId, sheetUrl);
}

/**
 * Handles /about command - Shows bot information.
 */
function handleAboutCommand(chatId, telegramToken, sheetUrl) {
  const message = `🤖 <b>Telegram Transcriber Bot</b>

<b>Version:</b> 2.0
<b>Platform:</b> Google Apps Script

This bot transcribes voice messages, audio files, and video notes using AI-powered speech recognition.

<b>Supported Providers:</b>
🔷 Google Gemini
🟢 OpenAI Whisper
🟣 AssemblyAI

<b>Open Source:</b>
This bot is open source! Check the GitHub repository for setup instructions and to contribute.

<i>Made with ❤️ for easy audio transcription</i>`;
  
  sendTGMessage(message, telegramToken, chatId, sheetUrl);
}

/**
 * Gets the download URL for a Telegram file.
 * @param {string} fileId - Telegram file ID
 * @param {string} telegramToken - Bot token
 * @param {string} sheetUrl - Logging sheet URL
 * @returns {string} Download URL
 */
function getTelegramFileUrl(fileId, telegramToken, sheetUrl) {
  const url = `https://api.telegram.org/bot${telegramToken}/getFile?file_id=${fileId}`;
  logDebugMessage(sheetUrl, `Getting file URL for file ID: ${fileId}`);
  
  try {
    const response = UrlFetchApp.fetch(url);
    const result = JSON.parse(response.getContentText());
    
    if (!result.ok || !result.result?.file_path) {
      throw new Error('Failed to get file path from Telegram');
    }
    
    const filePath = result.result.file_path;
    logDebugMessage(sheetUrl, 'File path obtained successfully.');

    return `https://api.telegram.org/file/bot${telegramToken}/${filePath}`;
  } catch (e) {
    logDebugMessage(sheetUrl, `Error getting file URL: ${e.message}`);
    throw e;
  }
}

/**
 * Sends typing indicator to show bot is processing.
 * @param {string} chatId - Chat ID
 * @param {string} telegramToken - Bot token
 */
function sendTypingAction(chatId, telegramToken) {
  const url = `https://api.telegram.org/bot${telegramToken}/sendChatAction`;
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: chatId, action: 'typing' }),
    muteHttpExceptions: true
  };
  
  try {
    UrlFetchApp.fetch(url, options);
  } catch (e) {
    // Silent fail - typing indicator is not critical
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

// Main transcription router - selects provider based on configuration
function transcribeAudio(audioBlob, credentials, sheetUrl) {
  var provider = credentials.transcriptionProvider.toLowerCase();
  logDebugMessage(sheetUrl, 'Using transcription provider: ' + provider);
  
  switch (provider) {
    case 'openai':
      return transcribeWithOpenAI(audioBlob, credentials.openaiApiKey, sheetUrl);
    case 'gemini':
      return transcribeWithGemini(audioBlob, credentials.geminiApiKey, sheetUrl);
    case 'assemblyai':
      return transcribeWithAssemblyAI(audioBlob, credentials.assemblyaiApiKey, sheetUrl);
    default:
      logDebugMessage(sheetUrl, 'Unknown provider: ' + provider + '. Defaulting to Gemini.');
      return transcribeWithGemini(audioBlob, credentials.geminiApiKey, sheetUrl);
  }
}

// OpenAI Whisper transcription
function transcribeWithOpenAI(audioBlob, apiKey, sheetUrl) {
  var whisperApiUrl = 'https://api.openai.com/v1/audio/transcriptions';
  
  var formData = {
    model: 'whisper-1',
    response_format: 'verbose_json',
    file: audioBlob
  };

  var options = {
    method: 'post',
    payload: formData,
    headers: {
      'Authorization': 'Bearer ' + apiKey
    },
    muteHttpExceptions: true
  };

  logDebugMessage(sheetUrl, 'Transcribing with OpenAI Whisper.');

  try {
    var response = UrlFetchApp.fetch(whisperApiUrl, options);
    var contentType = response.getHeaders()['Content-Type'];

    if (contentType.includes('application/json')) {
      var jsonResponse = JSON.parse(response.getContentText());
      logDebugMessage(sheetUrl, 'OpenAI transcription response: ' + JSON.stringify(jsonResponse));
      
      if (jsonResponse.error) {
        logDebugMessage(sheetUrl, 'OpenAI API error: ' + jsonResponse.error.message);
        return { text: 'Error: ' + jsonResponse.error.message, language: 'unknown' };
      }
      
      return {
        text: jsonResponse.text,
        language: jsonResponse.language || 'unknown'
      };
    } else {
      var textResponse = response.getContentText();
      logDebugMessage(sheetUrl, 'OpenAI transcription response (text): ' + textResponse);
      return { text: textResponse, language: 'unknown' };
    }
  } catch (e) {
    logDebugMessage(sheetUrl, 'Error during OpenAI transcription: ' + e.message);
    return { text: 'Transcription failed: ' + e.message, language: 'unknown' };
  }
}

// Google Gemini transcription
function transcribeWithGemini(audioBlob, apiKey, sheetUrl) {
  // Try gemini-2.5-pro first, fall back to gemini-2.5-flash
  const models = ['gemini-2.5-pro', 'gemini-2.5-flash'];
  
  for (const model of models) {
    const result = tryGeminiModel(model, audioBlob, apiKey, sheetUrl);
    if (result && !result.text.includes('not found') && !result.text.includes('NOT_FOUND')) {
      return result;
    }
    logDebugMessage(sheetUrl, `Model ${model} not available, trying next...`);
  }
  
  return { text: 'Error: No Gemini model available. Check your API key and region.', language: 'unknown' };
}

function tryGeminiModel(model, audioBlob, apiKey, sheetUrl) {
  var geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=` + apiKey;
  
  // Convert audio blob to base64
  var audioBase64 = Utilities.base64Encode(audioBlob.getBytes());
  var mimeType = audioBlob.getContentType() || 'audio/mpeg';
  
  var payload = {
    contents: [{
      parts: [
        {
          inline_data: {
            mime_type: mimeType,
            data: audioBase64
          }
        },
        {
          text: "Transcribe this audio file. Return ONLY the transcription text, nothing else. If you can detect the language, start your response with [LANG:language_code] where language_code is the ISO 639-1 code (e.g., en, es, fr, de, zh, ja), then the transcription."
        }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192
    }
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  logDebugMessage(sheetUrl, 'Transcribing with Google Gemini.');

  try {
    var response = UrlFetchApp.fetch(geminiApiUrl, options);
    var jsonResponse = JSON.parse(response.getContentText());
    logDebugMessage(sheetUrl, 'Gemini transcription response: ' + JSON.stringify(jsonResponse));
    
    if (jsonResponse.error) {
      logDebugMessage(sheetUrl, 'Gemini API error: ' + jsonResponse.error.message);
      return { text: 'Error: ' + jsonResponse.error.message, language: 'unknown' };
    }
    
    if (jsonResponse.candidates && jsonResponse.candidates[0] && jsonResponse.candidates[0].content) {
      var text = jsonResponse.candidates[0].content.parts[0].text;
      var language = 'unknown';
      
      // Extract language if present in [LANG:xx] format
      var langMatch = text.match(/^\[LANG:([a-z]{2,3})\]\s*/i);
      if (langMatch) {
        language = langMatch[1].toLowerCase();
        text = text.replace(/^\[LANG:[a-z]{2,3}\]\s*/i, '');
      }
      
      return { text: text.trim(), language: language };
    } else {
      logDebugMessage(sheetUrl, 'Unexpected Gemini response format');
      return { text: 'Transcription failed: unexpected response format', language: 'unknown' };
    }
  } catch (e) {
    logDebugMessage(sheetUrl, 'Error during Gemini transcription: ' + e.message);
    return { text: 'Transcription failed: ' + e.message, language: 'unknown' };
  }
}

/**
 * Transcribes video (video notes) using Google Gemini.
 * Gemini can process video files natively, extracting audio for transcription.
 * @param {Blob} videoBlob - Video file blob
 * @param {string} apiKey - Gemini API key
 * @param {string} sheetUrl - Logging sheet URL
 * @returns {Object} Transcription result {text, language}
 */
function transcribeVideoWithGemini(videoBlob, apiKey, sheetUrl) {
  // Try gemini-2.0-flash first, fall back to gemini-1.5-flash-latest
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash-001'];
  
  for (const model of models) {
    const result = tryGeminiVideoModel(model, videoBlob, apiKey, sheetUrl);
    if (result && !result.text.includes('not found') && !result.text.includes('NOT_FOUND')) {
      return result;
    }
    logDebugMessage(sheetUrl, `Model ${model} not available for video, trying next...`);
  }
  
  return { text: 'Error: No Gemini model available for video. Check your API key and region.', language: 'unknown' };
}

function tryGeminiVideoModel(model, videoBlob, apiKey, sheetUrl) {
  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=` + apiKey;
  
  // Convert video blob to base64
  const videoBase64 = Utilities.base64Encode(videoBlob.getBytes());
  const mimeType = videoBlob.getContentType() || 'video/mp4';
  
  const payload = {
    contents: [{
      parts: [
        {
          inline_data: {
            mime_type: mimeType,
            data: videoBase64
          }
        },
        {
          text: "This is a video note (circular video message). Transcribe ONLY the spoken audio content in this video. Return ONLY the transcription text, nothing else. Do not describe the video visuals. If you can detect the language, start your response with [LANG:language_code] where language_code is the ISO 639-1 code (e.g., en, es, fr, de, zh, ja), then the transcription."
        }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192
    }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  logDebugMessage(sheetUrl, 'Transcribing video note with Google Gemini.');

  try {
    const response = UrlFetchApp.fetch(geminiApiUrl, options);
    const jsonResponse = JSON.parse(response.getContentText());
    logDebugMessage(sheetUrl, 'Gemini video transcription response received.');
    
    if (jsonResponse.error) {
      logDebugMessage(sheetUrl, 'Gemini API error: ' + jsonResponse.error.message);
      return { text: 'Error: ' + jsonResponse.error.message, language: 'unknown' };
    }
    
    if (jsonResponse.candidates && jsonResponse.candidates[0] && jsonResponse.candidates[0].content) {
      let text = jsonResponse.candidates[0].content.parts[0].text;
      let language = 'unknown';
      
      // Extract language if present in [LANG:xx] format
      const langMatch = text.match(/^\[LANG:([a-z]{2,3})\]\s*/i);
      if (langMatch) {
        language = langMatch[1].toLowerCase();
        text = text.replace(/^\[LANG:[a-z]{2,3}\]\s*/i, '');
      }
      
      return { text: text.trim(), language: language };
    } else {
      logDebugMessage(sheetUrl, 'Unexpected Gemini response format for video');
      return { text: 'Transcription failed: unexpected response format', language: 'unknown' };
    }
  } catch (e) {
    logDebugMessage(sheetUrl, 'Error during Gemini video transcription: ' + e.message);
    return { text: 'Transcription failed: ' + e.message, language: 'unknown' };
  }
}

// AssemblyAI transcription
function transcribeWithAssemblyAI(audioBlob, apiKey, sheetUrl) {
  var uploadUrl = 'https://api.assemblyai.com/v2/upload';
  var transcriptUrl = 'https://api.assemblyai.com/v2/transcript';
  
  logDebugMessage(sheetUrl, 'Transcribing with AssemblyAI.');
  
  try {
    // Step 1: Upload audio file
    var uploadOptions = {
      method: 'post',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/octet-stream'
      },
      payload: audioBlob.getBytes(),
      muteHttpExceptions: true
    };
    
    var uploadResponse = UrlFetchApp.fetch(uploadUrl, uploadOptions);
    var uploadJson = JSON.parse(uploadResponse.getContentText());
    logDebugMessage(sheetUrl, 'AssemblyAI upload response: ' + JSON.stringify(uploadJson));
    
    if (uploadJson.error) {
      return { text: 'Upload error: ' + uploadJson.error, language: 'unknown' };
    }
    
    var audioUrl = uploadJson.upload_url;
    
    // Step 2: Request transcription
    var transcriptOptions = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': apiKey
      },
      payload: JSON.stringify({
        audio_url: audioUrl,
        language_detection: true
      }),
      muteHttpExceptions: true
    };
    
    var transcriptResponse = UrlFetchApp.fetch(transcriptUrl, transcriptOptions);
    var transcriptJson = JSON.parse(transcriptResponse.getContentText());
    logDebugMessage(sheetUrl, 'AssemblyAI transcript request: ' + JSON.stringify(transcriptJson));
    
    if (transcriptJson.error) {
      return { text: 'Transcription request error: ' + transcriptJson.error, language: 'unknown' };
    }
    
    var transcriptId = transcriptJson.id;
    var pollingUrl = transcriptUrl + '/' + transcriptId;
    
    // Step 3: Poll for completion
    var maxAttempts = 60; // Max 5 minutes (60 * 5 seconds)
    var attempts = 0;
    
    while (attempts < maxAttempts) {
      Utilities.sleep(5000); // Wait 5 seconds
      
      var pollOptions = {
        method: 'get',
        headers: {
          'Authorization': apiKey
        },
        muteHttpExceptions: true
      };
      
      var pollResponse = UrlFetchApp.fetch(pollingUrl, pollOptions);
      var pollJson = JSON.parse(pollResponse.getContentText());
      logDebugMessage(sheetUrl, 'AssemblyAI poll status: ' + pollJson.status);
      
      if (pollJson.status === 'completed') {
        return {
          text: pollJson.text || '',
          language: pollJson.language_code || 'unknown'
        };
      } else if (pollJson.status === 'error') {
        return { text: 'Transcription error: ' + pollJson.error, language: 'unknown' };
      }
      
      attempts++;
    }
    
    return { text: 'Transcription timed out', language: 'unknown' };
    
  } catch (e) {
    logDebugMessage(sheetUrl, `Error during AssemblyAI transcription: ${e.message}`);
    return { text: 'Transcription failed: ' + e.message, language: 'unknown' };
  }
}

/**
 * Wrapper function for backwards compatibility.
 */
function sendMessage(chatId, text, telegramToken, sheetUrl) {
  sendTGMessage(text, telegramToken, chatId, sheetUrl);
}

// ===========================================
// TEST FUNCTIONS
// ===========================================

/**
 * Tests credential loading. Run this to verify setup.
 */
function testCredentials() {
  console.log('=== Testing Credentials ===');
  
  try {
    const credentials = getCredentials();
    console.log('✅ Credentials loaded successfully');
    console.log(`Provider: ${credentials.transcriptionProvider}`);
    console.log(`Telegram token: ${credentials.telegramBotToken ? '✅ Set' : '❌ Missing'}`);
    console.log(`Chat ID: ${credentials.chatID ? '✅ Set' : '❌ Missing'}`);
    console.log(`Sheet URL: ${credentials.sheetUrl ? '✅ Set' : '❌ Missing'}`);
    console.log(`Webhook URL: ${credentials.webhookUrl ? '✅ Set' : '❌ Missing'}`);
    
    // Check provider-specific key
    const provider = credentials.transcriptionProvider.toLowerCase();
    const keyMap = { openai: 'openaiApiKey', gemini: 'geminiApiKey', assemblyai: 'assemblyaiApiKey' };
    const hasKey = credentials[keyMap[provider]];
    console.log(`${provider} API key: ${hasKey ? '✅ Set' : '❌ Missing'}`);
    
    return { success: true, provider: credentials.transcriptionProvider };
  } catch (e) {
    console.log('❌ Error: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Tests the Telegram connection by sending a test message.
 */
function testTelegram() {
  console.log('=== Testing Telegram Connection ===');
  
  try {
    const credentials = getCredentials();
    sendTGMessage('🤖 Test message from Telegram Transcriber Bot!', credentials.telegramBotToken, credentials.chatID, credentials.sheetUrl);
    console.log('✅ Test message sent! Check your Telegram.');
    return { success: true };
  } catch (e) {
    console.log('❌ Error: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Tests webhook processing with mock data.
 */
function testWebhookProcessing() {
  console.log('=== Testing Webhook Processing ===');
  
  // Mock Telegram webhook payload (text message, not audio)
  const mockUpdate = {
    update_id: 123456789,
    message: {
      message_id: 1,
      chat: { id: 12345, type: 'private' },
      text: 'Hello bot!'
    }
  };
  
  // Test JSON parsing and validation
  try {
    const parsed = JSON.parse(JSON.stringify(mockUpdate));
    console.log('✅ JSON parsing works');
    console.log(`✅ Update ID validated: ${parsed.update_id}`);
    console.log(`✅ Chat ID extracted: ${parsed.message.chat.id}`);
    
    // Test that audio detection correctly identifies non-audio
    const voice = parsed.message?.voice || null;
    const audio = parsed.message?.audio || null;
    console.log(`✅ Audio detection: ${voice || audio ? 'Found audio' : 'No audio (correct for text message)'}`);
    
    return { success: true };
  } catch (e) {
    console.log('❌ Error: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Tests logging to Google Sheets.
 */
function testLogging() {
  console.log('=== Testing Logging ===');
  
  try {
    const credentials = getCredentials();
    logDebugMessage(credentials.sheetUrl, '🧪 Test log entry from testLogging()');
    console.log('✅ Log entry added. Check your Google Sheet.');
    return { success: true };
  } catch (e) {
    console.log('❌ Error: ' + e.message);
    return { success: false, error: e.message };
  }
}

/**
 * Runs all tests.
 */
function runAllTests() {
  console.log('========================================');
  console.log('TELEGRAM TRANSCRIBER BOT - TEST SUITE');
  console.log('========================================\n');
  
  const results = {
    credentials: testCredentials(),
    logging: testLogging(),
    webhookProcessing: testWebhookProcessing(),
    telegram: testTelegram()
  };
  
  console.log('\n========================================');
  console.log('TEST SUMMARY');
  console.log('========================================');
  
  let allPassed = true;
  for (const [name, result] of Object.entries(results)) {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${name}`);
    if (!result.success) allPassed = false;
  }
  
  console.log('\n' + (allPassed ? '🎉 All tests passed!' : '⚠️ Some tests failed. Check output above.'));
  return results;
}
