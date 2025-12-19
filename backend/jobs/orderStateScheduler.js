/**
 * Scheduled State Transitions for Orders
 * Handles automatic state transitions based on time and conditions
 */

import cron from 'node-cron';
import pool from '../db/connection.js';
import {
  validateTransition,
  getSideEffects,
} from '../lib/orderStateMachine.js';

/**
 * Auto-complete orders 24 hours after ready (if not explicitly completed)
 */
async function autoCompleteReadyOrders() {
  const client = await pool.connect();
  
  try {
    // Find orders that have been ready for 24+ hours
    const result = await client.query(
      `SELECT * FROM orders 
       WHERE status = 'ready' 
       AND ready_at IS NOT NULL
       AND ready_at < NOW() - INTERVAL '24 hours'
       AND status != 'completed'`,
      []
    );

    for (const order of result.rows) {
      try {
        await client.query('BEGIN');

        // Validate transition
        const validation = validateTransition(
          'ready',
          'completed',
          order,
          {
            orderId: order.id,
            userRole: 'system',
            reason: 'Auto-completed after 24 hours',
          }
        );

        if (validation.valid) {
          // Update order
          await client.query(
            `UPDATE orders 
             SET status = 'completed', 
                 completed_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [order.id]
          );

          // Insert status history
          await client.query(
            `INSERT INTO order_status_history (
              order_id, previous_status, status, user_id, notes, metadata
            ) VALUES ($1, $2, $3, NULL, $4, $5)`,
            [
              order.id,
              'ready',
              'completed',
              'Auto-completed after 24 hours',
              JSON.stringify({ auto: true, reason: '24_hour_timeout' }),
            ]
          );

          await client.query('COMMIT');

          // Execute side effects
          const sideEffects = getSideEffects('ready', 'completed');
          executeSideEffects(sideEffects, { ...order, status: 'completed' }, 'ready', 'Auto-completed').catch(
            (err) => console.error(`Error executing side effects for order ${order.id}:`, err)
          );

          console.log(`✅ Auto-completed order ${order.order_number}`);
        }
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error auto-completing order ${order.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in autoCompleteReadyOrders:', error);
  } finally {
    client.release();
  }
}

/**
 * Auto-cancel unpaid orders after 30 minutes of creation
 */
async function autoCancelUnpaidOrders() {
  const client = await pool.connect();
  
  try {
    // Find pending orders that are unpaid and older than 30 minutes
    const result = await client.query(
      `SELECT * FROM orders 
       WHERE status = 'pending' 
       AND payment_status != 'paid'
       AND created_at < NOW() - INTERVAL '30 minutes'`,
      []
    );

    for (const order of result.rows) {
      try {
        await client.query('BEGIN');

        // Validate transition
        const validation = validateTransition(
          'pending',
          'cancelled',
          order,
          {
            orderId: order.id,
            userRole: 'system',
            reason: 'Auto-cancelled: Payment not completed within 30 minutes',
          }
        );

        if (validation.valid) {
          // Update order
          await client.query(
            `UPDATE orders 
             SET status = 'cancelled', 
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [order.id]
          );

          // Insert status history
          await client.query(
            `INSERT INTO order_status_history (
              order_id, previous_status, status, user_id, notes, metadata
            ) VALUES ($1, $2, $3, NULL, $4, $5)`,
            [
              order.id,
              'pending',
              'cancelled',
              'Auto-cancelled: Payment not completed within 30 minutes',
              JSON.stringify({ auto: true, reason: 'payment_timeout' }),
            ]
          );

          await client.query('COMMIT');

          // Execute side effects
          const sideEffects = getSideEffects('pending', 'cancelled');
          executeSideEffects(sideEffects, { ...order, status: 'cancelled' }, 'pending', 'Payment timeout').catch(
            (err) => console.error(`Error executing side effects for order ${order.id}:`, err)
          );

          console.log(`✅ Auto-cancelled unpaid order ${order.order_number}`);
        }
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error auto-cancelling order ${order.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in autoCancelUnpaidOrders:', error);
  } finally {
    client.release();
  }
}

/**
 * Send reminder if order confirmed but not started after 12 hours
 */
async function sendReminderForUnstartedOrders() {
  const client = await pool.connect();
  
  try {
    // Find confirmed orders that haven't been started after 12 hours
    const result = await client.query(
      `SELECT o.*, 
              (SELECT MAX(created_at) FROM order_status_history 
               WHERE order_id = o.id AND status = 'confirmed') as confirmed_at
       FROM orders o
       WHERE o.status = 'confirmed'
       AND EXISTS (
         SELECT 1 FROM order_status_history 
         WHERE order_id = o.id 
         AND status = 'confirmed'
         AND created_at < NOW() - INTERVAL '12 hours'
       )
       AND NOT EXISTS (
         SELECT 1 FROM order_status_history 
         WHERE order_id = o.id 
         AND status = 'in_progress'
       )`,
      []
    );

    for (const order of result.rows) {
      try {
        // Send reminder email (this would integrate with your email service)
        console.log(`📧 Reminder: Order ${order.order_number} confirmed but not started after 12 hours`);
        
        // You would call your email service here
        // await sendReminderEmail(order);
      } catch (error) {
        console.error(`Error sending reminder for order ${order.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in sendReminderForUnstartedOrders:', error);
  } finally {
    client.release();
  }
}

/**
 * Execute side effects for transition
 */
async function executeSideEffects(sideEffects, order, previousStatus, reason) {
  // Send email
  if (sideEffects.sendEmail && sideEffects.emailType) {
    try {
      const { sendStatusUpdateEmail } = await import('../utils/edgeFunctions.js');
      await sendStatusUpdateEmail(order, sideEffects.emailType, {
        previousStatus,
        reason,
      });
    } catch (err) {
      console.error('Error sending email:', err);
    }
  }

  // Send webhook
  if (sideEffects.sendWebhook && sideEffects.webhookEvent) {
    try {
      const { triggerWebhook } = await import('../utils/webhooks.js');
      await triggerWebhook(sideEffects.webhookEvent, {
        order,
        previousStatus,
      });
    } catch (err) {
      console.error('Error triggering webhook:', err);
    }
  }
}

/**
 * Start scheduled jobs
 */
export function startScheduledJobs() {
  // Run every hour: Auto-complete ready orders
  cron.schedule('0 * * * *', () => {
    console.log('🕐 Running scheduled job: autoCompleteReadyOrders');
    autoCompleteReadyOrders();
  });

  // Run every 5 minutes: Auto-cancel unpaid orders
  cron.schedule('*/5 * * * *', () => {
    console.log('🕐 Running scheduled job: autoCancelUnpaidOrders');
    autoCancelUnpaidOrders();
  });

  // Run every 6 hours: Send reminders for unstarted orders
  cron.schedule('0 */6 * * *', () => {
    console.log('🕐 Running scheduled job: sendReminderForUnstartedOrders');
    sendReminderForUnstartedOrders();
  });

  console.log('✅ Scheduled state transition jobs started');
}
