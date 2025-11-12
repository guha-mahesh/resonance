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
