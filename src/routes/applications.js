import express from 'express';
import { PrismaClient } from '@prisma/client';
import { query } from '@/Pool.ts';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {

    const id = Number(req.query.id);

    try {
        if(id) {
            const application = await prisma.application.findUnique({
                where: {id: id},
            })
        
            if(!application) {
                return res.status(404).json({error: 'Application not found'});
            }

            return res.json(application);
        }

        const applications = await prisma.application.findMany();
        return res.json(applications);

    } catch(err) {
        return res.status(500).json({ error: "Internal Server Error"} );
    }

});

export default router;