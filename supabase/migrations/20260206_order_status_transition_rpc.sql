-- Atomic order status transition with history recording
-- This RPC ensures status updates and history are recorded together

CREATE OR REPLACE FUNCTION transition_order_status(
  p_order_id INTEGER,
  p_new_status VARCHAR(50),
  p_user_id UUID DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_previous_status VARCHAR(50);
  v_time_diff INTEGER;
  v_confirmed_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Lock the order row to prevent race conditions
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;

  IF v_order IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  v_previous_status := v_order.status;

  -- Prevent no-op transitions
  IF v_previous_status = p_new_status THEN
    RETURN jsonb_build_object('success', true, 'message', 'Status unchanged');
  END IF;

  -- Calculate time metrics based on transition type
  IF p_new_status = 'confirmed' AND v_order.created_at IS NOT NULL THEN
    v_time_diff := EXTRACT(EPOCH FROM (NOW() - v_order.created_at)) / 60;
    UPDATE orders SET time_to_confirm = v_time_diff WHERE id = p_order_id;
  END IF;

  IF p_new_status = 'ready' THEN
    -- Find when order was confirmed from history
    SELECT created_at INTO v_confirmed_at
    FROM order_status_history
    WHERE order_id = p_order_id AND status = 'confirmed'
    ORDER BY created_at DESC LIMIT 1;

    IF v_confirmed_at IS NOT NULL THEN
      v_time_diff := EXTRACT(EPOCH FROM (NOW() - v_confirmed_at)) / 60;
      UPDATE orders SET time_to_ready = v_time_diff WHERE id = p_order_id;
    END IF;
  END IF;

  IF p_new_status = 'completed' AND v_order.ready_at IS NOT NULL THEN
    v_time_diff := EXTRACT(EPOCH FROM (NOW() - v_order.ready_at)) / 60;
    UPDATE orders SET time_to_complete = v_time_diff WHERE id = p_order_id;
  END IF;

  -- Update the order status with relevant timestamps
  UPDATE orders SET
    status = p_new_status,
    updated_at = NOW(),
    ready_at = CASE WHEN p_new_status = 'ready' THEN NOW() ELSE ready_at END,
    completed_at = CASE WHEN p_new_status = 'completed' THEN NOW() ELSE completed_at END,
    cancelled_at = CASE WHEN p_new_status = 'cancelled' THEN NOW() ELSE cancelled_at END,
    cancellation_reason = CASE WHEN p_new_status = 'cancelled' THEN p_reason ELSE cancellation_reason END
  WHERE id = p_order_id;

  -- Insert history record for audit trail
  INSERT INTO order_status_history (
    order_id,
    status,
    previous_status,
    user_id,
    notes,
    metadata,
    created_at
  ) VALUES (
    p_order_id,
    p_new_status,
    v_previous_status,
    p_user_id,
    p_reason,
    p_metadata,
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'previous_status', v_previous_status,
    'new_status', p_new_status,
    'order_id', p_order_id
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant to authenticated users (staff will use this)
GRANT EXECUTE ON FUNCTION transition_order_status(INTEGER, VARCHAR, UUID, TEXT, JSONB) TO authenticated;
