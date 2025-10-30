
import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useShopStore } from '../stores/useShopStore';
import { useTranslation } from '../hooks/useTranslation';
import ShopItemCard from '../components/features/shop/ShopItemCard';

const ShopPage: React.FC = () => {
    const { user } = useAuthStore();
    const { items, fetchItems } = useShopStore();
    const { t } = useTranslation();

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    return (
        <div className="animate-fade-in p-6 md:p-8 lg:p-10">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">{t('shop.title')}</h2>
                <div className="flex items-center space-x-2 text-xl font-bold text-amber-400 bg-slate-800/70 px-4 py-2 rounded-lg border border-slate-700">
                    <span>{user?.points ?? 0}</span>
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path><path d="M12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"></path></svg>
                    <span className="text-sm text-slate-400 ml-1">{t('shop.yourPoints')}</span>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map(item => (
                    <ShopItemCard key={item.id} item={item} userPoints={user?.points ?? 0} />
                ))}
            </div>
        </div>
    );
};

export default ShopPage;
