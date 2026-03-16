import React from 'react';
import { motion } from 'motion/react';

interface ProductCardProps {
  image: string;
  name: string;
  description?: string;
  price?: number | string;
  demand?: 'High' | 'Medium' | 'Low';
  sales?: number;
  stock?: number;
  isActive?: boolean;
  views?: number;
  category?: string;
  actions?: React.ReactNode;
  onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  image,
  name,
  description,
  price,
  demand,
  sales,
  stock,
  isActive,
  views,
  category,
  actions,
  onClick
}) => {
  return (
    <motion.div 
      whileHover={onClick ? { y: -2, backgroundColor: 'var(--glass-bg)' } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`card flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--glass-border)]">
        <img src={image} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
      
      <div className="flex-1 min-w-0 w-full">
        {category && (
          <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-1">{category}</p>
        )}
        <h3 className="font-semibold text-[var(--text-primary)] text-lg truncate">{name}</h3>
        
        {description && (
          <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">{description}</p>
        )}
        
        {price !== undefined && (
          <p className="text-[var(--text-primary)] font-mono font-bold mt-1">₹{price}</p>
        )}
        
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {demand && (
            <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full border ${
              demand === 'High' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
              demand === 'Medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
              'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {demand} Demand
            </span>
          )}
          
          {sales !== undefined && (
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-muted)]">
              {sales} Sales
            </span>
          )}

          {stock !== undefined && (
            <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-full ${stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {stock > 0 ? `${stock} In Stock` : 'Out of Stock'}
            </span>
          )}

          {isActive !== undefined && !isActive && (
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-full bg-[var(--glass-bg)] text-[var(--text-muted)]">
              Inactive
            </span>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
          {actions}
        </div>
      )}
    </motion.div>
  );
};
