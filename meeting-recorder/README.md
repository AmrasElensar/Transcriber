# Meeting Recorder & Transcriber

A powerful Angular application that records meetings in real-time, provides live transcription, and generates AI-powered summaries. Perfect for capturing meeting notes, action items, and key decisions.

## Features

- **Real-time Audio Recording**: High-quality audio recording with MediaRecorder API
  - **Multiple Audio Sources**: Record from microphone, system audio, or both
  - **Teams/Zoom Meeting Support**: Capture all meeting participants
  - **System Audio Capture**: Record any application audio (browser tabs, desktop apps)
- **Live Transcription**: Real-time speech-to-text conversion using Web Speech API
- **AI-Powered Summaries**: Generate structured meeting summaries with:
  - Key Points
  - Action Items
  - Decisions Made
  - Estimated Duration
- **Multiple AI Providers**: Support for:
  - Basic summarization (no API key required)
  - Ollama (local LLM)
  - llama.cpp (local LLM)
  - OpenAI GPT
  - Anthropic Claude
- **Recording Controls**: Start, Pause, Resume, and Stop functionality
- **Export Options**: Download transcripts and summaries as text files
- **Responsive Design**: Works on desktop and mobile devices
- **Timer**: Track meeting duration in real-time
- **Beautiful UI**: Modern, gradient-based design with smooth animations

## Browser Support

This application works best on:
- **Google Chrome** (recommended)
- **Microsoft Edge**

Note: Web Speech API support is required for transcription functionality.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Modern web browser (Chrome or Edge)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd meeting-recorder
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:4200/`

## Usage

### Selecting Audio Source

Before starting a recording, select your preferred audio source:

- **Microphone Only**: Records only your microphone input (default)
  - Best for: Solo recordings, voice memos
- **System Audio Only**: Records audio from your browser tab or application
  - Best for: Recording presentations, webinars you're attending
- **Both (Microphone + System Audio)**: Records both your microphone and system audio
  - Best for: Teams meetings, Zoom calls, any meeting where you need both sides

### Recording a Regular Meeting

1. Select **"Microphone Only"** as the audio source
2. Click the **"Start Recording"** button
3. Allow microphone access when prompted
4. Speak clearly into your microphone
5. The transcription will appear in real-time

### Recording Teams/Zoom Meetings

1. Select **"Both (Microphone + System Audio)"** as the audio source
2. Click the **"Start Recording"** button
3. Allow microphone access when prompted
4. When prompted to share screen:
   - Select the **browser tab** running your Teams/Zoom meeting
   - **Important**: Check the box for **"Share tab audio"** or **"Share system audio"**
   - Click **"Share"**
5. All meeting participants will now be recorded along with your voice
6. The transcription will capture all audio in real-time

**Note**: For Teams/Zoom meetings in the desktop app, you may need to:
- Open Teams/Zoom in your browser instead, OR
- Select "System Audio Only" and have your microphone directly in the meeting

### Controlling the Recording

- **Pause**: Temporarily pause the recording
- **Resume**: Continue recording after pausing
- **Stop**: End the recording session

### Generating a Summary

1. After stopping the recording, click **"Generate Summary"**
2. Wait for the AI to process the transcript
3. View the structured summary with key points, action items, and decisions

### Exporting Data

- **Download Transcript**: Export the full transcript as a text file
- **Download Summary**: Export the structured summary as a text file

## AI Provider Configuration

### Basic Mode (Default)

No configuration needed. Uses client-side text processing to extract:
- Action items (sentences with "will", "should", "need to", etc.)
- Decisions (sentences with "decided", "agreed", "concluded", etc.)
- Key points (substantive sentences)

### Ollama (Local LLM) - Recommended for Privacy

Ollama allows you to run powerful language models locally on your machine, ensuring complete privacy.

**Prerequisites:**
1. Install Ollama from https://ollama.ai
2. Download a model:
   ```bash
   ollama pull llama3.2
   # or
   ollama pull mistral
   # or
   ollama pull phi3
   ```
3. Ensure Ollama is running (it starts automatically after installation)

**Configuration:**
1. Click the **Settings** icon (⚙️)
2. Select **"Ollama (Local LLM)"** as the AI Provider
3. (Optional) Customize the endpoint if not using default: `http://localhost:11434`
4. (Optional) Specify model name (default: `llama3.2`)
5. Click **"Save Settings"**

