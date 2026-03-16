import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, MessageCircle, Share2, Send, Camera } from 'lucide-react';
import { User, CommunityPost, Language } from '../types';
import { api } from '../api';
import { useTranslation } from '../translations';

export const CommunityFeed = ({ user, onBack }: { user: User, onBack: () => void }) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const t = useTranslation(user?.language || Language.ENGLISH);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await api.get('/api/community');
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPostImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLike = async (id: number) => {
    try {
      await api.post(`/api/community/like/${id}`, {});
      setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() && !postImage) return;
    setIsPosting(true);
    try {
      await api.post('/api/community', { content: newPost, image_url: postImage || '' });
      setNewPost('');
      setPostImage(null);
      fetchPosts();
    } catch (err) {
      alert('Failed to post');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="p-6 pb-32 futuristic-grid min-h-screen">
      <header className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors font-mono text-xs uppercase tracking-widest">
          <ArrowLeft size={16} className="mr-2" /> {t('return')}
        </button>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{t('village_wall')}</h2>
        <div className="w-8" />
      </header>

      <div className="card p-5 mb-10 space-y-5 border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-bold text-xl shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            {user.username[0].toUpperCase()}
          </div>
          <div className="flex-1 space-y-4">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder={t('broadcast') + "..."}
              className="w-full bg-transparent border-none outline-none resize-none h-24 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm leading-relaxed"
            />
            {postImage && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[var(--glass-border)]">
                <img src={postImage} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setPostImage(null)}
                  className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white/60 hover:text-white"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-[var(--glass-border)]">
          <div className="relative">
            <button className="p-2 text-[var(--text-muted)] hover:text-cyan-400 transition-colors bg-[var(--glass-bg)] rounded-lg border border-[var(--glass-border)]">
              <Camera size={20} />
            </button>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          <button
            onClick={handlePost}
            disabled={isPosting || (!newPost.trim() && !postImage)}
            className="neon-button py-2.5 px-8 flex items-center gap-2 disabled:opacity-50"
          >
            {isPosting ? t('transmitting').toUpperCase() : <><Send size={16} /> {t('broadcast').toUpperCase()}</>}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-8 h-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
          <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{t('syncing_feed')}...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card overflow-hidden border-[var(--glass-border)] bg-[var(--glass-bg)] group"
            >
              <div className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-mono font-bold text-xl">
                  {post.username[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] tracking-tight">{post.username}</h4>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mt-0.5">{new Date(post.timestamp).toLocaleDateString()} // NODE_ACTIVE</p>
                </div>
              </div>
              
              <div className="px-5 pb-5">
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{post.content}</p>
              </div>

              {post.image_url && (
                <div className="relative overflow-hidden h-64 border-y border-[var(--glass-border)]">
                  <img src={post.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}

              <div className="p-4 flex items-center gap-8 border-t border-[var(--glass-border)] bg-[var(--glass-bg)]">
                <button 
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-2.5 text-[var(--text-muted)] hover:text-rose-500 transition-all group/btn"
                >
                  <Heart size={18} className={post.likes > 0 ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'group-hover/btn:scale-110 transition-transform'} />
                  <span className="text-xs font-mono font-bold">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2.5 text-[var(--text-muted)] hover:text-cyan-400 transition-all group/btn">
                  <MessageCircle size={18} className="group-hover/btn:scale-110 transition-transform" />
                  <span className="text-xs font-mono font-bold uppercase tracking-widest">Reply</span>
                </button>
                <button className="flex items-center gap-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all ml-auto">
                  <Share2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
