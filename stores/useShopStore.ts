import { create } from 'zustand';
import type { ShopItem } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from './useAuthStore';

interface ShopState {
  items: ShopItem[];
  fetchItems: () => Promise<void>;
  purchaseItem: (itemId: string, cost: number) => Promise<{ success: boolean; error?: string }>;
}

export const useShopStore = create<ShopState>((set) => ({
  items: [],
  fetchItems: async () => {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .order('cost', { ascending: true });

    if (error) {
      console.error('Error fetching shop items:', error);
    } else {
      // FIX: Cast the category property to the specific string literal union to match the ShopItem type.
      const typedItems: ShopItem[] = (data || []).map(item => ({
        ...item,
        category: item.category as ShopItem['category'],
      }));
      set({ items: typedItems });
    }
  },
  purchaseItem: async (itemId: string, cost: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: 'Bạn cần đăng nhập để mua vật phẩm' };
      }

      // Use the claim_reward function which handles everything
      // NOTE: Using 'any' because function is not in generated types yet
      const { data, error } = await supabase.rpc('claim_reward' as any, {
        p_user_id: session.user.id,
        p_reward_id: itemId,
        p_cost: cost,
      });

      if (error) {
        console.error('Error claiming reward:', error);
        return { success: false, error: error.message };
      }

      const result = data as any;
      if (result && !result.success) {
        return { success: false, error: result.error };
      }

      // Update local auth store
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (updatedProfile) {
        useAuthStore.getState().setProfile(updatedProfile);
      }

      return { 
        success: true, 
        expiresAt: result?.expires_at,
        inventoryId: result?.inventory_id 
      };
    } catch (error) {
      console.error('Error purchasing item:', error);
      return { success: false, error: 'Đã xảy ra lỗi không mong muốn' };
    }
  },
}));
