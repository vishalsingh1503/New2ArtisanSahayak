import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  LogOut, 
  Plus, 
  Bell,
  ChevronRight,
  IndianRupee,
  Zap,
  Sparkles,
  Heart,
  MessageSquare,
  Share2,
  MapPin,
  Flame,
  ArrowUpRight,
  Languages,
  HelpCircle
} from 'lucide-react';
import { User, Language, MarketTrends } from '../types';
import { useTranslation } from '../translations';
import { getMarketTrends } from '../services/aiService';
import { api } from '../api';
import { TOTAL_REVENUE, SALES_HISTORY, REVENUE_BY_TIMEFRAME, PREVIOUS_ACTIVE_LISTINGS } from '../constants/financial';

export const Dashboard = ({ 
  user, 
  onNavigate, 
  onLogout, 
  onChangeLanguage 
}: { 
  user: User, 
  onNavigate: (page: string) => void, 
  onLogout: () => void,
  onChangeLanguage: () => void 
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [trends, setTrends] = useState<MarketTrends | null>(null);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [salesTimeframe, setSalesTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  
  const t = useTranslation(user?.language || Language.ENGLISH);

  useEffect(() => {
    const fetchTrends = async () => {
      setIsLoadingTrends(true);
      try {
        const data = await getMarketTrends(user.language);
        setTrends(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingTrends(false);
      }
    };

    const fetchCommunity = async () => {
      try {
        const response = await api.get('/api/community');
        setCommunityPosts(response);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/products');
        setProducts(response);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTrends();
    fetchCommunity();
    fetchProducts();
  }, [user.language]);

  const activeListingsCount = products.filter(p => p.is_active).length;
  const listingsGrowth = PREVIOUS_ACTIVE_LISTINGS > 0 
    ? Math.round(((activeListingsCount - PREVIOUS_ACTIVE_LISTINGS) / PREVIOUS_ACTIVE_LISTINGS) * 100)
    : 0;

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'inventory', icon: ShoppingBag, label: t('my_products') },
    { id: 'market', icon: TrendingUp, label: t('market_insights') },
    { id: 'community', icon: Users, label: t('community') },
    { id: 'help', icon: HelpCircle, label: t('help') },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-color)] text-[var(--text-primary)]">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--glass-border)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">Artisan Sahayak</h1>
            <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{t('ai_co_founder')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 pr-12">
          <button 
            onClick={onChangeLanguage}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Languages size={20} />
          </button>
          <button className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[var(--bg-color)]" />
          </button>
          <button 
            onClick={() => onNavigate('profile')}
            className="w-8 h-8 rounded-full border border-cyan-500/30 p-0.5 hover:scale-110 transition-all overflow-hidden"
          >
            <img src={`https://ui-avatars.com/api/?name=${user.username}&background=FF8C00&color=fff`} className="w-full h-full rounded-full object-cover" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        {activeTab === 'dashboard' && (
          <div className="p-6 space-y-8">
            {/* Hero Section */}
            <section className="space-y-2">
              <p className="text-[10px] font-mono text-[var(--primary-color)] uppercase tracking-[0.3em]">{t('welcome_back')}</p>
              <h2 className="text-4xl font-bold tracking-tight text-[var(--text-primary)]">{user.username.split(' ')[0]}</h2>
              <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                <MapPin size={14} className="text-rose-400" />
                <span>{user.location}</span>
                <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                <span className="text-[var(--primary-color)] font-mono text-xs uppercase">{user.craft_type || 'Artisan'}</span>
              </div>
            </section>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-5 space-y-3 border-cyan-500/10 bg-cyan-500/5 text-left hover:border-cyan-500/30 transition-all group relative">
                <div className="flex justify-between items-start">
                  <button 
                    onClick={() => onNavigate('sales-dashboard')}
                    className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform"
                  >
                    <IndianRupee size={18} />
                  </button>
                  <select 
                    value={salesTimeframe}
                    onChange={(e) => setSalesTimeframe(e.target.value as any)}
                    className="text-[10px] font-mono bg-transparent border-none text-emerald-400 focus:ring-0 cursor-pointer outline-none"
                  >
                    <option value="weekly" className="bg-[var(--nav-bg)]">Last Week</option>
                    <option value="monthly" className="bg-[var(--nav-bg)]">Monthly</option>
                    <option value="yearly" className="bg-[var(--nav-bg)]">Yearly</option>
                  </select>
                </div>
                <button 
                  onClick={() => onNavigate('sales-dashboard')}
                  className="block w-full text-left"
                >
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">{t('total_sales')}</p>
                  <p className="text-2xl font-bold mono mt-1 text-[var(--text-primary)]">₹{REVENUE_BY_TIMEFRAME[salesTimeframe].toLocaleString()}</p>
                </button>
              </div>
              <button 
                onClick={() => onNavigate('inventory')}
                className="card p-5 space-y-3 border-purple-500/10 bg-purple-500/5 text-left hover:border-purple-500/30 transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                    <ShoppingBag size={18} />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {listingsGrowth >= 0 ? '+' : ''}{listingsGrowth}%
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">{t('active_listings')}</p>
                  <p className="text-2xl font-bold mono mt-1 text-[var(--text-primary)]">{activeListingsCount}</p>
                </div>
              </button>
            </div>

            {/* Neural Advisory Card */}
            <div className="card p-6 relative overflow-hidden group border-[var(--primary-color)]/30">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles size={120} className="text-[var(--primary-color)]" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--primary-color)] animate-pulse" />
                  <span className="text-[10px] font-mono text-[var(--primary-color)] uppercase tracking-widest">{t('neural_suggestion')}</span>
                </div>
                <h3 className="text-xl font-bold leading-tight text-[var(--text-primary)]">
                  {trends?.trendingCategories[0]?.name || 'Handicrafts'} {t('trending_now')}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {trends?.insights[0] || "AI is analyzing your local market for better pricing..."}
                </p>
                <button 
                  onClick={() => onNavigate('trending')}
                  className="text-xs font-bold text-[var(--primary-color)] flex items-center gap-2 group/btn"
                >
                  {t('view_insights').toUpperCase()}
                  <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Community Highlights */}
            <section className="space-y-4">
              <div className="flex justify-between items-end">
                <h3 className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">{t('community')}</h3>
                <button onClick={() => onNavigate('community')} className="text-[10px] font-mono text-[var(--primary-color)] uppercase">{t('view_all')}</button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {communityPosts.slice(0, 3).map((post, i) => (
                  <div key={i} className="min-w-[280px] card overflow-hidden border-[var(--glass-border)]">
                    <img src={post.image_url || 'https://picsum.photos/seed/craft/400/300'} className="w-full h-40 object-cover" />
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <img src={`https://ui-avatars.com/api/?name=${post.username}&background=random`} className="w-5 h-5 rounded-full" />
                        <span className="text-xs font-bold text-[var(--text-primary)]">{post.username}</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{post.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="p-6 space-y-8">
            <section className="space-y-2">
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em]">{t('community')}</p>
              <h2 className="text-4xl font-bold tracking-tight">{t('neural_feed')}</h2>
            </section>

            <div className="space-y-6">
              {communityPosts.map((post, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card overflow-hidden border-[var(--glass-border)]"
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={`https://ui-avatars.com/api/?name=${post.username}&background=random`} className="w-8 h-8 rounded-full" />
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">{post.username}</h4>
                        <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">{post.location || "India"}</p>
                      </div>
                    </div>
                    <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><ArrowUpRight size={18} /></button>
                  </div>
                  <img src={post.image_url || 'https://picsum.photos/seed/post/400/400'} className="w-full aspect-square object-cover" />
                  <div className="p-4 space-y-4">
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-6 pt-4 border-t border-[var(--glass-border)]">
                      <button className="flex items-center gap-2 text-[var(--text-muted)] hover:text-rose-400 transition-colors">
                        <Heart size={18} />
                        <span className="text-xs font-mono">{post.likes || 0}</span>
                      </button>
                      <button className="flex items-center gap-2 text-[var(--text-muted)] hover:text-cyan-400 transition-colors">
                        <MessageSquare size={18} />
                        <span className="text-xs font-mono">12</span>
                      </button>
                      <button className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors ml-auto">
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => onNavigate('add-product')}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-2xl bg-cyan-500 text-[var(--bg-color)] shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
      >
        <Plus size={32} />
      </button>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--nav-bg)] backdrop-blur-2xl border-t border-[var(--glass-border)] px-6 py-4 flex justify-between items-center z-50">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (['inventory', 'community', 'help', 'market'].includes(item.id)) {
                onNavigate(item.id === 'market' ? 'market-insights' : item.id);
              } else {
                setActiveTab(item.id);
              }
            }}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-cyan-400' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
          >
            <item.icon size={20} className={activeTab === item.id ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : ''} />
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
        <button
          onClick={onLogout}
          className="flex flex-col items-center gap-1 text-rose-500/40 hover:text-rose-500 transition-all"
        >
          <LogOut size={20} />
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest">{t('logout')}</span>
        </button>
      </nav>
    </div>
  );
};
