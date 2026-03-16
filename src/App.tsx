import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { User, Language } from './types';
import { api } from './api';
import { AuthPage } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { AddProduct } from './components/AddProduct';
import { Inventory } from './components/Inventory';
import { BankDetailsPage } from './components/BankDetails';
import { Trending } from './components/Trending';
import { HelpPage } from './components/Help';
import { CommunityFeed } from './components/CommunityFeed';
import { Profile } from './components/Profile';
import { SalesDashboard } from './components/SalesDashboard';
import { MarketInsights } from './components/MarketInsights';
import { VoiceAssistant } from './components/VoiceAssistant';
import { useTranslation } from './translations';

const LanguageSelection = ({ onSelect, currentLang, onCancel }: { onSelect: (lang: Language) => void, currentLang: Language, onCancel?: () => void }) => {
  const languages = Object.values(Language);
  const t = useTranslation(currentLang || Language.ENGLISH);
  return (
    <div className="p-8 futuristic-grid min-h-screen relative">
      {onCancel && (
        <button onClick={onCancel} className="absolute top-8 left-8 text-[var(--text-muted)] hover:text-[var(--text-primary)] font-mono text-xs uppercase tracking-widest">
          {t('abort')}
        </button>
      )}
      <h2 className="text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-2">{t('select_interface')}</h2>
      <p className="text-cyan-400/60 mb-8 font-mono text-xs uppercase tracking-widest">{t('system_localization_required')}</p>
      <div className="grid grid-cols-1 gap-4">
        {languages.map(lang => (
          <motion.button
            key={lang}
            whileHover={{ x: 10, backgroundColor: 'rgba(0, 240, 255, 0.1)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(lang)}
            className="card p-6 text-left flex justify-between items-center group"
          >
            <span className="text-xl font-medium text-[var(--text-primary)] group-hover:text-cyan-400 transition-colors">{lang}</span>
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${currentLang === lang ? 'border-cyan-400 bg-cyan-400/20' : 'border-[var(--glass-border)] group-hover:border-cyan-400/50'}`}>
              <div className={`w-2 h-2 rounded-full transition-all ${currentLang === lang ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]' : 'bg-[var(--text-muted)] group-hover:bg-cyan-400'}`} />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

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

import { Onboarding } from './components/Onboarding';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [needsLanguage, setNeedsLanguage] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isInitialLanguageSetup, setIsInitialLanguageSetup] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [geminiStatus, setGeminiStatus] = useState<'ok' | 'missing_key' | 'checking'>('checking');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const t = useTranslation(user?.language || Language.ENGLISH);

  useEffect(() => {
    if (!isDarkMode) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('artisan_token');
      if (token) {
        try {
          const userData = await api.get('/api/me');
          setUser({ ...userData, token });
          
          // Check if onboarding is needed
          const onboardingComplete = localStorage.getItem(`onboarding_complete_${userData.id}`);
          if (!onboardingComplete) {
            setShowOnboarding(true);
          }
        } catch (err: any) {
          // If user not found, just clear token silently and redirect to auth
          if (err.message?.includes('User not found')) {
            localStorage.removeItem('artisan_token');
          } else {
            console.error('Session restoration failed', err);
            localStorage.removeItem('artisan_token');
          }
        }
      }
    };

    const checkGemini = async () => {
      try {
        const health = await api.get('/api/health/gemini');
        setGeminiStatus(health.status);
      } catch (err) {
        setGeminiStatus('missing_key');
      }
    };

    restoreSession();
    checkGemini();
  }, []);

  const handleAuth = (u: User) => {
    setUser(u);
    if (!u.language) {
      setNeedsLanguage(true);
      setIsInitialLanguageSetup(true);
    }
    
    // Check onboarding for new login
    const onboardingComplete = localStorage.getItem(`onboarding_complete_${u.id}`);
    if (!onboardingComplete) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    if (user) {
      localStorage.setItem(`onboarding_complete_${user.id}`, 'true');
    }
    setShowOnboarding(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('artisan_token');
    setUser(null);
    setCurrentPage('dashboard');
  };

  const handleLanguageSelect = async (lang: Language) => {
    if (user) {
      try {
        await api.post('/api/user/language', { language: lang });
        setUser({ ...user, language: lang });
        setNeedsLanguage(false);
        setIsInitialLanguageSetup(false);
      } catch (err) {
        console.error('Failed to save language', err);
        setUser({ ...user, language: lang });
        setNeedsLanguage(false);
        setIsInitialLanguageSetup(false);
      }
    }
  };

  const handleAskAiQuestion = (question: string) => {
    // Navigate to help page with the question, or just show it
    setCurrentPage('help');
    // You could pass the question to the help page if it supported it
  };

  if (!user) {
    return <AuthPage onAuth={handleAuth} />;
  }

  if (needsLanguage) {
    return (
      <LanguageSelection 
        onSelect={handleLanguageSelect} 
        currentLang={user.language} 
        onCancel={isInitialLanguageSetup ? undefined : () => setNeedsLanguage(false)} 
      />
    );
  }

  return (
    <div className="mobile-container flex flex-col futuristic-grid relative">
      {/* Theme Toggle Button - Fixed in Corner */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed top-4 right-4 z-[300] p-3 rounded-full bg-[var(--card-bg)] border border-[var(--glass-border)] backdrop-blur-md hover:bg-[var(--glass-bg)] transition-all active:scale-95 shadow-lg group"
        aria-label="Toggle Theme"
      >
        {isDarkMode ? (
          <Sun size={20} className="text-yellow-400 group-hover:rotate-45 transition-transform duration-500" />
        ) : (
          <Moon size={20} className="text-blue-600 group-hover:-rotate-12 transition-transform duration-500" />
        )}
      </button>

      <AnimatePresence>
        {showOnboarding && (
          <Onboarding 
            language={user.language || Language.ENGLISH} 
            onComplete={handleOnboardingComplete} 
          />
        )}
      </AnimatePresence>

      {/* Persistent Language Switcher Trigger */}
      <button 
        onClick={() => setNeedsLanguage(true)}
        className="fixed top-6 right-6 z-[60] p-2 bg-[var(--card-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-lg text-[var(--text-secondary)] hover:text-cyan-400 hover:border-cyan-400/30 transition-all font-mono text-[10px] uppercase tracking-widest flex items-center gap-2"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
        {user.language || 'LANG'}
      </button>

      {geminiStatus === 'missing_key' && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-rose-500 text-white p-2 text-[10px] font-mono uppercase tracking-[0.2em] text-center shadow-lg">
          ⚠️ AI Features Disabled: GEMINI_API_KEY not configured in Secrets
        </div>
      )}

      <main className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {currentPage === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Dashboard 
                user={user} 
                onNavigate={setCurrentPage} 
                onLogout={handleLogout} 
                onChangeLanguage={() => setNeedsLanguage(true)}
              />
            </motion.div>
          )}
          {currentPage === 'add-product' && (
            <motion.div key="add-product" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AddProduct user={user} onBack={() => setCurrentPage('dashboard')} />
            </motion.div>
          )}
          {currentPage === 'inventory' && (
            <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Inventory user={user} onBack={() => setCurrentPage('dashboard')} onNavigate={setCurrentPage} />
            </motion.div>
          )}
          {currentPage === 'bank' && (
            <motion.div key="bank" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BankDetailsPage user={user} onBack={() => setCurrentPage('dashboard')} />
            </motion.div>
          )}
          {currentPage === 'trending' && (
            <motion.div key="trending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Trending onBack={() => setCurrentPage('dashboard')} user={user} />
            </motion.div>
          )}
          {currentPage === 'community' && (
            <motion.div key="community" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CommunityFeed user={user} onBack={() => setCurrentPage('dashboard')} />
            </motion.div>
          )}
          {currentPage === 'help' && (
            <motion.div key="help" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HelpPage onBack={() => setCurrentPage('dashboard')} user={user} />
            </motion.div>
          )}
          {currentPage === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Profile 
                user={user} 
                onBack={() => setCurrentPage('dashboard')} 
                onUpdateUser={(updatedFields) => setUser(prev => prev ? { ...prev, ...updatedFields } : null)}
              />
            </motion.div>
          )}
          {currentPage === 'sales-dashboard' && (
            <motion.div key="sales-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SalesDashboard user={user} onBack={() => setCurrentPage('dashboard')} />
            </motion.div>
          )}
          {currentPage === 'market-insights' && (
            <motion.div key="market-insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MarketInsights user={user} onBack={() => setCurrentPage('dashboard')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <VoiceAssistant 
        onNavigate={setCurrentPage} 
        onAskAiQuestion={handleAskAiQuestion} 
      />
    </div>
  );
}
