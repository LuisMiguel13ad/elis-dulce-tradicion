-- Analytics events table for simple self-hosted analytics
-- Stores page views, clicks, and custom events from the frontend

CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event_name VARCHAR(100) NOT NULL,
  event_properties JSONB DEFAULT '{}',
  page_path VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_path ON analytics_events(page_path);

-- RLS: Only staff can read analytics data
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read analytics"
  ON analytics_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND role IN ('owner', 'baker', 'admin')
  ));

-- Secure RPC for public event tracking (non-blocking, fire-and-forget)
CREATE OR REPLACE FUNCTION track_analytics_event(
  p_event_name TEXT,
  p_properties JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO analytics_events (event_name, event_properties, page_path, created_at)
  VALUES (
    p_event_name,
    p_properties,
    p_properties->>'url',
    NOW()
  );
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  -- Silently fail - analytics should never block user experience
  RETURN FALSE;
END;
$$;

-- Grant execute to all (including anonymous for public page tracking)
GRANT EXECUTE ON FUNCTION track_analytics_event(TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION track_analytics_event(TEXT, JSONB) TO authenticated;
