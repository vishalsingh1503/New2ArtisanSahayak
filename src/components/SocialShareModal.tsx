import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Instagram, Twitter, Facebook, MessageCircle } from 'lucide-react';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    description: string;
    price: number | string;
    url?: string;
  };
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({ isOpen, onClose, product }) => {
  const productUrl = product.url || window.location.href;
  const encodedMessage = encodeURIComponent(
    `Check out this handmade product!\n\nProduct: ${product.name}\nDescription: ${product.description}\nPrice: ₹${product.price}\n\nView product here:\n${productUrl}`
  );

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={24} />,
      color: 'bg-[#25D366] text-white hover:bg-[#20bd5a]',
      url: `https://wa.me/?text=${encodedMessage}`,
    },
    {
      name: 'Facebook',
      icon: <Facebook size={24} />,
      color: 'bg-[#1877F2] text-white hover:bg-[#166fe5]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
    },
    {
      name: 'Twitter / X',
      icon: <Twitter size={24} />,
      color: 'bg-black text-white hover:bg-gray-800 border border-gray-700',
      url: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
    },
    {
      name: 'Instagram',
      icon: <Instagram size={24} />,
      color: 'bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white hover:opacity-90',
      action: () => {
        navigator.clipboard.writeText(decodeURIComponent(encodedMessage));
        alert('Text copied! Open Instagram to paste and share.');
        window.open('https://instagram.com', '_blank');
      },
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md card overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-[var(--glass-border)]">
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">Promote Product</h3>
              <button
                onClick={onClose}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--glass-bg)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {shareLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => {
                      if (link.action) {
                        link.action();
                      } else if (link.url) {
                        window.open(link.url, '_blank');
                      }
                    }}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl transition-transform hover:scale-105 active:scale-95 ${link.color}`}
                  >
                    {link.icon}
                    <span className="text-sm font-medium">{link.name}</span>
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--glass-border)]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[var(--card-bg)] text-[var(--text-muted)]">Or copy link</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm text-[var(--text-secondary)] truncate">
                  {productUrl}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 text-black font-medium rounded-xl hover:bg-cyan-400 transition-colors"
                >
                  <Copy size={18} />
                  Copy
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