**Benefits:**
- Complete privacy - no data leaves your machine
- No API costs
- Works offline
- Fast responses with a good GPU

### llama.cpp (Local LLM)

llama.cpp is a C++ implementation for running LLMs locally with minimal dependencies.

**Prerequisites:**
1. Install llama.cpp from https://github.com/ggerganov/llama.cpp
2. Download a GGUF model file (e.g., Llama 3.2, Mistral, Phi-3)
3. Start the server:
   ```bash
   ./server -m /path/to/model.gguf --port 8080
   ```

**Configuration:**
1. Click the **Settings** icon (⚙️)
2. Select **"llama.cpp (Local LLM)"** as the AI Provider
3. (Optional) Customize the endpoint if not using default: `http://localhost:8080`
4. Click **"Save Settings"**

**Benefits:**
- Complete privacy - no data leaves your machine
- No API costs
- Works offline
- Minimal resource usage
- Cross-platform support

### OpenAI GPT

1. Click the **Settings** icon (⚙️)
2. Select **"OpenAI GPT"** as the AI Provider
3. Enter your OpenAI API key
4. Click **"Save Settings"**

Your API key is stored locally in your browser and never sent to our servers.

### Anthropic Claude

1. Click the **Settings** icon (⚙️)
2. Select **"Anthropic Claude"** as the AI Provider
3. Enter your Anthropic API key
4. Click **"Save Settings"**

## Project Structure

```
meeting-recorder/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── meeting-recorder/
│   │   │       ├── meeting-recorder.ts        # Main component logic
│   │   │       ├── meeting-recorder.html      # Component template
│   │   │       └── meeting-recorder.scss      # Component styles
│   │   ├── services/
│   │   │   ├── audio-recorder.ts              # Audio recording service
│   │   │   ├── transcription.ts               # Speech-to-text service
│   │   │   └── summary.ts                     # AI summarization service
│   │   ├── app.ts                             # Root component
│   │   └── app.html                           # Root template
│   ├── styles.scss                            # Global styles
│   └── index.html                             # Main HTML file
├── package.json
└── README.md
```

## Services

### AudioRecorder Service

Handles audio recording using the MediaRecorder API:
- Manages microphone access
- Records audio in multiple formats (WebM, Ogg, MP4)
- Provides recording state management
- Implements pause/resume functionality

### Transcription Service

Manages real-time speech-to-text conversion:
- Uses Web Speech API for live transcription
- Handles continuous recognition
- Provides interim and final results
- Auto-restarts on interruption

### Summary Service

Generates meeting summaries using various methods:
- Basic: Client-side text processing
- Ollama: Local LLM integration (llama3.2, mistral, phi3, etc.)
- llama.cpp: Local LLM integration with GGUF models
- OpenAI: GPT-4o-mini API integration
- Anthropic: Claude 3.5 Sonnet API integration

## Building for Production

