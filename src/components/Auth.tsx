import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mic, Volume2 } from 'lucide-react';
import { User, Language } from '../types';
import { api } from '../api';
import { useTranslation } from '../translations';

export const AuthPage = ({ onAuth }: { onAuth: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>(Language.ENGLISH);
  const t = useTranslation(currentLang);

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

  const startVoiceInput = (setter: (val: string) => void) => {
    if (!('webkitSpeechRecognition' in window)) return;
    // @ts-ignore
    const recognition = new webkitSpeechRecognition();
    recognition.lang = getLanguageTag(currentLang);
    recognition.start();
    setIsListening(true);
    recognition.onresult = (event: any) => {
      setter(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
  };

  const speakText = (text: string) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageTag(currentLang);
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/login' : '/api/signup';
      const body = isLogin ? { username, password } : { username, password, location, language: currentLang };
      const data = await api.post(endpoint, body);
      
      if (data.token) {
        localStorage.setItem('artisan_token', data.token);
        onAuth({ ...data.user, token: data.token });
      }
    } catch (err: any) {
      alert(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen futuristic-grid relative">
      {/* Language Switcher for Auth Page */}
      <div className="absolute top-8 right-8 flex gap-2 overflow-x-auto max-w-[200px] no-scrollbar">
        {Object.values(Language).map(lang => (
          <button
            key={lang}
            onClick={() => setCurrentLang(lang)}
            className={`px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-wider transition-all border ${currentLang === lang ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
          >
            {lang.substring(0, 3)}
          </button>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em] mb-2">{t('neural_link_protocol')}</p>
          <h1 className="text-4xl font-bold text-[var(--text-color)] tracking-tighter mb-2">Artisan-Sahayak</h1>
          <div className="h-0.5 w-12 bg-cyan-500 mx-auto rounded-full shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
        </div>

        {/* Auth Tabs */}
        <div className="flex p-1 bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)] mb-8">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all ${isLogin ? 'bg-cyan-500 text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all ${!isLogin ? 'bg-cyan-500 text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
          >
            Sign Up
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-end px-2">
              <label className="text-[10px] font-mono text-[var(--text-color)]/40 uppercase tracking-widest">{t('identifier')}</label>
              <span className="text-[8px] font-mono text-[var(--text-color)]/20 uppercase">Username</span>
            </div>
            <input 
              type="text" placeholder={isLogin ? "Enter Username" : "Create New Username"} 
              className="w-full p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500/50 outline-none transition-all placeholder:text-[var(--text-muted)]"
              value={username} onChange={e => setUsername(e.target.value)} required
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-end px-2">
              <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">{t('access_key')}</label>
              <span className="text-[8px] font-mono text-[var(--text-muted)]/50 uppercase">Password</span>
            </div>
            <input 
              type="password" placeholder="••••••••" 
              className="w-full p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500/50 outline-none transition-all placeholder:text-[var(--text-muted)]"
              value={password} onChange={e => setPassword(e.target.value)} required
            />
          </div>
          {!isLogin && (
            <div className="space-y-1">
              <div className="flex justify-between items-end px-2">
                <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">{t('geographic_node')}</label>
                <span className="text-[8px] font-mono text-[var(--text-muted)]/50 uppercase">Location</span>
              </div>
              <div className="relative">
                <input 
                  type="text" placeholder="Village / Town / City" 
                  className="w-full p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-[var(--text-primary)] focus:border-cyan-500/50 outline-none transition-all pr-12 placeholder:text-[var(--text-muted)]"
                  value={location} onChange={e => setLocation(e.target.value)} required
                />
                <div className="absolute right-4 top-4 flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => speakText(location)}
                    className="text-[var(--text-color)]/20 hover:text-[var(--text-color)]/40 transition-colors"
                    title="Listen"
                  >
                    <Volume2 size={20} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => startVoiceInput(setLocation)}
                    className={`transition-colors ${isListening ? 'text-cyan-400 animate-pulse' : 'text-[var(--text-color)]/20 hover:text-[var(--text-color)]/40'}`}
                  >
                    <Mic size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
          <button 
            disabled={loading}
            className="w-full neon-button py-4 mt-4 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLogin ? t('initialize_session').toUpperCase() : t('register_node').toUpperCase()}</span>
              </>
            )}
          </button>
        </form>
        
        <div className="mt-12 pt-8 border-t border-[var(--glass-border)] space-y-4">
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest text-center">System Overview</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)]">
              <p className="text-[9px] font-mono text-cyan-400 uppercase mb-1">Voice First</p>
              <p className="text-[10px] text-[var(--text-secondary)] leading-tight">Control everything with your voice in your language.</p>
            </div>
            <div className="p-3 bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)]">
              <p className="text-[9px] font-mono text-purple-400 uppercase mb-1">Global Reach</p>
              <p className="text-[10px] text-[var(--text-secondary)] leading-tight">AI optimized listings for Amazon & Flipkart.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
