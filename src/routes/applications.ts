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

router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const applicationId = parseInt(req.params.id as string, 10);
        if (Number.isNaN(applicationId)) {
            return res.status(400).json({ error: 'Invalid application id' });
        }

        const { status, notes } = req.body;

        const updateApplication = await prisma.application.update({
            where: {
                id: applicationId,
            },
            data: {
                status,
                notes,
            },
        });

        return res.status(200).json(updateApplication);
    } catch (error) {
        console.error('PATCH error:', error);
        return res.status(500).json({ error: 'Unable to update application' });
    }
});

export default router;