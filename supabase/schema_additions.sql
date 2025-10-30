-- =================================================================
-- ZENQUEST SCHEMA ADDITIONS - INVENTORY & ATTACHMENTS
-- =================================================================
-- Run this AFTER the main schema.sql.txt
-- =================================================================

-- ----------------------------------------
-- TABLE: user_inventory
-- Stores rewards that users have claimed
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.user_inventory (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    reward_id uuid NOT NULL REFERENCES public.rewards ON DELETE CASCADE,
    claimed_at timestamp with time zone DEFAULT now(),
    used_at timestamp with time zone,
    expires_at timestamp with time zone,
    status text NOT NULL DEFAULT 'active', -- 'active', 'used', 'expired'
    notes text,
    CONSTRAINT valid_status CHECK (status IN ('active', 'used', 'expired'))
);

COMMENT ON TABLE public.user_inventory IS 'Tracks rewards claimed by users and their usage status';

-- Index for faster queries
CREATE INDEX idx_user_inventory_user_id ON public.user_inventory(user_id);
CREATE INDEX idx_user_inventory_status ON public.user_inventory(status);

-- ----------------------------------------
-- TABLE: todo_attachments
-- Stores file attachments for todos
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.todo_attachments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    todo_id uuid NOT NULL REFERENCES public.todos ON DELETE CASCADE,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_type text NOT NULL, -- 'image', 'document', 'other'
    file_size bigint NOT NULL, -- in bytes
    uploaded_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.todo_attachments IS 'Stores file attachments for todo items';

-- Index for faster queries
CREATE INDEX idx_todo_attachments_todo_id ON public.todo_attachments(todo_id);

-- ----------------------------------------
-- FUNCTION: Auto-expire inventory items
-- ----------------------------------------
CREATE OR REPLACE FUNCTION expire_inventory_items()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_inventory
    SET status = 'expired'
    WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < now();
END;
$$;

COMMENT ON FUNCTION expire_inventory_items IS 'Automatically marks expired inventory items';

-- ----------------------------------------
-- RLS POLICIES: user_inventory
-- ----------------------------------------
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

-- Users can view their own inventory
CREATE POLICY "Users can view own inventory"
ON public.user_inventory
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert into their own inventory (when claiming rewards)
CREATE POLICY "Users can add to own inventory"
ON public.user_inventory
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own inventory (mark as used)
CREATE POLICY "Users can update own inventory"
ON public.user_inventory
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------
-- RLS POLICIES: todo_attachments
-- ----------------------------------------
ALTER TABLE public.todo_attachments ENABLE ROW LEVEL SECURITY;

-- Users can view attachments for their own todos
CREATE POLICY "Users can view own todo attachments"
ON public.todo_attachments
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.todos
        WHERE todos.id = todo_attachments.todo_id
        AND todos.user_id = auth.uid()
    )
);

-- Users can add attachments to their own todos
CREATE POLICY "Users can add attachments to own todos"
ON public.todo_attachments
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.todos
        WHERE todos.id = todo_attachments.todo_id
        AND todos.user_id = auth.uid()
    )
);

-- Users can delete attachments from their own todos
CREATE POLICY "Users can delete own todo attachments"
ON public.todo_attachments
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.todos
        WHERE todos.id = todo_attachments.todo_id
        AND todos.user_id = auth.uid()
    )
);

-- ----------------------------------------
-- UPDATE: rewards table - add expiry_days
-- ----------------------------------------
ALTER TABLE public.rewards 
ADD COLUMN IF NOT EXISTS expiry_days integer,
ADD COLUMN IF NOT EXISTS is_consumable boolean DEFAULT true;

COMMENT ON COLUMN public.rewards.expiry_days IS 'Number of days until reward expires after claiming (null = never expires)';
COMMENT ON COLUMN public.rewards.is_consumable IS 'Whether the reward can be marked as used';

-- ----------------------------------------
-- SEED DATA: Update existing rewards with expiry
-- ----------------------------------------
UPDATE public.rewards SET expiry_days = 7, is_consumable = true WHERE category = 'Relax';
UPDATE public.rewards SET expiry_days = 30, is_consumable = true WHERE category = 'Focus';
UPDATE public.rewards SET expiry_days = null, is_consumable = false WHERE category = 'Growth';

-- ----------------------------------------
-- FUNCTION: Claim reward and add to inventory
-- ----------------------------------------
CREATE OR REPLACE FUNCTION claim_reward(
    p_user_id uuid,
    p_reward_id uuid,
    p_cost integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_points integer;
    v_expiry_days integer;
    v_expires_at timestamp with time zone;
    v_inventory_id uuid;
BEGIN
    -- Get user's current points
    SELECT points INTO v_user_points
    FROM public.profiles
    WHERE id = p_user_id;

    -- Check if user has enough points
    IF v_user_points < p_cost THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Không đủ điểm'
        );
    END IF;

    -- Get reward expiry days
    SELECT expiry_days INTO v_expiry_days
    FROM public.rewards
    WHERE id = p_reward_id;

    -- Calculate expiry date
    IF v_expiry_days IS NOT NULL THEN
        v_expires_at := now() + (v_expiry_days || ' days')::interval;
    END IF;

    -- Deduct points
    UPDATE public.profiles
    SET points = points - p_cost
    WHERE id = p_user_id;

    -- Add to inventory
    INSERT INTO public.user_inventory (user_id, reward_id, expires_at)
    VALUES (p_user_id, p_reward_id, v_expires_at)
    RETURNING id INTO v_inventory_id;

    RETURN jsonb_build_object(
        'success', true,
        'inventory_id', v_inventory_id,
        'expires_at', v_expires_at
    );
END;
$$;

COMMENT ON FUNCTION claim_reward IS 'Claims a reward, deducts points, and adds to user inventory';

-- ----------------------------------------
-- FUNCTION: Use inventory item
-- ----------------------------------------
CREATE OR REPLACE FUNCTION use_inventory_item(
    p_inventory_id uuid,
    p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_status text;
    v_is_consumable boolean;
BEGIN
    -- Get current status and check if consumable
    SELECT ui.status, r.is_consumable
    INTO v_status, v_is_consumable
    FROM public.user_inventory ui
    JOIN public.rewards r ON ui.reward_id = r.id
    WHERE ui.id = p_inventory_id
    AND ui.user_id = p_user_id;

    -- Check if item exists and belongs to user
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Không tìm thấy vật phẩm'
        );
    END IF;

    -- Check if already used or expired
    IF v_status != 'active' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Vật phẩm đã được sử dụng hoặc hết hạn'
        );
    END IF;

    -- Check if consumable
    IF NOT v_is_consumable THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Vật phẩm này không thể sử dụng'
        );
    END IF;

    -- Mark as used
    UPDATE public.user_inventory
    SET status = 'used',
        used_at = now()
    WHERE id = p_inventory_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Đã sử dụng vật phẩm'
    );
END;
$$;

COMMENT ON FUNCTION use_inventory_item IS 'Marks an inventory item as used';
