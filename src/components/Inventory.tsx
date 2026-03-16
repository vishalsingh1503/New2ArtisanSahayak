import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Package, Trash2, TrendingUp, CheckCircle2, ChevronRight, Share2, Plus, Edit2 } from 'lucide-react';
import { User, Product, Language } from '../types';
import { api } from '../api';
import { useTranslation } from '../translations';
import { ProductCard } from './ProductCard';
import { SocialShareModal } from './SocialShareModal';

export const Inventory = ({ user, onBack, onNavigate }: { user: User, onBack: () => void, onNavigate: (page: string) => void }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ stock: 0, price: 0, is_active: true });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [productToShare, setProductToShare] = useState<Product | null>(null);
  const t = useTranslation(user?.language || Language.ENGLISH);

  const handlePromoteProduct = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProductToShare(product);
    setIsShareModalOpen(true);
  };

  const fetchProducts = () => {
    setLoading(true);
    api.get(`/api/products`)
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditStart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedProduct(product);
    setEditForm({ stock: product.stock, price: product.price, is_active: product.is_active });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedProduct) return;
    try {
      await api.patch(`/api/products/${selectedProduct.id}`, editForm);
      setIsEditing(false);
      setSelectedProduct({ ...selectedProduct, ...editForm });
      setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, ...editForm } : p));
    } catch (err) {
      alert('Failed to update product');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Delete this product?')) {
      try {
        await api.delete(`/api/products/${id}`);
        setProducts(products.filter(p => p.id !== id));
        if (selectedProduct?.id === id) setSelectedProduct(null);
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  if (selectedProduct) {
    return (
      <div className="p-6 pb-20 futuristic-grid min-h-screen">
        <button onClick={() => { setSelectedProduct(null); setIsEditing(false); }} className="mb-8 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-mono text-xs uppercase tracking-widest">
          <ArrowLeft size={16} className="mr-2" /> {t('back')}
        </button>
        
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          <div className="card overflow-hidden border-[var(--glass-border)]">
            <img src={selectedProduct.photo_url} className="w-full h-72 object-cover" />
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-1">{selectedProduct.category}</p>
                  <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{selectedProduct.name}</h2>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[var(--text-primary)] mono">₹{selectedProduct.price}</p>
                  <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded ${selectedProduct.stock > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} IN STOCK` : 'OUT OF STOCK'}
                  </span>
                </div>
              </div>

              {isEditing ? (
                <div className="p-4 bg-[var(--glass-bg)] rounded-xl border border-cyan-400/30 space-y-4">
                  <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">Edit Product</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Price (₹)</label>
                      <input 
                        type="number" 
                        value={editForm.price} 
                        onChange={e => setEditForm({...editForm, price: Number(e.target.value)})}
                        className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg p-2 text-sm text-[var(--text-primary)] focus:border-cyan-400 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Stock</label>
                      <input 
                        type="number" 
                        value={editForm.stock} 
                        onChange={e => setEditForm({...editForm, stock: Number(e.target.value)})}
                        className="w-full bg-black/20 border border-[var(--glass-border)] rounded-lg p-2 text-sm text-[var(--text-primary)] focus:border-cyan-400 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setEditForm({...editForm, is_active: !editForm.is_active})}
                      className={`flex-1 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest border transition-all ${editForm.is_active ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/20 border-rose-500/50 text-rose-400'}`}
                    >
                      {editForm.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <button 
                      onClick={handleSaveEdit}
                      className="flex-1 bg-cyan-500 text-black py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest font-bold"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => handleEditStart(selectedProduct)}
                  className="w-full py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-cyan-500/20 transition-all"
                >
                  Edit Price & Stock
                </button>
              )}

              <div className="flex items-center gap-6 text-[10px] font-mono text-[var(--text-muted)] border-y border-[var(--glass-border)] py-4">
                <div className="flex items-center gap-2"><TrendingUp size={14} className="text-cyan-400" /> {selectedProduct.views} ANALYTICS</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> {selectedProduct.is_active ? 'ACTIVE' : 'INACTIVE'}</div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3">{t('origin_narrative')}</h4>
                  <div className="p-4 bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)] italic text-[var(--text-secondary)] text-sm leading-relaxed">
                    "{selectedProduct.story}"
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3">{t('neural_optimized_description')}</h4>
                  <div className="p-4 bg-cyan-400/5 rounded-xl border border-cyan-400/10 text-[var(--text-primary)] text-sm leading-relaxed">
                    {selectedProduct.description}
                  </div>
                </div>
              </div>

              <div className="pt-6 flex flex-wrap gap-3">
                <button 
                  onClick={() => handlePromoteProduct(selectedProduct)}
                  className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 py-4 rounded-xl font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                  <Share2 size={16} /> Promote Product
                </button>
                <button 
                  onClick={() => alert('Simulating export to Amazon/Flipkart...')}
                  className="flex-1 bg-[var(--glass-bg)] hover:bg-[var(--glass-bg)]/20 text-[var(--text-primary)] border border-[var(--glass-border)] py-4 rounded-xl font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                  <ChevronRight size={16} /> {t('global_export')}
                </button>
                <button 
                  onClick={(e) => handleDelete(e, selectedProduct.id)}
                  className="p-4 text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 futuristic-grid min-h-screen">
      <button onClick={onBack} className="mb-8 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-mono text-xs uppercase tracking-widest">
        <ArrowLeft size={16} className="mr-2" /> {t('return')}
      </button>
      
      <div className="mb-10">
        <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em] mb-1">{t('asset_management')}</p>
        <h2 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">{t('active_inventory')}</h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-8 h-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
          <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{t('scanning_database')}...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="p-6 bg-[var(--glass-bg)] rounded-full border border-[var(--glass-border)] inline-block mb-6">
            <Package size={48} className="text-[var(--text-muted)]" />
          </div>
          <p className="text-[var(--text-muted)] font-mono text-xs uppercase tracking-widest">No Assets Detected</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map(product => (
            <ProductCard
              key={product.id}
              image={product.photo_url}
              name={product.name}
              description={product.description}
              price={product.price}
              stock={product.stock}
              isActive={product.is_active}
              views={product.views}
              category={product.category}
              onClick={() => setSelectedProduct(product)}
              actions={
                <>
                  <button
                    onClick={(e) => handleEditStart(product, e)}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--glass-bg)] hover:bg-[var(--glass-border)] border border-[var(--glass-border)] rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={(e) => handlePromoteProduct(product, e)}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-black bg-cyan-500 hover:bg-cyan-400 rounded-lg transition-colors"
                  >
                    <Share2 size={16} />
                    <span className="hidden sm:inline">Promote</span>
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={() => onNavigate('add-product')}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-2xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
      >
        <Plus size={32} />
      </button>

      {productToShare && (
        <SocialShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          product={{
            name: productToShare.name,
            description: productToShare.description,
            price: productToShare.price,
            url: `${window.location.origin}/product/${productToShare.id}`
          }}
        />
      )}
    </div>
  );
};
