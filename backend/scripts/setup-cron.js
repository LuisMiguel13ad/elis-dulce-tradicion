
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load keys
dotenv.config({ path: path.join(__dirname, '../.env') });

const { DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!DATABASE_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required env vars in backend/.env');
    process.exit(1);
}

const pool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function setupCron() {
    const client = await pool.connect();
    try {
        console.log('🔌 Connected to database...');

        // 1. Enable extensions
        console.log('📦 Enabling extensions...');
        await client.query('CREATE EXTENSION IF NOT EXISTS pg_cron');
        await client.query('CREATE EXTENSION IF NOT EXISTS pg_net');

        // 2. Schedule Job
        // Note: pg_net requests are async.
        // We use the service role key to authenticate the request to the Edge Function.
        const functionUrl = `${SUPABASE_URL}/functions/v1/send-daily-report`;
        const cronSchedule = '0 13 * * *'; // 13:00 UTC = 8:00 AM EST (approx, assuming Standard Time)
        // Adjust timezone if needed, usually servers are UTC.

        const jobName = 'daily-sales-report';

        console.log(`📅 Scheduling job "${jobName}" for ${cronSchedule} UTC...`);
        console.log(`   Target: ${functionUrl}`);

        // Remove existing job if any to avoid duplicates
        await client.query(`SELECT cron.unschedule($1)`, [jobName]);

        // Schedule new job
        // We use net.http_post directly inside the cron command
        const sql = `
            SELECT cron.schedule(
                $1, -- job name
                $2, -- schedule
                $$
                select
                    net.http_post(
                        url:='${functionUrl}',
                        headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${SUPABASE_SERVICE_ROLE_KEY}"}'::jsonb,
                        body:='{"datePreset": "yesterday"}'::jsonb
                    ) as request_id;
                $$
            );
        `;

        await client.query(sql, [jobName, cronSchedule]);

        console.log('✅ Job scheduled successfully!');

        // 3. Verify
        const { rows } = await client.query(`SELECT * FROM cron.job WHERE jobname = $1`, [jobName]);
        console.log('\n📊 Current Cron Jobs:');
        console.table(rows.map(r => ({ name: r.jobname, schedule: r.schedule, command: r.command.substring(0, 50) + '...' })));

    } catch (err) {
        console.error('❌ Error setting up cron:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

setupCron();
