# Resonance

A real-time emotion visualization system that captures sentiment from voice and transforms it into an immersive visual and auditory experience.

## Overview

Resonance demonstrates full-stack orchestration by connecting React frontend, FastAPI backend, Deepgram transcription, and Groq sentiment analysis into a seamless real-time application. The system uses Perlin noise-driven generative art to visualize emotions through color, motion, and page-wide effects.

## Architecture

### Frontend (React)
- Captures audio via Web Audio API
- Streams to Deepgram via WebSocket for real-time transcription
- Manages UI state and visualization updates
- Renders emotion-driven p5.js canvas with Perlin noise

### Backend (FastAPI)
- Receives transcribed text from frontend
- Calls Groq LLM API for sentiment analysis
- Returns structured JSON with emotion, sentiment score, intensity, and keywords
- Handles CORS and error management

### External APIs
- **Deepgram**: Real-time speech-to-text transcription
- **Groq**: LLM-powered emotion analysis (llama-3.3-70b-versatile)

## Features

### Visualization
- Circular audio visualizer with 120 Perlin noise-driven bars
- Six distinct emotion mappings (happy, excited, calm, sad, angry, anxious)
- Real-time color transitions and motion behaviors
- Intensity-responsive bar heights and movement patterns

### UI Polish
- Keywords fade in gracefully with staggered animations
- Auto-scrolling transcript display
- Emotion label sizing based on intensity
- Page-wide visual effects per emotion (blur, shake, strobe, glitch)
- Background music synchronized to emotional state

### Error Handling
- Loading states during connection
- Processing indicators during analysis
- Error messages for backend/WebSocket failures
- 10-second timeout on API requests
- Graceful degradation on connection loss

## Tech Stack

**Frontend:**
- React 18
- p5.js / react-p5
- Deepgram SDK
- Web Audio API
- WebSocket

**Backend:**
- FastAPI
- httpx (async HTTP)
- Groq API
- Python 3.13

## Setup Instructions

### Prerequisites
- Node.js 16+
- Python 3.9+
- Deepgram API key (free $200 credits at https://console.deepgram.com/)
- Groq API key (free tier at https://console.groq.com/keys)

### Backend Setup
```bash
cd backend
pip install fastapi uvicorn httpx

# Create .env file
echo "GROQ_API_KEY=your_groq_api_key_here" > .env

# Run backend
uvicorn app:app --reload
```

Backend will run on `http://localhost:8000`

### Frontend Setup
```bash
cd frontend
npm install

# Create .env file
echo "REACT_APP_DEEPGRAM_API_KEY=your_deepgram_api_key_here" > .env

# Run frontend
npm start
```

Frontend will run on `http://localhost:3000`


### Music Files

Music files are included in `frontend/public/mp3s/` and will work automatically. If you want to use your own music:

1. Replace files in `frontend/public/mp3s/`
2. Keep the same filenames:
   - `happy.mp3`
   - `excited.mp3`
   - `calm.mp3`
   - `sad.mp3`
   - `angry.mp3`
   - `anxious.mp3`
3. Optionally adjust start times in `App.js` under `emotionMusic` object
   
## Usage

1. Click "Start" to begin recording
2. Speak naturally into your microphone
3. Watch the visualization respond in real-time to your emotional tone
4. Keywords and transcript appear in the bottom-left panel
5. Click "Stop" to end recording

## Emotion Mappings

### Happy
- Colors: Warm peach, soft yellow
- Motion: Taller, bouncy bars
- Effect: Bright, saturated display with gentle bounce animation

### Excited
- Colors: Hot magenta, electric cyan
- Motion: Tall, chaotic, jittery bars
- Effect: Rapid strobing and pulsing

### Calm
- Colors: Soft teal, muted sage
- Motion: Short, smooth, gentle bars
- Effect: Breathing animation, increased brightness

### Sad
- Colors: Deep indigo, slate blue
- Motion: Short, slow bars
- Effect: Blur and dimming across entire page

### Angry
- Colors: Crimson red, burnt orange
- Motion: Tall bars with violent shaking
- Effect: Screen shake and red flash

### Anxious
- Colors: Sickly yellow-green
- Motion: Unstable, extreme jitter
- Effect: Glitch and color distortion

## Design Decisions

### Perlin Noise
Used `p5.noise()` to generate smooth, organic variations in bar heights rather than jarring random movements. Each bar samples from a noise field that evolves over time, creating natural wave-like patterns.

### Sentence Buffering
Analyzes complete sentences rather than fragments to prevent rapid emotion switching mid-thought. Improves accuracy and visual stability.

### Emotion-Specific Behaviors
Beyond color changes, each emotion has unique motion characteristics (jitter intensity, shake patterns, bar height multipliers) to create distinct visual signatures.

### Intensity Amplification
Higher intensity values compound emotion-specific effects - excited becomes more chaotic, calm becomes more subdued, angry shakes more violently.

### Page-Wide Effects
CSS animations applied to the entire viewport reinforce emotional tone through blur, color filters, and motion, creating an immersive experience beyond the central visualizer.

## Project Structure
```
MemMach/
├── backend/
│   ├── app.py              # FastAPI server and Groq integration
│   └── .env                # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── App.css         # Animations and styles
│   │   └── AudioVisualizer.js  # p5.js visualization
│   ├── public/
│   │   └── mp3s/           # Background music files
│   └── .env                # Frontend environment variables
└── README.md
```

## Demo

[Link to demo video](https://youtu.be/dDiqqq7lF9w)

## Requirements Met

- Full-stack orchestration with real-time data flow
- Perlin noise-driven generative visualization
- Graceful keyword fade-in animations
- Auto-scrolling transcript display
- Comprehensive error handling and async management
- Smooth color and motion transitions
- Clean, modern UI with semi-transparent overlays

## Author

Guha Mahesh - Northeastern University