To build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/meeting-recorder/` directory.

## Development

### Running Tests

```bash
npm test
```

### Code Scaffolding

Generate new components:
```bash
ng generate component component-name
```

Generate new services:
```bash
ng generate service service-name
```

## Technologies Used

- **Angular 20**: Web framework
- **TypeScript**: Programming language
- **SCSS**: Styling
- **RxJS**: Reactive programming
- **MediaRecorder API**: Audio recording
- **Web Audio API**: Audio stream mixing and processing
- **getDisplayMedia API**: System audio capture
- **Web Speech API**: Speech recognition
- **Ollama**: Local LLM inference (optional)
- **llama.cpp**: Local LLM inference (optional)
- **OpenAI API**: Cloud AI summarization (optional)
- **Anthropic API**: Cloud AI summarization (optional)

## Security & Privacy

- All recordings and transcriptions are processed locally in your browser
- **Local LLM Options (Ollama/llama.cpp)**: Complete privacy - no data ever leaves your machine
- **Cloud AI Options (OpenAI/Anthropic)**: Transcripts are sent to external APIs only when generating summaries
- API keys are stored locally in your browser's memory
- No data is persisted to disk without explicit user action (download)
- For maximum privacy, use Basic mode or local LLM providers (Ollama/llama.cpp)

## Troubleshooting

### Microphone Not Working

1. Check browser permissions
2. Ensure microphone is connected and working
3. Try refreshing the page
4. Check browser console for errors

### Transcription Not Working

1. Verify you're using Chrome or Edge
2. Check that Web Speech API is supported
3. Ensure you have an active internet connection (required for Web Speech API)
4. Speak clearly and at a moderate pace

### Summary Generation Fails

1. Check your API key is correct (if using OpenAI or Anthropic)
2. Verify you have API credits available
3. Check browser console for detailed error messages
4. Try using Basic mode instead

### Local LLM Not Working (Ollama/llama.cpp)

**Ollama:**
1. Verify Ollama is running: `ollama list`
2. Test the API: `curl http://localhost:11434/api/generate -d '{"model":"llama3.2","prompt":"Hello"}'`
3. Ensure the model is downloaded: `ollama pull llama3.2`
4. Check CORS settings - you may need to configure Ollama to allow browser requests
5. Try restarting Ollama: `ollama serve`

**llama.cpp:**
1. Verify the server is running: `curl http://localhost:8080/health`
2. Ensure you started the server with the correct model path
3. Check that the port isn't blocked by a firewall
4. Start server with CORS enabled if needed: `./server -m model.gguf --host 0.0.0.0 --port 8080`

### System Audio Not Recording (Teams/Zoom)

1. **Make sure you're using Chrome or Edge** - Firefox has limited system audio support
2. **Check "Share tab audio" when prompted**:
   - When the screen sharing dialog appears, look for "Share tab audio" checkbox
   - On some systems it may say "Share system audio" or "Share audio"
   - This checkbox is easy to miss - look carefully at the bottom of the dialog
3. **For Teams/Zoom meetings**:
   - Use the browser version (web.teams.microsoft.com or zoom.us/join)
   - Desktop apps require additional setup
4. **If no audio is captured**:
   - Stop the recording
   - Select "Both (Microphone + System Audio)" again
   - Make sure to check the audio sharing checkbox this time
5. **Test your setup**:
   - Try recording a YouTube video first to verify system audio works
   - If YouTube works but Teams doesn't, the issue is with Teams audio permissions

### No Audio in Recording

1. Check that audio is playing from the source (Teams/Zoom)
2. Verify system volume is not muted
3. Try closing and reopening the browser
4. Check browser's site permissions for microphone and screen sharing
5. Try selecting a different audio source option

## Known Limitations

- Web Speech API requires an active internet connection
- Transcription accuracy depends on audio quality and accent
- Recording may pause automatically after extended periods (browser limitation)
- API costs apply when using OpenAI or Anthropic providers
- Local LLMs require separate installation and may have higher hardware requirements
- CORS configuration may be needed for local LLM servers to work with the browser

## Future Enhancements

- Support for multiple languages
- Speaker identification
- Audio waveform visualization
- Meeting templates
- Integration with calendar apps
- Cloud storage for recordings
- Collaboration features

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on the GitHub repository.

## Acknowledgments

- Angular team for the excellent framework
- Ollama team for making local LLM inference accessible
- llama.cpp contributors for efficient local LLM implementation
- OpenAI and Anthropic for cloud AI capabilities
- Web Speech API for transcription functionality
