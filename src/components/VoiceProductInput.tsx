import React, { useState, useRef } from 'react';
import { Mic, Loader2, Sparkles } from 'lucide-react';
import { useTranslation } from '../translations';
import { Language } from '../types';
import { extractDetailsFromSpeech, ExtractedProductDetails } from '../services/speechToProductDetails';

interface VoiceProductInputProps {
  language: Language;
  onDetailsExtracted: (details: ExtractedProductDetails) => void;
}

export const VoiceProductInput: React.FC<VoiceProductInputProps> = ({ language, onDetailsExtracted }) => {
  const t = useTranslation(language);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const getLanguageTag = (lang: Language) => {
    switch (lang) {
      case Language.HINDI: return 'hi-IN';
      case Language.PUNJABI: return 'pa-IN';
      case Language.MARATHI: return 'mr-IN';
      case Language.BENGALI: return 'bn-IN';
      case Language.TAMIL: return 'ta-IN';
      case Language.TELUGU: return 'te-IN';
      case Language.GUJARATI: return 'gu-IN';
      case Language.ENGLISH: return 'en-IN';
      default: return 'en-IN';
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      processTranscript(transcript);
      return;
    }

    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    // @ts-ignore
    const recognition = new webkitSpeechRecognition();
    recognition.lang = getLanguageTag(language);
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcript) {
        processTranscript(transcript);
      }
    };
    
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    setTranscript('');
    recognition.start();
    setIsListening(true);
  };

  const processTranscript = async (text: string) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    try {
      const details = await extractDetailsFromSpeech(text);
      onDetailsExtracted(details);
    } catch (error) {
      console.error('Failed to extract details from speech:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="card p-6 space-y-4 border-[var(--glass-border)]">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Voice Description</h3>
        {transcript && !isListening && (
          <button onClick={() => setTranscript('')} className="text-[10px] font-mono text-rose-400 uppercase">Clear</button>
        )}
      </div>
      
      <div className="relative">
        <textarea 
          value={transcript}
          onChange={e => setTranscript(e.target.value)}
          placeholder="Describe your product (e.g., 'This pot is 30cm tall, weighs 1.5kg and is made of clay.')"
          className="w-full bg-transparent border-none text-[var(--text-primary)] text-sm leading-relaxed focus:ring-0 resize-none h-32 placeholder:text-[var(--text-muted)]"
          disabled={isListening || isProcessing}
        />
        <div className="absolute bottom-0 right-0 flex gap-2">
          {isProcessing ? (
            <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : (
            <button 
              onClick={toggleVoiceInput}
              className={`p-4 rounded-2xl transition-all ${isListening ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] text-white' : 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/20 hover:bg-[var(--primary-color)]/20'}`}
            >
              <Mic size={24} className={isListening ? 'animate-pulse' : ''} />
            </button>
          )}
        </div>
      </div>
      
      {isListening && (
        <p className="text-[10px] font-mono text-rose-400 animate-pulse uppercase tracking-widest">Listening...</p>
      )}
      {isProcessing && (
        <p className="text-[10px] font-mono text-cyan-400 animate-pulse uppercase tracking-widest flex items-center gap-1">
          <Sparkles size={12} /> Extracting details...
        </p>
      )}
    </div>
  );
};
