import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Sparkles, 
  Send,
  Copy,
  Check,
  Instagram,
  MessageCircle,
  Globe,
  MapPin,
  Hammer,
  Layers,
  Volume2
} from 'lucide-react';
import { User, Language, ProductAnalysis } from '../types';
import { analyzeProductImage, generateSocialContent } from '../services/aiService';
import { analyzeProductVideo } from '../services/geminiVideoAnalysis';
import { ExtractedProductDetails } from '../services/speechToProductDetails';
import { api } from '../api';
import { useTranslation } from '../translations';
import { ProductMediaUploader } from './ProductMediaUploader';
import { VoiceProductInput } from './VoiceProductInput';

export const AddProduct = ({ user, onBack }: { user: User, onBack: () => void }) => {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<{ data: string, mimeType: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [socialContent, setSocialContent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [initialStock, setInitialStock] = useState(1);
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  
  // Product Details
  const [productDetails, setProductDetails] = useState<ExtractedProductDetails>({
    height: '',
    width: '',
    weight: '',
    material: '',
    craftTechnique: '',
    additionalNotes: ''
  });
  
  const t = useTranslation(user?.language || Language.ENGLISH);

  const handleVideoChange = (videoData: string | null, mimeType: string | null) => {
    if (videoData && mimeType) {
      setVideo({ data: videoData, mimeType });
    } else {
      setVideo(null);
    }
  };

  const handleDetailsExtracted = (details: ExtractedProductDetails) => {
    setProductDetails(prev => ({
      ...prev,
      height: details.height || prev.height,
      width: details.width || prev.width,
      weight: details.weight || prev.weight,
      material: details.material || prev.material,
      craftTechnique: details.craftTechnique || prev.craftTechnique,
      additionalNotes: details.additionalNotes || prev.additionalNotes
    }));
  };

  const startAnalysis = async () => {
    if (images.length === 0 && !video) return;
    setIsAnalyzing(true);
    try {
      let result: ProductAnalysis;
      
      if (video) {
        // Analyze video if available
        const videoInsights = await analyzeProductVideo(video.data, video.mimeType);
        
        // Update product details with video insights
        if (videoInsights.suggestedDetails) {
          handleDetailsExtracted(videoInsights.suggestedDetails);
        }
        
        // Map video insights to ProductAnalysis structure
        result = {
          title: `${videoInsights.productType}`,
          description: videoInsights.visualQuality,
          craftStory: videoInsights.craftsmanshipDetails,
          category: videoInsights.productType,
          materials: [videoInsights.material],
          region: user.location || 'Unknown',
          suggestedPrice: {
            min: 500,
            max: 1500,
            reasoning: videoInsights.potentialMarketAppeal
          },
          craftType: videoInsights.craftsmanshipDetails,
          seoKeywords: '',
          hashtags: []
        };
      } else {
        // Fallback to image analysis if only images are provided
        // We use the first image for the existing analyzeProductImage function
        result = await analyzeProductImage(images[0], '', user.language);
      }
      
      setAnalysis(result);
      setStep(2);
      
      // Pre-generate social content in background
      generateSocialContent(result, user.language).then(setSocialContent).catch(err => {
        console.warn('Social content generation failed', err);
        setSocialContent({ instagram: '', whatsapp: '', etsy: '' });
      });
    } catch (err: any) {
      console.error('Analysis failed', err);
      alert(err.message || 'Analysis failed. Please check your internet connection or API key.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!analysis) return;
    setIsSaving(true);
    try {
      await api.post('/api/products', {
        name: analysis.title,
        story: analysis.craftStory,
        description: analysis.description,
        price: customPrice || analysis.suggestedPrice.max,
        photo_url: images[0] || '', // Use first image as main photo
        category: analysis.category,
        location: user.location,
        cod_enabled: true,
        stock: initialStock,
        details: productDetails // Save structured details
      });
      onBack();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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

  const speakText = (text: string) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageTag(user.language || Language.ENGLISH);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-6 pb-32 space-y-8">
      <header className="flex justify-between items-center">
        <button onClick={onBack} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
          <ArrowLeft size={24} />
        </button>
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${s <= step ? 'bg-[var(--primary-color)] shadow-[0_0_10px_rgba(255,140,0,0.5)]' : 'bg-[var(--glass-border)]'}`} />
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-[var(--primary-color)] uppercase tracking-[0.3em]">{t('step')} 01 // {t('input_mode')}</p>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{t('start_selling')}</h1>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">{t('neural_processor_optimization')}</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <ProductMediaUploader 
                images={images} 
                video={video?.data || null} 
                onImagesChange={setImages} 
                onVideoChange={handleVideoChange} 
                language={user.language || Language.ENGLISH}
              />

              <VoiceProductInput 
                language={user.language || Language.ENGLISH} 
                onDetailsExtracted={handleDetailsExtracted} 
              />
              
              {/* Product Details Section */}
              <div className="card p-6 space-y-4 border-[var(--glass-border)]">
                <h3 className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                  <Layers size={14} /> Product Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Height</label>
                    <input 
                      type="text" 
                      value={productDetails.height || ''} 
                      onChange={e => setProductDetails({...productDetails, height: e.target.value})}
                      className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-2 text-sm text-[var(--text-primary)] focus:border-cyan-400 outline-none"
                      placeholder="e.g. 30 cm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Width</label>
                    <input 
                      type="text" 
                      value={productDetails.width || ''} 
                      onChange={e => setProductDetails({...productDetails, width: e.target.value})}
                      className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-2 text-sm text-[var(--text-primary)] focus:border-cyan-400 outline-none"
                      placeholder="e.g. 15 cm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Weight</label>
                    <input 
                      type="text" 
                      value={productDetails.weight || ''} 
                      onChange={e => setProductDetails({...productDetails, weight: e.target.value})}
                      className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-2 text-sm text-[var(--text-primary)] focus:border-cyan-400 outline-none"
                      placeholder="e.g. 1.5 kg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Material</label>
                    <input 
                      type="text" 
                      value={productDetails.material || ''} 
                      onChange={e => setProductDetails({...productDetails, material: e.target.value})}
                      className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-2 text-sm text-[var(--text-primary)] focus:border-cyan-400 outline-none"
                      placeholder="e.g. Clay"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Craft Technique</label>
                    <input 
                      type="text" 
                      value={productDetails.craftTechnique || ''} 
                      onChange={e => setProductDetails({...productDetails, craftTechnique: e.target.value})}
                      className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-2 text-sm text-[var(--text-primary)] focus:border-cyan-400 outline-none"
                      placeholder="e.g. Hand-thrown"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Additional Notes</label>
                    <textarea 
                      value={productDetails.additionalNotes || ''} 
                      onChange={e => setProductDetails({...productDetails, additionalNotes: e.target.value})}
                      className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-2 text-sm text-[var(--text-primary)] focus:border-cyan-400 outline-none resize-none h-20"
                      placeholder="Any other details..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              disabled={(images.length === 0 && !video) || isAnalyzing}
              onClick={startAnalysis}
              className="w-full neon-button py-5 flex items-center justify-center gap-3 disabled:opacity-30"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-[var(--glass-border)] border-t-[var(--primary-color)] rounded-full animate-spin" />
                  <span>{t('processing_multimodal').toUpperCase()}</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>{t('initialize_listing').toUpperCase()}</span>
                </>
              )}
            </button>
          </motion.div>
        )}

        {step === 2 && analysis && (
          <motion.div 
            key="step2" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em]">{t('step')} 02 // {t('ai_analyzing')}</p>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{t('craft_detected')}</h1>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="card p-5 flex items-center gap-4 border-cyan-500/20 bg-cyan-500/5">
                <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400">
                  <Hammer size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">{t('craft_detected')}</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{analysis.craftType}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="card p-5 space-y-2">
                  <div className="p-2 w-fit bg-purple-500/10 rounded-lg text-purple-400">
                    <MapPin size={16} />
                  </div>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">{t('region_detected')}</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{analysis.region}</p>
                </div>
                <div className="card p-5 space-y-2">
                  <div className="p-2 w-fit bg-emerald-500/10 rounded-lg text-emerald-400">
                    <Layers size={16} />
                  </div>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">{t('materials_detected')}</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">{analysis.materials.join(', ')}</p>
                </div>
              </div>

              <div className="card p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">{t('valuation_class')}</h3>
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <Sparkles size={16} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[var(--text-primary)]">₹{analysis.suggestedPrice.min} - ₹{analysis.suggestedPrice.max}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">"{analysis.suggestedPrice.reasoning}"</p>
              </div>
            </div>

            <button 
              onClick={() => setStep(3)}
              className="w-full neon-button py-5 flex items-center justify-center gap-3"
            >
              <span>{t('marketplace_ready').toUpperCase()}</span>
              <ArrowLeft size={20} className="rotate-180" />
            </button>
          </motion.div>
        )}

        {step === 3 && analysis && (
          <motion.div 
            key="step3" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em]">{t('step')} 03 // {t('final_validation')}</p>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{t('marketplace_ready')}</h1>
            </div>

            <div className="card overflow-hidden border-[var(--glass-border)]">
              <div className="relative aspect-video">
                {video ? (
                  <video src={video.data} className="w-full h-full object-cover" controls />
                ) : (
                  <img src={images[0] || ''} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                  <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-1">{analysis.category}</p>
                  <h3 className="text-xl font-bold text-white">{analysis.title}</h3>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">{t('origin_narrative')}</p>
                    <button onClick={() => speakText(analysis.craftStory)} className="text-cyan-400"><Volume2 size={16} /></button>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{analysis.craftStory}</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Set Price (₹)</p>
                      <input 
                        type="number" 
                        defaultValue={analysis.suggestedPrice.max}
                        onChange={(e) => setCustomPrice(Number(e.target.value))}
                        className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:border-cyan-400 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Initial Stock</p>
                      <input 
                        type="number" 
                        value={initialStock}
                        onChange={(e) => setInitialStock(Number(e.target.value))}
                        className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-3 text-sm text-[var(--text-primary)] focus:border-cyan-400 outline-none"
                      />
                    </div>
                  </div>

                  <h3 className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">{t('social_marketing')}</h3>
                  <div className="space-y-3">
                    {socialContent ? (
                      <>
                        <div className="card p-4 bg-[var(--glass-bg)] border-[var(--glass-border)] space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-purple-400 flex items-center gap-2">
                              <Instagram size={12} /> {t('instagram_caption')}
                            </span>
                            <button 
                              onClick={() => copyToClipboard(socialContent.instagram, 'insta')}
                              className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            >
                              {copiedField === 'insta' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">{socialContent.instagram}</p>
                        </div>

                        <div className="card p-4 bg-[var(--glass-bg)] border-[var(--glass-border)] space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-2">
                              <MessageCircle size={12} /> {t('whatsapp_message')}
                            </span>
                            <button 
                              onClick={() => copyToClipboard(socialContent.whatsapp, 'wa')}
                              className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            >
                              {copiedField === 'wa' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">{socialContent.whatsapp}</p>
                        </div>

                        <div className="card p-4 bg-[var(--glass-bg)] border-[var(--glass-border)] space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-amber-400 flex items-center gap-2">
                              <Globe size={12} /> {t('etsy_description')}
                            </span>
                            <button 
                              onClick={() => copyToClipboard(socialContent.etsy, 'etsy')}
                              className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            >
                              {copiedField === 'etsy' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            </button>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">{socialContent.etsy}</p>
                        </div>
                      </>
                    ) : (
                      <div className="h-20 flex items-center justify-center animate-pulse bg-[var(--glass-bg)] rounded-xl">
                        <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase">{t('generating_listing')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button 
              disabled={isSaving}
              onClick={handleSave}
              className="w-full neon-button py-5 flex items-center justify-center gap-3"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-[var(--glass-border)] border-t-[var(--primary-color)] rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={20} />
                  <span>{t('start_selling').toUpperCase()}</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
