import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    host: 'localhost',
    user: 'dbuser',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    maxLifetimeSeconds: 60,
    onConnect: async (client) => {
        await client.query(`SELECT * FROM ${process.env.DATABASE_URL}`)
    }
});

pool.on('error', (err) => {
    console.log('Unexpected error on idle client', err);
});

export const query = async (text: string, params?: unknown[]) => {
    // const start = Date.now();
    try {
        const res = await pool.query(text, params);
        return res;
    } catch (error) {
        console.error('Database query error: ', error);
        throw error;
    }
}