import { useState, useCallback, useEffect, useRef } from 'react';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'response' | 'error';

export const useVoiceRecognition = () => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US'; // Could be dynamic based on user language

      recognition.onstart = () => {
        setVoiceState('listening');
        setTranscript('');
        setAiResponse('');
        setErrorMsg('');
      };

      recognition.onresult = (event: any) => {
        const currentTranscript = event.results[0][0].transcript;
        setTranscript(currentTranscript);
        setVoiceState('processing');
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone permission denied.');
        } else if (event.error === 'no-speech') {
          setErrorMsg('No speech detected.');
        } else {
          setErrorMsg(`Speech recognition failed: ${event.error}`);
        }
        setVoiceState('error');
      };

      recognition.onend = () => {
        // If it ended without a result or error, it might just be idle
        setVoiceState((prev) => (prev === 'listening' ? 'idle' : prev));
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start recognition', err);
      }
    } else {
      setErrorMsg('Speech Recognition API not supported in this browser.');
      setVoiceState('error');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const speakResponse = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return {
    voiceState,
    setVoiceState,
    transcript,
    aiResponse,
    setAiResponse,
    errorMsg,
    setErrorMsg,
    startListening,
    stopListening,
    speakResponse
  };
};
