import React, { useState } from 'react';
import Button from '../../ui/Button';
import type { ShopItem } from '../../../types';
import { useShopStore } from '../../../stores/useShopStore';
import { useTranslation } from '../../../hooks/useTranslation';

interface ShopItemCardProps {
    item: ShopItem;
    userPoints: number;
}

const categoryStyles = {
    'Relax': 'bg-green-500/20 text-green-300',
    'Focus': 'bg-sky-500/20 text-sky-300',
    'Joy': 'bg-purple-500/20 text-purple-300',
    'Growth': 'bg-amber-500/20 text-amber-300',
};

const ShopItemCard: React.FC<ShopItemCardProps> = ({ item, userPoints }) => {
    const { purchaseItem } = useShopStore();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const canAfford = userPoints >= item.cost;

    const handlePurchase = async () => {
        if (!canAfford || loading) return;
        
        setLoading(true);
        const result = await purchaseItem(item.id, item.cost);
        
        if (result.success) {
            const expiryMsg = (result as any).expiresAt 
                ? `\n⏰ Hết hạn: ${new Date((result as any).expiresAt).toLocaleDateString('vi-VN')}`
                : '';
            alert(`🎉 ${t('shop.purchaseSuccess', { name: item.name })}${expiryMsg}\n\n✅ Đã thêm vào kho đồ!`);
        } else {
            alert(t('shop.purchaseError', { error: result.error || t('errors.generic') }));
        }
        setLoading(false);
    };

    return (
        <div className={`bg-slate-800/70 rounded-xl border border-slate-700 p-5 flex flex-col justify-between h-full transition-all duration-300 ${!canAfford ? 'opacity-50' : 'hover:border-slate-600 hover:bg-slate-800'}`}>
            <div>
                <div className="flex justify-between items-start mb-3">
                    <span className="text-5xl">{item.icon}</span>
                     <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryStyles[item.category]}`}>{item.category}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100">{item.name}</h3>
                <p className="text-sm text-slate-400 mt-1 h-16">{item.description}</p>
            </div>
            <div className="mt-4">
                 <p className="text-2xl font-bold text-amber-400 mb-3">{item.cost} {t('quests.points')}</p>
                <Button 
                    className="w-full" 
                    disabled={!canAfford || loading}
                    onClick={handlePurchase}
                >
                    {loading ? t('shop.processing') : (canAfford ? t('shop.claimReward') : t('shop.notEnoughPoints'))}
                </Button>
            </div>
        </div>
    );
};

export default ShopItemCard;
