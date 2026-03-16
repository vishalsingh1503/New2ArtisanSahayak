import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, ShoppingBag, Store, Sparkles, ChevronRight, Check } from 'lucide-react';
import { Language } from '../types';
import { useTranslation } from '../translations';

interface OnboardingProps {
  onComplete: () => void;
  language: Language;
}

export const Onboarding = ({ onComplete, language }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const t = useTranslation(language);

  const steps = [
    {
      title: "Welcome to Artisan Sahayak",
      description: "Your digital bridge to the global market. We help rural artisans like you showcase and sell your unique handmade crafts to the world.",
      icon: <Sparkles className="text-cyan-400" size={48} />,
      color: "from-cyan-500/20 to-blue-500/20"
    },
    {
      title: "Explore the Marketplace",
      description: "Discover beautiful crafts from across India. Browse categories, read artisan stories, and see what's trending in the community.",
      icon: <ShoppingBag className="text-purple-400" size={48} />,
      color: "from-purple-500/20 to-pink-500/20"
    },
    {
      title: "Your Voice is Your Power",
      description: "No need to type! Just tap the microphone button at the bottom and speak in your language. Try saying:\n• \"Show pottery products\"\n• \"Add new product\"\n• \"Open dashboard\"",
      icon: (
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500/40 blur-xl rounded-full animate-pulse" />
          <div className="relative bg-black/40 p-4 rounded-full border border-cyan-500/50">
            <Mic className="text-cyan-400" size={48} />
          </div>
        </div>
      ),
      color: "from-cyan-500/30 to-emerald-500/20",
      highlightMic: true
    },
    {
      title: "Manage Your Shop",
      description: "Track your inventory, monitor sales analytics, and share your products directly to WhatsApp. Your business, simplified.",
      icon: <Store className="text-emerald-400" size={48} />,
      color: "from-emerald-500/20 to-teal-500/20"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
      <div className="max-w-md w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`card p-8 bg-gradient-to-br ${steps[currentStep].color} border-white/10 relative overflow-hidden`}
          >
            {/* Decorative Background Elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-8">
              <div className="p-6 bg-black/40 rounded-3xl border border-white/5 shadow-2xl">
                {steps[currentStep].icon}
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  {steps[currentStep].title}
                </h2>
                <p className="text-white/60 leading-relaxed whitespace-pre-line">
                  {steps[currentStep].description}
                </p>
              </div>

              {/* Step Indicators */}
              <div className="flex gap-2">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      idx === currentStep ? 'w-8 bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]' : 'w-2 bg-white/10'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextStep}
                className="w-full group relative flex items-center justify-center gap-2 bg-white text-black py-4 rounded-2xl font-bold tracking-tight hover:bg-cyan-400 transition-all active:scale-95"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Start Using App <Check size={20} />
                  </>
                ) : (
                  <>
                    Next <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Skip Button */}
        <button
          onClick={onComplete}
          className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-white/40 hover:text-white font-mono text-[10px] uppercase tracking-[0.3em] transition-colors"
        >
          Skip Tutorial
        </button>
      </div>
    </div>
  );
};
