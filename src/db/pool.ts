import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://491cc305f9184ce0ec72c2bde5ef4be677fb59e51a9b3051f45a8b3bafefa448:sk_9FrRzRRwg38w_6VhzSG6d@db.prisma.io:5432/postgres?sslmode=require',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    maxLifetimeSeconds: 60,
});

pool.on('error', (err) => {
    console.log('Unexpected error on idle client', err);
});

export const query = async (text: string, params?: unknown[]) => {
    try {
        const res = await pool.query(text, params);
        return res;
    } catch (error) {
        console.error('Database query error: ', error);
        throw error;
    }
}