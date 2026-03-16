import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { api } from '../api';

import { User, Language } from '../types';
import { useTranslation } from '../translations';

export const Trending = ({ onBack, user }: { onBack: () => void, user: User }) => {
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Most sold');
  const t = useTranslation(user?.language || Language.ENGLISH);

  const categories = ['All', 'Pottery', 'Handicrafts', 'Paintings', 'Regional Art', 'Botanical crafts'];
  const sortOptions = ['Most sold', 'Highest rated', 'Recently added'];

  useEffect(() => {
    setLoading(true);
    api.get('/api/trending').then(data => {
      let filtered = data;
      if (activeCategory !== 'All') {
        filtered = data.filter((item: any) => item.category === activeCategory);
      }
      
      // Mock sorting
      if (sortBy === 'Highest rated') {
        filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (sortBy === 'Recently added') {
        filtered = [...filtered].reverse();
      }
      
      setTrending(filtered);
      setLoading(false);
    });
  }, [activeCategory, sortBy]);

  return (
    <div className="p-6 futuristic-grid min-h-screen pb-32">
      <button onClick={onBack} className="mb-8 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-mono text-xs uppercase tracking-widest">
        <ArrowLeft size={16} className="mr-2" /> {t('return')}
      </button>
      
      <div className="mb-8">
        <p className="text-[10px] font-mono text-[var(--primary-color)] uppercase tracking-[0.3em] mb-1">Market Intelligence</p>
        <h2 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">{t('trending_assets')}</h2>
      </div>

      {/* Filters */}
      <div className="space-y-6 mb-10">
        <div className="space-y-3">
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Categories</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl font-mono text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat ? 'bg-[var(--primary-color)] text-black border-[var(--primary-color)] shadow-[0_0_15px_rgba(255,140,0,0.3)]' : 'bg-[var(--glass-bg)] text-[var(--text-muted)] border-[var(--glass-border)] hover:border-[var(--primary-color)]/30'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Sort By</p>
          <div className="flex gap-2">
            {sortOptions.map(opt => (
              <button
                key={opt}
                onClick={() => setSortBy(opt)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest transition-all border ${sortBy === opt ? 'text-[var(--primary-color)] border-[var(--primary-color)]/50 bg-[var(--primary-color)]/5' : 'text-[var(--text-muted)] border-[var(--glass-border)]'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 card animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {trending.length === 0 ? (
            <div className="text-center py-20 card border-dashed border-[var(--glass-border)]">
              <p className="text-[var(--text-muted)] font-mono text-xs uppercase tracking-widest">No assets found in this category</p>
            </div>
          ) : (
            trending.map(item => (
              <div key={item.id} className="card overflow-hidden border-[var(--glass-border)] group">
                <div className="relative h-56 overflow-hidden">
                  <img src={item.photo_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full">
                    <p className="text-[10px] font-mono font-bold text-[var(--primary-color)] uppercase tracking-widest">Hot_Signal</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">{item.category}</p>
                      <h3 className="font-bold text-xl text-[var(--text-primary)] tracking-tight">{item.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[var(--text-primary)] text-lg mono">₹ {item.price}</p>
                      <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider mt-1">{item.views} Index_Hits</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
