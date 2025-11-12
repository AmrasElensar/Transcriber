# Meeting Recorder & Transcriber

A powerful Angular application that records meetings in real-time, provides live transcription, and generates AI-powered summaries. Perfect for capturing meeting notes, action items, and key decisions.

## Features

- **Real-time Audio Recording**: High-quality audio recording with MediaRecorder API
- **Live Transcription**: Real-time speech-to-text conversion using Web Speech API
- **AI-Powered Summaries**: Generate structured meeting summaries with:
  - Key Points
  - Action Items
  - Decisions Made
  - Estimated Duration
- **Multiple AI Providers**: Support for:
  - Basic summarization (no API key required)
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

### Recording a Meeting

1. Click the **"Start Recording"** button
2. Allow microphone access when prompted
3. Speak clearly into your microphone
4. The transcription will appear in real-time

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

### OpenAI GPT

1. Click the **Settings** icon (⚙️)
2. Select **"OpenAI GPT"** as the AI Provider
3. Enter your OpenAI API key
4. Click **"Save Settings"**

Your API key is stored locally in your browser and never sent to external servers.

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
- **Web Speech API**: Speech recognition
- **OpenAI API**: Optional AI summarization
- **Anthropic API**: Optional AI summarization

## Security & Privacy

- All recordings and transcriptions are processed locally in your browser
- No audio or transcript data is sent to external servers (except for AI summarization when configured)
- API keys are stored locally in your browser's memory
- No data is persisted to disk without explicit user action (download)

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

## Known Limitations

- Web Speech API requires an active internet connection
- Transcription accuracy depends on audio quality and accent
- Recording may pause automatically after extended periods (browser limitation)
- API costs apply when using OpenAI or Anthropic providers

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
- OpenAI and Anthropic for AI capabilities
- Web Speech API for transcription functionality
