-- =====================================================
-- Order Notes (Internal Staff Comments) Schema
-- =====================================================

CREATE TABLE IF NOT EXISTS order_notes (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    author_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_notes_order_id ON order_notes(order_id);
CREATE INDEX IF NOT EXISTS idx_order_notes_created_at ON order_notes(created_at DESC);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;

-- Staff (owner/baker) can read all notes
CREATE POLICY "Staff can view all order notes" ON order_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('owner', 'baker')
    )
  );

-- Staff can create notes (must be their own created_by)
CREATE POLICY "Staff can create order notes" ON order_notes
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('owner', 'baker')
    )
  );

-- Staff can delete only their own notes
CREATE POLICY "Staff can delete own notes" ON order_notes
  FOR DELETE USING (
    created_by = auth.uid()
  );
