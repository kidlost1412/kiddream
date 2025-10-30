import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

export interface InventoryItem {
  id: string;
  user_id: string;
  reward_id: string;
  claimed_at: string;
  used_at?: string;
  expires_at?: string;
  status: 'active' | 'used' | 'expired';
  notes?: string;
  reward?: {
    id: string;
    name: string;
    description: string;
    icon: string;
    cost: number;
    category: string;
    expiry_days?: number;
    is_consumable: boolean;
  };
}

interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  fetchInventory: () => Promise<void>;
  useItem: (inventoryId: string) => Promise<{ success: boolean; error?: string }>;
  getActiveItems: () => InventoryItem[];
  getUsedItems: () => InventoryItem[];
  getExpiredItems: () => InventoryItem[];
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  loading: false,

  fetchInventory: async () => {
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // NOTE: Using 'any' because user_inventory table is not in generated types yet
      // Run schema_additions.sql first, then regenerate types
      const { data, error } = await supabase
        .from('user_inventory' as any)
        .select(`
          *,
          reward:rewards(*)
        `)
        .eq('user_id', session.user.id)
        .order('claimed_at', { ascending: false });

      if (error) {
        console.error('Error fetching inventory:', error);
      } else {
        const typedItems: InventoryItem[] = ((data as any) || []).map((item: any) => ({
          ...item,
          status: item.status as 'active' | 'used' | 'expired',
          reward: item.reward ? {
            ...item.reward,
            category: item.reward.category as string,
          } : undefined,
        }));
        set({ items: typedItems });
      }
    } finally {
      set({ loading: false });
    }
  },

  useItem: async (inventoryId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: 'Bạn cần đăng nhập' };
      }

      // NOTE: Using 'any' because function is not in generated types yet
      const { data, error } = await supabase.rpc('use_inventory_item' as any, {
        p_inventory_id: inventoryId,
        p_user_id: session.user.id,
      });

      if (error) {
        console.error('Error using item:', error);
        return { success: false, error: error.message };
      }

      const result = data as any;
      if (result && !result.success) {
        return { success: false, error: result.error };
      }

      // Refresh inventory
      await get().fetchInventory();

      return { success: true };
    } catch (error) {
      console.error('Error using item:', error);
      return { success: false, error: 'Đã xảy ra lỗi' };
    }
  },

  getActiveItems: () => {
    return get().items.filter(item => item.status === 'active');
  },

  getUsedItems: () => {
    return get().items.filter(item => item.status === 'used');
  },

  getExpiredItems: () => {
    return get().items.filter(item => item.status === 'expired');
  },
}));
