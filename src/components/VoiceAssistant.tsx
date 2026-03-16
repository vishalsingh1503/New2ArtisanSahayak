import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { processVoiceCommand } from '../services/geminiVoiceService';

interface VoiceAssistantProps {
  onNavigate: (page: string) => void;
  onAskAiQuestion: (question: string) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onNavigate, onAskAiQuestion }) => {
  const {
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
  } = useVoiceRecognition();

  useEffect(() => {
    if (voiceState === 'processing' && transcript) {
      handleVoiceCommand(transcript);
    }
  }, [voiceState, transcript]);

  const handleVoiceCommand = async (text: string) => {
    try {
      const result = await processVoiceCommand(text);
      setAiResponse(result.response);
      setVoiceState('response');
      speakResponse(result.response);

      // Execute intent
      switch (result.intent) {
        case 'navigate_dashboard':
          onNavigate('dashboard');
          break;
        case 'open_marketplace':
          onNavigate('community');
          break;
        case 'open_products':
          onNavigate('inventory');
          break;
        case 'add_product':
          onNavigate('add-product');
          break;
        case 'show_analytics':
          onNavigate('sales-dashboard');
          break;
        case 'ask_ai_question':
          onAskAiQuestion(text);
          break;
        case 'unknown':
        default:
          // Just spoke the response, no navigation
          break;
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to process command with AI.');
      setVoiceState('error');
    }
  };

  const toggleListening = () => {
    if (voiceState === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 flex flex-col items-center gap-4 pointer-events-none">
      <AnimatePresence>
        {voiceState !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-4 shadow-2xl max-w-[300px] backdrop-blur-xl pointer-events-auto"
          >
            {voiceState === 'listening' && (
              <div className="flex items-center gap-3 text-cyan-400">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </div>
                <span className="text-sm font-medium">Listening...</span>
              </div>
            )}
            
            {voiceState === 'processing' && (
              <div className="flex items-center gap-3 text-amber-400">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm font-medium">Processing command...</span>
              </div>
            )}

            {voiceState === 'response' && (
              <div className="flex items-center gap-3 text-emerald-400">
                <CheckCircle2 size={16} />
                <span className="text-sm font-medium">Done</span>
              </div>
            )}

            {voiceState === 'error' && (
              <div className="flex items-center gap-3 text-rose-400">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">Error</span>
              </div>
            )}

            {transcript && (
              <div className="mt-3 p-3 bg-black/20 rounded-xl">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">You said:</p>
                <p className="text-sm text-[var(--text-primary)]">"{transcript}"</p>
              </div>
            )}

            {aiResponse && voiceState === 'response' && (
              <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-xs text-emerald-500/70 uppercase tracking-widest mb-1">Assistant:</p>
                <p className="text-sm text-emerald-400">{aiResponse}</p>
              </div>
            )}

            {errorMsg && voiceState === 'error' && (
              <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <p className="text-xs text-rose-500/70 uppercase tracking-widest mb-1">Error:</p>
                <p className="text-sm text-rose-400">{errorMsg}</p>
              </div>
            )}

            {(voiceState === 'response' || voiceState === 'error') && (
              <button 
                onClick={() => setVoiceState('idle')}
                className="mt-4 w-full py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                Dismiss
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleListening}
        className={`p-4 rounded-full shadow-lg transition-all pointer-events-auto ${
          voiceState === 'listening' 
            ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/50' 
            : voiceState === 'processing'
            ? 'bg-amber-500 text-white shadow-amber-500/50'
            : voiceState === 'response'
            ? 'bg-emerald-500 text-white shadow-emerald-500/50'
            : 'bg-[var(--primary-color)] text-[var(--bg-color)] hover:scale-110 shadow-[var(--primary-color)]/30'
        }`}
      >
        {voiceState === 'listening' ? <MicOff size={32} /> : <Mic size={32} />}
      </button>
    </div>
  );
};
