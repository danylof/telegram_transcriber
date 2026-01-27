# telegram_transcriber

A Google Apps Script bot that transcribes voice messages, audio files, and video notes sent to Telegram. Supports multiple transcription providers: **Google Gemini**, **OpenAI Whisper**, and **AssemblyAI**.

## Features

- 🎙️ Transcribe voice messages and audio files
- 🎬 Transcribe video notes (circular video messages) - Gemini only
- 🌍 Automatic language detection
- 🤖 Bot commands (`/start`, `/help`, `/status`, `/provider`, `/about`)
- 📊 Debug logging to Google Sheets (with sensitive data redaction)
- 🔄 Audio format conversion (OGG to MP3) via CloudConvert
- 🔌 Multiple transcription provider support
- 🔐 Secure credential storage using Script Properties
- ✅ Built-in test suite

## Supported Transcription Providers

| Provider | Free Tier | Video Notes | Best For |
|----------|-----------|-------------|----------|
| **Google Gemini** | 15 req/min, 1M tokens/day | ✅ Yes | Google Workspace users, video notes |
| **OpenAI Whisper** | Pay-as-you-go (~$0.006/min) | ❌ No | High accuracy, many languages |
| **AssemblyAI** | 100 hours free | ❌ No | New users, good accuracy |

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and quick start guide |
| `/help` | Show all available commands |
| `/status` | Check bot status and configuration |
| `/provider` | Show current transcription provider info |
| `/about` | About this bot |

## Platform: Google Apps Script

This bot runs on [Google Apps Script](https://script.google.com/) - a free serverless platform by Google.

**Free Tier Limits (more than enough for personal use):**
| Resource | Daily Limit |
|----------|-------------|
| Script runtime | 6 hours total |
| URL Fetch calls | 20,000 |
| Triggers | 20 |
| Execution time | 6 min per run |

**Access your scripts:** [script.google.com](https://script.google.com/)

## Setup

### 1. Create a Telegram Bot

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` and follow the prompts
3. Save your bot token

### 2. Get Your Transcription API Key

Choose one provider and get your API key:

- **Gemini**: [Google AI Studio](https://aistudio.google.com/app/apikey) - Click "Create API Key"
- **OpenAI**: [OpenAI Platform](https://platform.openai.com/api-keys) - Create new secret key
- **AssemblyAI**: [AssemblyAI Dashboard](https://www.assemblyai.com/dashboard/signup) - Copy from dashboard

### 3. Set Up Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Copy the contents of `telegram_bot.gs` into the editor

### 4. Configure Credentials (Secure Method)

Credentials are stored securely in Script Properties, not in the code.

**Option A: Use the Setup Wizard**
1. Run `setupCredentials()` from the Apps Script editor
2. Follow the prompts to enter each credential

**Option B: Manual Configuration**
1. Go to **Project Settings** (gear icon) > **Script Properties**
2. Add the following properties:

| Property | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | ✅ | Your bot token from BotFather |
| `WEBHOOK_URL` | ✅ | Web app URL (set after first deploy) |
| `CHAT_ID` | ✅ | Your Telegram chat ID |
| `SHEET_URL` | ✅ | Google Sheet URL for logging |
| `TRANSCRIPTION_PROVIDER` | ✅ | `gemini`, `openai`, or `assemblyai` |
| `GEMINI_API_KEY` | If using Gemini | Your Gemini API key |
| `OPENAI_API_KEY` | If using OpenAI | Your OpenAI API key |
| `ASSEMBLYAI_API_KEY` | If using AssemblyAI | Your AssemblyAI API key |
| `CONVERSION_API_URL` | Optional | CloudConvert API URL |
| `CONVERSION_API_KEY` | Optional | CloudConvert API key |

> **💡 Provider Selection:** The bot uses **only** the provider set in `TRANSCRIPTION_PROVIDER`. If you have multiple API keys configured, only the one matching your chosen provider is used. There's no automatic fallback - if your chosen provider fails, you'll need to manually switch to another.
>
> **Recommendation:** You can configure multiple API keys and switch between providers by just changing `TRANSCRIPTION_PROVIDER` - useful if you hit rate limits or want to compare quality.

### 5. Create a Google Sheet for Logging

1. Create a new Google Sheet
2. Copy the URL and add it as `SHEET_URL` in Script Properties

### 6. Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Select type: **Web app**
3. Set "Execute as": **Me**
4. Set "Who has access": **Anyone**
5. Click **Deploy** and authorize
6. Copy the web app URL
7. Add it as `WEBHOOK_URL` in Script Properties

### 7. Set Up Webhook & Test

1. Run `setWebhook()` to connect your bot
2. Run `runAllTests()` to verify everything works
3. Your bot is ready!

## Testing

The bot includes a test suite to verify your setup:

```javascript
runAllTests()      // Run all tests
testCredentials()  // Test credential loading
testTelegram()     // Send a test message
testLogging()      // Test Google Sheets logging
testWebhookProcessing() // Test webhook parsing
```

## Usage

Send a voice message, audio file, or video note to your Telegram bot:

**Voice Messages & Audio Files:**
1. ✅ Bot acknowledges with "Transcribing your audio..."
2. Downloads and processes the audio
3. Transcribes using your chosen provider
4. Sends the transcription back with detected language

**Video Notes (Gemini only):**
1. ✅ Bot acknowledges with "Transcribing your video note..."
2. Downloads the video
3. Gemini extracts and transcribes the audio
4. Sends the transcription back

> ⚠️ Video notes are only supported with Gemini provider. Other providers will prompt to switch or use voice messages.

## Configuration Options

### Switching Providers

Change `TRANSCRIPTION_PROVIDER` in Script Properties:

- `gemini` - Google Gemini (default)
- `openai` - OpenAI Whisper
- `assemblyai` - AssemblyAI

### CloudConvert (Optional)

CloudConvert converts OGG audio to MP3. Needed for OpenAI; Gemini handles OGG natively.

1. Sign up at [CloudConvert](https://cloudconvert.com/)
2. Get your API key
3. Set `CONVERSION_API_KEY` in Script Properties

## Security

- ✅ Credentials stored in Script Properties (not in code)
- ✅ Sensitive data automatically redacted from logs
- ✅ No API keys exposed in source control

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Missing required credentials" | Run `setupCredentials()` or check Script Properties |
| No response from bot | Run `testTelegram()` to verify connection |
| Webhook errors | Run `setWebhook()` after updating `WEBHOOK_URL` |
| Transcription fails | Check API key for your provider |

Check the Google Sheet for detailed debug logs.

## License

See [LICENSE](LICENSE) file for details.
