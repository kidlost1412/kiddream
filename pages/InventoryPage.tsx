import React, { useEffect, useState } from 'react';
import { useInventoryStore, type InventoryItem } from '../stores/useInventoryStore';
import { useTranslation } from '../hooks/useTranslation';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const InventoryPage: React.FC = () => {
  const { items, loading, fetchInventory, useItem } = useInventoryStore();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'expired'>('active');
  const [usingItemId, setUsingItemId] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const handleUseItem = async (inventoryId: string) => {
    setUsingItemId(inventoryId);
    const result = await useItem(inventoryId);
    
    if (result.success) {
      alert('✅ Đã sử dụng vật phẩm thành công!');
    } else {
      alert(`❌ ${result.error}`);
    }
    setUsingItemId(null);
  };

  const getDaysUntilExpiry = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-500/20 text-green-300 border-green-500',
      used: 'bg-slate-500/20 text-slate-400 border-slate-500',
      expired: 'bg-red-500/20 text-red-300 border-red-500',
    };
    const labels = {
      active: 'Đang hoạt động',
      used: 'Đã sử dụng',
      expired: 'Hết hạn',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="animate-fade-in p-6 md:p-8 lg:p-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">{t('shop.inventory')}</h2>
        <Button onClick={fetchInventory} disabled={loading} variant="secondary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Làm mới
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'active', label: 'Đang dùng', count: items.filter(i => i.status === 'active').length },
          { key: 'used', label: 'Đã dùng', count: items.filter(i => i.status === 'used').length },
          { key: 'expired', label: 'Hết hạn', count: items.filter(i => i.status === 'expired').length },
          { key: 'all', label: 'Tất cả', count: items.length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === key
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Inventory Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="text-slate-400 mt-4">Đang tải...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-xl text-slate-400">{t('shop.noRewards')}</p>
          <p className="text-sm text-slate-500 mt-2">Hãy mua phần thưởng từ cửa hàng!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const daysLeft = getDaysUntilExpiry(item.expires_at);
            const isExpiringSoon = daysLeft !== null && daysLeft <= 3 && daysLeft > 0;

            return (
              <Card key={item.id} className={`relative ${item.status !== 'active' ? 'opacity-60' : ''}`}>
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {getStatusBadge(item.status)}
                </div>

                {/* Reward Info */}
                <div className="mb-4">
                  <div className="text-6xl mb-3">{item.reward?.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.reward?.name}</h3>
                  <p className="text-sm text-slate-400">{item.reward?.description}</p>
                </div>

                {/* Metadata */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-slate-400">
                    <span>Nhận lúc:</span>
                    <span>{new Date(item.claimed_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  
                  {item.used_at && (
                    <div className="flex justify-between text-slate-400">
                      <span>Đã dùng:</span>
                      <span>{new Date(item.used_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}

                  {item.expires_at && item.status === 'active' && (
                    <div className={`flex justify-between ${isExpiringSoon ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
                      <span>Hết hạn:</span>
                      <span>
                        {daysLeft !== null && daysLeft > 0 
                          ? `${daysLeft} ngày nữa`
                          : new Date(item.expires_at).toLocaleDateString('vi-VN')
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {item.status === 'active' && item.reward?.is_consumable && (
                  <Button
                    className="w-full"
                    onClick={() => handleUseItem(item.id)}
                    disabled={usingItemId === item.id}
                  >
                    {usingItemId === item.id ? 'Đang xử lý...' : t('shop.useReward')}
                  </Button>
                )}

                {item.status === 'active' && !item.reward?.is_consumable && (
                  <div className="text-center text-sm text-slate-500 italic">
                    Vật phẩm vĩnh viễn
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
