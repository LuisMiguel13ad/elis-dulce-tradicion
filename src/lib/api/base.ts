import { supabase, isSupabaseConfigured } from '../supabase';

export class BaseApiClient {
    protected ensureSupabase() {
        if (!isSupabaseConfigured() || !supabase) {
            console.warn('Supabase not configured or available. Some features will use fallback data.');
            return null;
        }
        return supabase;
    }
}
