import { Pool } from 'pg';

const pool = new Pool({
    host: 'localhost',
    user: 'database-user',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    maxLifetimeSeconds: 60,
    onConnect: async (client) => {
        await client.query(`SET ${process.env.DATABASE_URL} TO  `)
    }
});

const fetchData = async (id) => {
    try {
        const res = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
        return res.rows[0];
    } catch (err) {
        console.error('Query error', err);
    }
}
