import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  ChevronRight, 
  Book, 
  Shield 
} from 'lucide-react';
import { User, Language } from '../types';
import { useTranslation } from '../translations';

export const HelpPage = ({ onBack, user }: { onBack: () => void, user: User }) => {
  const t = useTranslation(user?.language || Language.ENGLISH);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How to list a product?",
      a: "Click on the '+' button on the dashboard. You can upload a photo and tell the story of your craft using voice or text. Our AI will automatically generate a professional listing for you."
    },
    {
      q: "How to contact buyers?",
      a: "Once a buyer shows interest, you will receive a notification. You can then communicate with them through the 'Community' or 'Orders' section (coming soon)."
    },
    {
      q: "How to manage orders?",
      a: "Navigate to your 'Inventory' to see active listings. When an order is placed, you'll get a neural alert with shipping instructions."
    },
    {
      q: "Payment process explanation",
      a: "Payments are processed securely through our platform. Once the buyer confirms receipt, funds are transferred to your linked bank account within 2-3 business days."
    }
  ];

  return (
    <div className="p-6 futuristic-grid min-h-screen pb-32">
      <header className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Help Center</h2>
      </header>

      {/* Support Section */}
      <section className="space-y-6 mb-12">
        <h3 className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Direct Support</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="card p-5 flex items-center gap-4 border-orange-500/20 bg-orange-500/5">
            <div className="p-3 bg-orange-500/20 rounded-xl text-[var(--primary-color)]">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Mobile Support</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">+91 98765 43210</p>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4 border-cyan-500/20 bg-cyan-500/5">
            <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Email Support</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">support@artisan.in</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-6">
        <h3 className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="card overflow-hidden border-[var(--glass-border)]">
              <button 
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full p-5 flex justify-between items-center text-left"
              >
                <span className="font-bold text-[var(--text-primary)]">{faq.q}</span>
                <ChevronRight size={18} className={`text-[var(--text-muted)] transition-transform ${activeFaq === i ? 'rotate-90' : ''}`} />
              </button>
              <AnimatePresence>
                {activeFaq === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-5 pb-5"
                  >
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--glass-border)] pt-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="mt-12 space-y-4">
        <h3 className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Quick Resources</h3>
        <div className="grid grid-cols-2 gap-4">
          <button className="card p-4 flex flex-col items-center gap-2 text-center hover:border-[var(--primary-color)]/30 transition-all">
            <Book size={20} className="text-[var(--primary-color)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest">User Guide</span>
          </button>
          <button className="card p-4 flex flex-col items-center gap-2 text-center hover:border-cyan-400/30 transition-all">
            <Shield size={20} className="text-cyan-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest">Safety Tips</span>
          </button>
        </div>
      </section>
    </div>
  );
};
