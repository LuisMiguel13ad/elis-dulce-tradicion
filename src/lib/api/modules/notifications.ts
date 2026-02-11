import { BaseApiClient } from '../base';

export class NotificationsApi extends BaseApiClient {
    async sendReadyNotification(order: any) {
        const sb = this.ensureSupabase();
        if (!sb) return { success: false, error: 'Supabase not available' };

        try {
            const { data, error } = await sb.functions.invoke('send-ready-notification', {
                body: { order }
            });

            if (error) {
                console.error('Error sending ready notification:', error);
                return { success: false, error };
            }
            return { success: true, data };
        } catch (err) {
            console.error('Exception sending notification:', err);
            return { success: false, error: err };
        }
    }

    async sendOrderConfirmation(order: any) {
        const sb = this.ensureSupabase();
        if (!sb) return { success: false, error: 'Supabase not available' };

        try {
            const { data, error } = await sb.functions.invoke('send-order-confirmation', {
                body: { order }
            });

            if (error) {
                console.error('Error sending confirmation email:', error);
                return { success: false, error };
            }
            return { success: true, data };
        } catch (err) {
            console.error('Exception sending confirmation email:', err);
            return { success: false, error: err };
        }
    }

    async sendStatusUpdate(order: any, oldStatus: string, newStatus: string) {
        const sb = this.ensureSupabase();
        if (!sb) return { success: false, error: 'Supabase not available' };

        try {
            const payload = {
                order: {
                    ...order,
                    new_status: newStatus,
                },
                oldStatus
            };

            const { data, error } = await sb.functions.invoke('send-status-update', {
                body: payload
            });

            if (error) {
                console.error(`Error sending ${newStatus} notification:`, error);
                return { success: false, error };
            }
            return { success: true, data };
        } catch (err) {
            console.error(`Exception sending ${newStatus} notification:`, err);
            return { success: false, error: err };
        }
    }

    async sendOrderIssueNotification(issue: any) {
        const sb = this.ensureSupabase();
        if (!sb) return { success: false, error: 'Supabase not available' };

        try {
            const { data, error } = await sb.functions.invoke('send-order-issue-notification', {
                body: { issue }
            });

            if (error) {
                console.error('Error sending issue notification:', error);
                return { success: false, error };
            }
            return { success: true, data };
        } catch (err) {
            console.error('Exception sending issue notification:', err);
            return { success: false, error: err };
        }
    }

    async sendDailyReport(datePreset?: string) {
        const sb = this.ensureSupabase();
        if (!sb) return { success: false, error: 'Supabase not available' };

        try {
            const { data, error } = await sb.functions.invoke('send-daily-report', {
                body: { datePreset: datePreset || 'today' }
            });

            if (error) {
                console.error('Error sending daily report:', error);
                return { success: false, error };
            }
            return { success: true, data };
        } catch (err) {
            console.error('Exception sending daily report:', err);
            return { success: false, error: err };
        }
    }
}
