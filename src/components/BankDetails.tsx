import React, { useState, useEffect } from 'react';
import { ArrowLeft, ScanLine } from 'lucide-react';
import { User, BankDetails, Language } from '../types';
import { processOCR } from '../services/aiService';
import { api } from '../api';
import { useTranslation } from '../translations';

export const BankDetailsPage = ({ user, onBack }: { user: User, onBack: () => void }) => {
  const [details, setDetails] = useState<BankDetails | null>(null);
  const [scanning, setScanning] = useState(false);
  const t = useTranslation(user?.language || Language.ENGLISH);
  const [formData, setFormData] = useState({
    account_holder: '',
    bank_name: '',
    ifsc: '',
    account_number: ''
  });

  useEffect(() => {
    api.get('/api/bank').then(data => {
      if (data) {
        setDetails(data);
        setFormData(data);
      }
    });
  }, []);

  const handleOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScanning(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const result = await processOCR(reader.result as string);
          setFormData({
            ...formData,
            account_holder: result.name,
            account_number: result.aadhaarNumber
          });
        } catch (err) {
          alert('OCR failed');
        } finally {
          setScanning(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      await api.post('/api/bank', formData);
      alert('Bank details saved!');
    } catch (err) {
      alert('Failed to save bank details');
    }
  };

  return (
    <div className="p-6 futuristic-grid min-h-screen">
      <button onClick={onBack} className="mb-8 flex items-center text-white/40 hover:text-white transition-colors font-mono text-xs uppercase tracking-widest">
        <ArrowLeft size={16} className="mr-2" /> {t('return')}
      </button>
      
      <div className="mb-10">
        <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] mb-1">{t('financial_protocol')}</p>
        <h2 className="text-4xl font-bold text-white tracking-tight">{t('bank_details')}</h2>
      </div>

      <div className="card p-6 mb-8 bg-cyan-500/5 border-cyan-500/20 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <ScanLine size={120} />
        </div>
        <div className="flex items-start gap-5 relative z-10">
          <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400 border border-cyan-500/30">
            <ScanLine size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white tracking-tight">Rapid Ingestion</h4>
            <p className="text-[11px] text-white/40 mt-1 font-mono uppercase tracking-wider">Scan Aadhaar for automated data mapping.</p>
            <div className="mt-5 relative inline-block">
              <button className="neon-button py-2.5 px-6 text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                {scanning ? t('analyzing').toUpperCase() : t('initialize_listing').toUpperCase()}
              </button>
              <input type="file" onChange={handleOCR} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest ml-2">{t('account_holder')}</label>
          <input 
            type="text" value={formData.account_holder} onChange={e => setFormData({...formData, account_holder: e.target.value})}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500/50 outline-none transition-all placeholder:text-white/20"
            placeholder={t('placeholder_holder')}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest ml-2">{t('bank_name')}</label>
          <input 
            type="text" value={formData.bank_name} onChange={e => setFormData({...formData, bank_name: e.target.value})}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500/50 outline-none transition-all placeholder:text-white/20"
            placeholder={t('placeholder_bank')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest ml-2">{t('ifsc_code')}</label>
            <input 
              type="text" value={formData.ifsc} onChange={e => setFormData({...formData, ifsc: e.target.value})}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500/50 outline-none transition-all placeholder:text-white/20 mono"
              placeholder={t('placeholder_ifsc')}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest ml-2">{t('account_number')}</label>
            <input 
              type="text" value={formData.account_number} onChange={e => setFormData({...formData, account_number: e.target.value})}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500/50 outline-none transition-all placeholder:text-white/20 mono"
              placeholder={t('placeholder_account')}
            />
          </div>
        </div>
        <button onClick={handleSave} className="w-full neon-button py-4 mt-6">{t('save_credentials').toUpperCase()}</button>
      </div>
    </div>
  );
};
