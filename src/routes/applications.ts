import { Request, Response, Router } from 'express';
import { prisma } from '@/lib/prisma';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const application = await prisma.application.create({ data: req.body });
        return res.status(201).json(application);
    } catch {
        return res.status(500).json({ error: "Unable to create application" });
    }
});

router.get('/', async (req: Request, res: Response) => {
    try {
        const application = await prisma.application.findMany();
        return res.status(200).json(application);
    } catch (error) {
        console.error('GET error:', error);
        return res.status(500).json({ error: "Unable to fetch application" });
    }
});

router.patch('/', async (req: Request, res: Response) => {
    try {
        const application = await prisma.application.update({
            where: { status: }
        })
    }
})

export default router;