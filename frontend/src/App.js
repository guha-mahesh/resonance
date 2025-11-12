import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import AudioVisualizer from './AudioVisualizer';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [emotion, setEmotion] = useState('neutral');
  const [sentiment, setSentiment] = useState(0.5);
  const [intensity, setIntensity] = useState(0.5);
  const [keywords, setKeywords] = useState([]);
  const [prevKeywords, setPrevKeywords] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [sentenceBuffer, setSentenceBuffer] = useState([]);

  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const transcriptEndRef = useRef(null);

  const DEEPGRAM_API_KEY = process.env.REACT_APP_DEEPGRAM_API_KEY;
  const emotionMusic = {
    happy: {
      url: '/mp3s/happy.mp3',
      startTime: 35
    },
    excited: {
      url: '/mp3s/excited.mp3',
      startTime: 52
    },
    calm: {
      url: '/mp3s/calm.mp3',
      startTime: 250
    },
    sad: {
      url: '/mp3s/sad.mp3',
      startTime: 157
    },
    angry: {
      url: '/mp3s/angry.mp3',
      startTime: 0
    },
    anxious: {
      url: '/mp3s/anxious.mp3',
      startTime: 0
    },
    neutral: {
      url: '',
      startTime: 0
    }
  };

  const getPageEffects = () => {
    const effects = {
      excited: {
        animation: 'strobe 0.2s infinite, pulse 1s ease-in-out infinite',
        filter: 'saturate(1.5) contrast(1.2)',
        backgroundColor: 'rgba(255, 20, 147, 0.1)'
      },
      angry: {
        animation: 'shake 0.3s infinite, redFlash 0.5s infinite',
        filter: 'contrast(1.5) brightness(0.9) hue-rotate(-10deg)',
        backgroundColor: 'rgba(220, 20, 60, 0.1)'
      },
      sad: {
        filter: 'blur(2px) brightness(0.5) saturate(0.7)',
        animation: 'fadeInOut 4s ease-in-out infinite',
        backgroundColor: 'rgba(90, 106, 140, 0.2)'
      },
      anxious: {
        animation: 'glitch 0.5s infinite, jitter 0.1s infinite',
        filter: 'hue-rotate(10deg) contrast(1.3)',
        backgroundColor: 'rgba(184, 196, 107, 0.1)'
      },
      calm: {
        filter: 'brightness(1.1) saturate(0.9)',
        animation: 'breathe 5s ease-in-out infinite',
        backgroundColor: 'rgba(111, 168, 165, 0.1)'
      },
      happy: {
        filter: 'saturate(1.3) brightness(1.2)',
        animation: 'bounce 2s ease-in-out infinite',
        backgroundColor: 'rgba(255, 180, 162, 0.1)'
      },
      neutral: {
        filter: 'none',
        animation: 'none',
        backgroundColor: 'transparent'
      }
    };
    return effects[emotion] || effects.neutral;
  };

  const getLastSentences = (text, n = 2) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return sentences.slice(-n).join(' ');
  };

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  useEffect(() => {
    if (audioRef.current && emotionMusic[emotion] && emotionMusic[emotion].url) {
      const music = emotionMusic[emotion];
      audioRef.current.src = music.url;
      audioRef.current.currentTime = music.startTime;
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  }, [emotion]);

  useEffect(() => {
    if (keywords.length > 0 && JSON.stringify(keywords) !== JSON.stringify(prevKeywords)) {
      setPrevKeywords(keywords);
    }
  }, [keywords, prevKeywords]);

  const handleStart = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      socketRef.current = new WebSocket('wss://api.deepgram.com/v1/listen', [
        'token',
        DEEPGRAM_API_KEY
      ]);

      socketRef.current.onopen = () => {
        console.log('Deepgram connected');
        setIsConnecting(false);

        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: 'audio/webm'
        });

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0 && socketRef.current.readyState === 1) {
            socketRef.current.send(event.data);
          }
        };

        mediaRecorderRef.current.start(250);
        setIsRecording(true);
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection failed. Please check your internet and try again.');
        setIsConnecting(false);
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket closed');
        if (isRecording) {
          setError('Connection lost. Please restart recording.');
        }
      };

      socketRef.current.onmessage = async (message) => {
        const received = JSON.parse(message.data);
        const transcriptText = received.channel?.alternatives[0]?.transcript;

        if (transcriptText && transcriptText.trim() !== '') {
          console.log('Transcript:', transcriptText);
          setTranscript(prev => prev + ' ' + transcriptText);

          if (received.is_final) {
            const newBuffer = [...sentenceBuffer, transcriptText];
            setSentenceBuffer(newBuffer);

            if (newBuffer.length >= 1) {
              const combinedText = newBuffer.join(' ');

              try {
                setIsProcessing(true);
                const response = await fetch('http://localhost:8000/process_text', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ text: combinedText }),
                  signal: AbortSignal.timeout(10000)
                });

                if (!response.ok) {
                  throw new Error(`Backend error: ${response.status}`);
                }

                const data = await response.json();
                console.log('Backend response:', data);

                setEmotion(data.emotion);
                setSentiment(data.sentiment);
                setIntensity(data.intensity);
                setKeywords(data.keywords);
                setError(null);
                setSentenceBuffer([]);
              } catch (error) {
                console.error('Backend error:', error);
                setError('Analysis failed. Continuing transcription...');
              } finally {
                setIsProcessing(false);
              }
            }
          }
        }
      };
    } catch (error) {
      console.error('Startup error:', error);
      setError('Failed to access microphone. Please check permissions.');
      setIsConnecting(false);
    }
  };

  const handleStop = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (socketRef.current) {
      socketRef.current.close();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsRecording(false);
    setSentenceBuffer([]);
  };

  const pageStyle = getPageEffects();

  return (
    <div
      className="App"
      style={{
        ...pageStyle,
        transition: 'all 0.5s ease'
      }}
    >

      <audio ref={audioRef} loop />

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}>
        <AudioVisualizer
          sentiment={sentiment}
          emotion={emotion}
          intensity={intensity}
          keywords={keywords}
        />
      </div>

      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px'
      }}>
        <button
          onClick={isRecording ? handleStop : handleStart}
          disabled={isConnecting}
          style={{
            opacity: isConnecting ? 0.6 : 1,
            cursor: isConnecting ? 'not-allowed' : 'pointer'
          }}
        >
          {isConnecting ? 'Connecting...' : isRecording ? 'Stop' : 'Start'}
        </button>

        {isProcessing && (
          <div style={{
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '8px 20px',
            borderRadius: '20px',
            fontSize: '12px',
            animation: 'pulse 1s ease-in-out infinite'
          }}>
            Analyzing...
          </div>
        )}

        <div style={{
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '8px 20px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          🔊 30%
        </div>
      </div>

      {error && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          backgroundColor: 'rgba(220, 20, 60, 0.9)',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '10px',
          maxWidth: '300px',
          zIndex: 20,
          border: '2px solid rgba(255,255,255,0.3)'
        }}>
          {error}
        </div>
      )}

      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '20px',
        borderRadius: '15px',
        maxWidth: '450px',
        maxHeight: '180px',
        overflow: 'auto',
        backdropFilter: 'blur(15px)',
        zIndex: 10,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <p style={{
          fontSize: `${18 + intensity * 12}px`,
          fontWeight: 'bold',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          transition: 'font-size 0.5s ease'
        }}>
          {emotion}
        </p>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '15px'
        }}>
          {keywords.map((keyword, index) => (
            <span
              key={index}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '500',
                animation: 'fadeInUp 0.6s ease-out forwards',
                animationDelay: `${index * 0.15}s`,
                opacity: 0,
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              {keyword}
            </span>
          ))}
        </div>
        <div style={{
          fontSize: '13px',
          lineHeight: '1.4',
          opacity: 0.9,
          paddingTop: '10px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          maxHeight: '60px',
          overflow: 'auto'
        }}>
          <p>{getLastSentences(transcript)}</p>
          <div ref={transcriptEndRef} />
        </div>
      </div>
    </div>
  );
}

export default App;