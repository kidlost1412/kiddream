import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useShopStore } from '../stores/useShopStore';
import { useTranslation } from '../hooks/useTranslation';
import ShopItemCard from '../components/features/shop/ShopItemCard';
import { AnimatedPage, StaggerContainer, AnimatedItem } from '../components/AnimatedPage';
import { TodoListSkeleton } from '../components/ui/Skeleton';
import { motion } from 'framer-motion';

const ShopPage: React.FC = () => {
  const { user } = useAuthStore();
  const { items, fetchItems } = useShopStore();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchItems();
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [fetchItems]);

  const filteredItems =
    filter === 'all' ? items : items.filter(item => item.category === filter);

  const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))];

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 lg:p-10">
        <div className="h-10 w-48 bg-slate-700/50 animate-pulse rounded-lg mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-64 bg-slate-700/50 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <AnimatedPage className="p-6 md:p-8 lg:p-10">
      <motion.div
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-white">{t('shop.title')}</h2>
        <motion.div
          className="flex items-center space-x-2 text-xl font-bold text-amber-400 bg-slate-800/70 px-4 py-2 rounded-lg border border-slate-700"
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span>{user?.points ?? 0}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
            <path d="M12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"></path>
          </svg>
          <span className="text-sm text-slate-400 ml-1">{t('shop.yourPoints')}</span>
        </motion.div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        className="flex flex-wrap gap-2 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {categories.map(cat => (
          <motion.button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === cat
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {cat === 'all' ? 'Tất cả' : cat}
          </motion.button>
        ))}
      </motion.div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <motion.div
          className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-slate-400 text-lg">Không có phần thưởng nào</p>
        </motion.div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <AnimatedItem key={item.id}>
              <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
                <ShopItemCard item={item} userPoints={user?.points ?? 0} />
              </motion.div>
            </AnimatedItem>
          ))}
        </StaggerContainer>
      )}
    </AnimatedPage>
  );
};

export default ShopPage;
