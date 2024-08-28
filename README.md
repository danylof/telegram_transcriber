# Telegram Bot Integration with Google Apps Script

## Overview

This repository contains a Google Apps Script project that integrates a Telegram bot with Open AI Whisper for audio message transcribation. The script listens for updates (such as messages or voice notes) sent to the bot, processes them, and interacts with external APIs for tasks like audio file conversion and transcription. It logs activities to a Google Sheet for debugging and record-keeping purposes.

## Key Features

1. **Webhook Setup**: The script sets up a webhook to receive updates from the Telegram bot.
2. **Message Handling**: Processes incoming text and audio messages, including voice notes.
3. **Audio Conversion**: Converts audio files from OGG to MP3 format using an external API.
4. **Transcription**: Transcribes the audio messages using OpenAI's Whisper API.
5. **Logging**: Logs all actions and errors to a specified Google Sheet for easy tracking and debugging.

## Services and APIs Used

1. **Telegram Bot API**:
   - Used to interact with Telegram for sending and receiving messages.
   - Set up the webhook to receive updates.
   - Send text messages back to users.

2. **Google Apps Script**:
   - Used for script execution, HTTP requests, and interaction with Google Sheets.

3. **CloudConvert API**:
   - Used for converting audio files from OGG format to MP3.
   - Supports various formats and provides a robust solution for audio conversion.

4. **OpenAI Whisper API**:
   - Used for transcribing audio files into text.
   - Capable of handling various audio formats and providing accurate transcriptions.

5. **Google Sheets**:
   - Used for logging bot activities and any errors encountered during execution.

## How It Works

### Initialization

- The script initializes with a JSON object (`CREDENTIALS`) that contains all the necessary API tokens and URLs for Telegram, Google Sheets, CloudConvert, and Whisper APIs.

### Webhook Setup

- **Function**: `setWebhook()`
- **Purpose**: Sets up the Telegram webhook using the bot token and the webhook URL provided in the credentials.
- **Usage**: Run this function after every deployment to update the webhook URL in Telegram.

### Message Handling

- **Function**: `doPost(e)`
- **Purpose**: Main entry point for handling incoming updates from Telegram. It processes incoming messages, determines if they contain audio files, and decides the appropriate action.
- **Key Operations**:
  - Logs the incoming message details.
  - Identifies if the message contains audio (either voice or other formats).
  - Initiates the audio processing pipeline if applicable.

### Audio Conversion

- **Function**: `convertOggToMp3(fileUrl, credentials, sheetUrl)`
- **Purpose**: Converts OGG audio files to MP3 format using CloudConvert API.
- **How It Works**:
  - Creates a job in CloudConvert using the provided file URL.
  - Polls the job status until conversion is complete.
  - Fetches the converted MP3 file and returns it for further processing.

### Transcription

- **Function**: `transcribeAudio(audioBlob, whisperApiUrl, whisperApiToken, sheetUrl)`
- **Purpose**: Transcribes the audio file into text using OpenAI's Whisper API.
- **How It Works**:
  - Sends the MP3 file to the Whisper API.
  - Receives and processes the transcription response.
  - Logs the transcription and detected language.

### Logging

- **Function**: `logDebugMessage(sheetUrl, message)`
- **Purpose**: Logs debug messages and errors to a specified Google Sheet.
- **How It Works**:
  - Appends the log message along with a timestamp to the Google Sheet.

### Sending Messages

- **Function**: `sendTGMessage(message, telegramToken, chatId, sheetUrl)`
- **Purpose**: Sends a message to a specified Telegram chat ID.
- **How It Works**:
  - Constructs the message payload and sends it via Telegram API.
  - Logs the message content and API response for debugging.

### Limitations Overcome

1. **Audio Format Compatibility**: Telegram voice messages are often in OGG format, which is not directly supported by Open AI Whipser API. The script uses CloudConvert to handle this conversion seamlessly.
   
2. **Message Length Constraints**: Telegram messages have a character limit. The script automatically splits long transcriptions into multiple parts and sends them sequentially.
   
3. **Error Handling and Debugging**: By logging all activities and errors to Google Sheets, the script provides an easy way to track issues and ensure reliable operation.

## Setup Instructions

1. **Create a Telegram Bot**: Use BotFather on Telegram to create your bot and obtain the bot token.
2. **Set Up Google Apps Script**: Create a new Google Apps Script project, copy the script, and update the `CREDENTIALS` object with your tokens and URLs.
3. **Google Sheets Logging**: Create a Google Sheet for logging and add its URL to the credentials.
4. **Deploy the Script**: Deploy the script as a web app and use the `setWebhook()` function to register the webhook URL with Telegram.

**Note:** You will need Open AI and CloudConvert accounts to use the APIs

## Usage

- The script will automatically process any incoming updates from Telegram once the webhook is set.
- Monitor the Google Sheet for logs and any potential errors.
