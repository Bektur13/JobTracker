import express from 'express';
import { query } from '@/Pool.ts';

const router = express.Router();

router.get('/', async (req, res) => {

    const id = Number(req.query.id);

    try {
        if(id) {
            const { rows } = await query('SELECT * FROM applications WHERE id = $1', [id]);
        
            if(rows.length === 0) {
                return res.status(404).json( {error: "Application not found"} );
            }

            return res.json(rows[0]);
        }

        const { rows } = await query('SELECT * FROM applications')
        return res.json(rows);

    } catch(error) {
        return res.status(500).json({ error: "Internal Server Error"} );
    }

});

export default router;