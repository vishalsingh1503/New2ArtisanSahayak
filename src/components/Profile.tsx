import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Settings, 
  Star, 
  ShoppingBag, 
  IndianRupee, 
  Users, 
  MessageSquare,
  Package,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Edit2,
  Check,
  X,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Upload,
  Camera,
  FileText,
  PhoneCall,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { User, Language, BankDetails } from '../types';
import { useTranslation } from '../translations';
import { api } from '../api';
import { processBankPassbookOCR } from '../services/aiService';

import { TOTAL_REVENUE, SALES_HISTORY } from '../constants/financial';

export const Profile = ({ user, onBack, onUpdateUser }: { user: User, onBack: () => void, onUpdateUser: (fields: Partial<User>) => void }) => {
  const t = useTranslation(user?.language || Language.ENGLISH);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(user.email || 'artisan@sahayak.com');
  const [phone, setPhone] = useState(user.phone || '+91 98765 43210');

  // Payment Method State
  const [hasBankAccount, setHasBankAccount] = useState<boolean | null>(user.bankDetails ? true : null);
  const [paymentMode, setPaymentMode] = useState<'selection' | 'manual' | 'ocr' | 'ippb'>(user.bankDetails ? 'manual' : 'selection');
  const [bankDetails, setBankDetails] = useState<BankDetails>(user.bankDetails || {
    user_id: user.id,
    account_holder: '',
    bank_name: '',
    ifsc: '',
    account_number: ''
  });
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [showPaymentSection, setShowPaymentSection] = useState(false);

  const handlePassbookUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const extracted = await processBankPassbookOCR(base64);
        setBankDetails({
          ...bankDetails,
          ...extracted
        });
        setPaymentMode('manual');
        alert(t('passbook_upload_success'));
      } catch (err) {
        alert(err instanceof Error ? err.message : 'OCR failed');
      } finally {
        setIsOcrLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveBankDetails = async () => {
    try {
      // In a real app, we'd call api.post('/api/bank-details', bankDetails)
      // For now, we update local state and user
      onUpdateUser({ 
        bankDetails, 
        verificationStatus: 'pending' 
      });
      alert(t('save_bank_details_success') || 'Bank details saved successfully!');
      setPaymentMode('manual');
    } catch (err) {
      alert('Failed to save bank details');
    }
  };

  // Mock data for ratings and stats
  const stats = {
    itemsSold: SALES_HISTORY.length,
    totalRevenue: TOTAL_REVENUE,
    avgRating: 4.6,
    numReviews: 48
  };

  const reviews = [
    { id: 1, user: "Amit R.", rating: 5, comment: "Beautiful craftsmanship! The pottery is even better in person.", date: "2 days ago" },
    { id: 2, user: "Sonal M.", rating: 4, comment: "Very nice work, though delivery took a bit long.", date: "1 week ago" },
    { id: 3, user: "Priya K.", rating: 5, comment: "Absolutely stunning pieces. Highly recommend!", date: "2 weeks ago" },
    { id: 4, user: "Rahul S.", rating: 3.5, comment: "Good quality, but expected more detail.", date: "1 month ago" }
  ];

  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        const response = await api.get('/api/products');
        // Filter products by current user (mocking this as api returns all for now)
        setUserProducts(response.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProducts();
  }, []);

  return (
    <div className="p-6 futuristic-grid min-h-screen pb-32">
      <header className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
          <ArrowLeft size={24} />
        </button>
        <button className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
          <Settings size={24} />
        </button>
      </header>

      {/* User Info Section */}
      <section className="flex flex-col items-center text-center space-y-4 mb-10">
        <div className="relative">
          <div className="w-32 h-32 rounded-3xl border-2 border-[var(--primary-color)] p-1 shadow-[0_0_20px_rgba(255,140,0,0.2)]">
            <img 
              src={`https://ui-avatars.com/api/?name=${user.username}&background=FF8C00&color=fff&size=128`} 
              className="w-full h-full rounded-2xl object-cover" 
              alt={user.username}
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[var(--primary-color)] text-[var(--bg-color)] p-1.5 rounded-xl shadow-lg">
            <Star size={16} fill="currentColor" />
          </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">{user.username}</h2>
          <div className="flex flex-col items-center gap-2 mt-2">
            <div className="flex items-center justify-center gap-2 text-[var(--text-muted)]">
              <MapPin size={14} />
              <span className="text-xs font-mono uppercase tracking-widest">{user.location}</span>
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
              <span className="text-xs font-mono uppercase tracking-widest">Age: 34</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 mt-2 w-full max-w-xs">
              <div className="flex items-center justify-between w-full p-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Mail size={14} />
                  {isEditing ? (
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-transparent border-none text-xs focus:ring-0 p-0 w-40"
                    />
                  ) : (
                    <span className="text-xs">{email}</span>
                  )}
                </div>
                {!isEditing && <button onClick={() => setIsEditing(true)} className="text-[var(--primary-color)]"><Edit2 size={12} /></button>}
              </div>
              
              <div className="flex items-center justify-between w-full p-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Phone size={14} />
                  {isEditing ? (
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-transparent border-none text-xs focus:ring-0 p-0 w-40"
                    />
                  ) : (
                    <span className="text-xs">{phone}</span>
                  )}
                </div>
                {!isEditing && <button onClick={() => setIsEditing(true)} className="text-[var(--primary-color)]"><Edit2 size={12} /></button>}
              </div>

              {isEditing && (
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => {
                      onUpdateUser({ email, phone });
                      setIsEditing(false);
                    }}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/30"
                  >
                    <Check size={12} /> Save
                  </button>
                  <button 
                    onClick={() => {
                      setEmail(user.email || 'artisan@sahayak.com');
                      setPhone(user.phone || '+91 98765 43210');
                      setIsEditing(false);
                    }}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-widest border border-rose-500/30"
                  >
                    <X size={12} /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)] max-w-xs leading-relaxed">
          Master artisan specializing in traditional {user.craft_type || 'Handicrafts'}. Dedicated to preserving regional art forms for over 15 years.
        </p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="card p-4 space-y-2 border-orange-500/10 bg-orange-500/5">
          <div className="flex items-center gap-2 text-[var(--primary-color)]">
            <ShoppingBag size={16} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Sold</span>
          </div>
          <p className="text-2xl font-bold mono text-[var(--text-primary)]">{stats.itemsSold}</p>
        </div>
        <div className="card p-4 space-y-2 border-emerald-500/10 bg-emerald-500/5">
          <div className="flex items-center gap-2 text-emerald-400">
            <IndianRupee size={16} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Revenue</span>
          </div>
          <p className="text-2xl font-bold mono text-[var(--text-primary)]">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="card p-4 space-y-2 border-amber-500/10 bg-amber-500/5">
          <div className="flex items-center gap-2 text-amber-400">
            <Star size={16} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Rating</span>
          </div>
          <p className="text-2xl font-bold mono text-[var(--text-primary)]">{stats.avgRating}</p>
        </div>
        <div className="card p-4 space-y-2 border-blue-500/10 bg-blue-500/5">
          <div className="flex items-center gap-2 text-blue-400">
            <MessageSquare size={16} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Reviews</span>
          </div>
          <p className="text-2xl font-bold mono text-[var(--text-primary)]">{stats.numReviews}</p>
        </div>
      </div>

      {/* Products Section */}
      <section className="space-y-6 mb-10">
        <div className="flex justify-between items-end">
          <h3 className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Listed Products</h3>
          <button className="text-[10px] font-mono text-[var(--primary-color)] uppercase">View All</button>
        </div>
        
        {loading ? (
          <div className="h-40 card animate-pulse" />
        ) : (
          <div className="space-y-4">
            {userProducts.map(product => (
              <div key={product.id} className="card p-3 flex gap-4 border-[var(--glass-border)]">
                <img src={product.photo_url} className="w-20 h-20 rounded-xl object-cover" alt={product.name} />
                <div className="flex-1 py-1">
                  <h4 className="font-bold text-[var(--text-primary)]">{product.name}</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{product.category}</p>
                  <p className="text-sm font-bold text-[var(--primary-color)] mt-2">₹{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Ratings Section */}
      <section className="space-y-6 mb-10">
        <h3 className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Recent Ratings</h3>
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="card p-4 space-y-3 border-[var(--glass-border)]">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--glass-border)] flex items-center justify-center text-[10px] font-bold">
                    {review.user[0]}
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)]">{review.user}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={12} fill="currentColor" />
                  <span className="text-xs font-mono font-bold">{review.rating}</span>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {review.comment}
              </p>
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Calendar size={10} />
                <span className="text-[10px] font-mono uppercase tracking-widest">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Payment Method Section */}
      <section className="space-y-6">
        <button 
          onClick={() => setShowPaymentSection(!showPaymentSection)}
          className="w-full flex justify-between items-center p-4 card border-[var(--glass-border)] hover:border-[var(--primary-color)] transition-all"
        >
          <div className="flex items-center gap-3">
            <CreditCard size={20} className="text-[var(--primary-color)]" />
            <span className="text-sm font-bold text-[var(--text-primary)]">{t('payment_method')}</span>
          </div>
          {showPaymentSection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        <AnimatePresence>
          {showPaymentSection && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-6 card border-[var(--glass-border)] bg-[var(--glass-bg)]">
                {hasBankAccount === null ? (
                  <div className="space-y-4 text-center py-4">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{t('bank_account_question')}</p>
                    <div className="flex gap-4 justify-center">
                      <button 
                        onClick={() => setHasBankAccount(true)}
                        className="px-8 py-2 rounded-xl bg-[var(--primary-color)] text-[var(--bg-color)] font-bold text-sm"
                      >
                        {t('yes')}
                      </button>
                      <button 
                        onClick={() => {
                          setHasBankAccount(false);
                          setPaymentMode('ippb');
                        }}
                        className="px-8 py-2 rounded-xl border border-[var(--glass-border)] text-[var(--text-primary)] font-bold text-sm"
                      >
                        {t('no')}
                      </button>
                    </div>
                  </div>
                ) : hasBankAccount ? (
                  <div className="space-y-6">
                    {paymentMode === 'selection' ? (
                      <div className="grid grid-cols-1 gap-4">
                        <button 
                          onClick={() => setPaymentMode('manual')}
                          className="p-4 rounded-2xl border border-[var(--glass-border)] hover:border-[var(--primary-color)] flex items-center gap-4 transition-all group"
                        >
                          <div className="p-3 rounded-xl bg-[var(--glass-bg)] group-hover:bg-[var(--primary-color)] group-hover:text-black transition-all">
                            <Edit2 size={20} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-[var(--text-primary)]">{t('manual_entry')}</p>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Enter details yourself</p>
                          </div>
                        </button>

                        <button 
                          onClick={() => setPaymentMode('ocr')}
                          className="p-4 rounded-2xl border border-[var(--glass-border)] hover:border-[var(--primary-color)] flex items-center gap-4 transition-all group"
                        >
                          <div className="p-3 rounded-xl bg-[var(--glass-bg)] group-hover:bg-[var(--primary-color)] group-hover:text-black transition-all">
                            <Camera size={20} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-[var(--text-primary)]">{t('upload_passbook')}</p>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">AI will extract details</p>
                          </div>
                        </button>
                      </div>
                    ) : paymentMode === 'manual' || paymentMode === 'ocr' ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <button onClick={() => setPaymentMode('selection')} className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1">
                            <ArrowLeft size={12} /> {t('back')}
                          </button>
                          {user.verificationStatus && (
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${
                              user.verificationStatus === 'verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {user.verificationStatus === 'verified' ? <ShieldCheck size={10} /> : <AlertCircle size={10} />}
                              {t(user.verificationStatus)}
                            </div>
                          )}
                        </div>

                        {paymentMode === 'ocr' ? (
                          <div className="p-8 border-2 border-dashed border-[var(--glass-border)] rounded-2xl text-center space-y-4">
                            {isOcrLoading ? (
                              <div className="space-y-4">
                                <div className="w-10 h-10 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto" />
                                <p className="text-xs font-mono text-cyan-400 animate-pulse">{t('extracting_details')}</p>
                              </div>
                            ) : (
                              <>
                                <div className="w-16 h-16 bg-[var(--glass-bg)] rounded-full flex items-center justify-center mx-auto text-[var(--text-muted)]">
                                  <Upload size={32} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-[var(--text-primary)]">{t('upload_passbook')}</p>
                                  <p className="text-[10px] text-[var(--text-muted)] mt-1">Front page with Account No. & IFSC</p>
                                </div>
                                <label className="inline-block px-6 py-2 rounded-xl bg-[var(--primary-color)] text-[var(--bg-color)] font-bold text-xs cursor-pointer hover:scale-105 transition-transform">
                                  {t('upload_image')}
                                  <input type="file" accept="image/*" className="hidden" onChange={handlePassbookUpload} />
                                </label>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest ml-1">{t('account_holder_name')}</label>
                              <input 
                                type="text"
                                value={bankDetails.account_holder}
                                onChange={(e) => setBankDetails({...bankDetails, account_holder: e.target.value})}
                                className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:border-[var(--primary-color)] outline-none"
                                placeholder="Enter Name"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest ml-1">{t('bank_name')}</label>
                              <input 
                                type="text"
                                value={bankDetails.bank_name}
                                onChange={(e) => setBankDetails({...bankDetails, bank_name: e.target.value})}
                                className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:border-[var(--primary-color)] outline-none"
                                placeholder="Enter Bank Name"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest ml-1">{t('account_number')}</label>
                                <input 
                                  type="text"
                                  value={bankDetails.account_number}
                                  onChange={(e) => setBankDetails({...bankDetails, account_number: e.target.value})}
                                  className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:border-[var(--primary-color)] outline-none"
                                  placeholder="Enter Account No"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest ml-1">{t('ifsc_code')}</label>
                                <input 
                                  type="text"
                                  value={bankDetails.ifsc}
                                  onChange={(e) => setBankDetails({...bankDetails, ifsc: e.target.value})}
                                  className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:border-[var(--primary-color)] outline-none"
                                  placeholder="Enter IFSC"
                                />
                              </div>
                            </div>
                            
                            <div className="p-4 border border-dashed border-[var(--glass-border)] rounded-xl flex items-center justify-between group cursor-pointer hover:border-[var(--primary-color)] transition-all">
                              <div className="flex items-center gap-3">
                                <FileText size={20} className="text-[var(--text-muted)] group-hover:text-[var(--primary-color)]" />
                                <span className="text-xs text-[var(--text-secondary)]">{t('upload_cheque')}</span>
                              </div>
                              <Upload size={16} className="text-[var(--text-muted)]" />
                            </div>

                            <button 
                              onClick={saveBankDetails}
                              className="w-full py-3 rounded-xl bg-[var(--primary-color)] text-[var(--bg-color)] font-bold text-sm shadow-[0_0_15px_rgba(255,140,0,0.3)] hover:scale-[1.02] transition-transform"
                            >
                              {t('save_bank_details')}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <button onClick={() => setHasBankAccount(null)} className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1">
                        <ArrowLeft size={12} /> {t('back')}
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                          <PhoneCall size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)]">{t('ippb_guide_title')}</p>
                          <p className="text-[10px] text-blue-400 font-mono uppercase tracking-widest">India Post Payments Bank</p>
                        </div>
                      </div>

                      <div className="space-y-3 pl-2">
                        {[1, 2, 3, 4].map((step) => (
                          <div key={step} className="flex gap-4 items-start">
                            <div className="w-6 h-6 rounded-full bg-[var(--glass-border)] flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                              {step}
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                              {t(`ippb_step_${step}`)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={() => window.open('tel:155299')}
                        className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2"
                      >
                        <Phone size={16} /> Call 155299 Now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};
