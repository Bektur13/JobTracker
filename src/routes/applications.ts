import { Request, Response, Router } from 'express';
import { prisma } from '@/lib/prisma';
import { body, validationResult } from 'express-validator';

const router = Router();

const postValidators = [
    body('company').notEmpty().withMessage('Company is required'),
    body('role').notEmpty().withMessage('Role is required'),
    body('status').optional().isIn(['applied', 'interviewing', 'rejected', 'offer']).withMessage('Status must be one of: applied, interviewing, rejected, offer'),
]

const patchValidators = [
    body('status').optional().isIn(['applied', 'interviewing', 'rejected', 'offer']).withMessage('Status must be one of: applied, interviewing, rejected, offer'),
    body('notes').optional().isString().withMessage('Notes must be string'),
]


router.post('/', postValidators, async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const application = await prisma.application.create({ data: req.body });
        return res.status(201).json(application);
    } catch {
        return res.status(500).json({ error: "Unable to create application" });
    }
});

router.get('/',async (req: Request, res: Response) => {
    try {
        const application = await prisma.application.findMany();
        return res.status(200).json(application);
    } catch (error) {
        console.error('GET error:', error);
        return res.status(500).json({ error: "Unable to fetch application" });
    }
});

router.patch('/:id', patchValidators, async (req: Request, res: Response) => {

    const id = parseInt(req.params.id as string, 10);

    if(Number.isNaN(id)) return res.status(400).json({ error: 'Invalid application id'})

    try {

        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { status, notes } = req.body;
        const data: { status?: string; notes?: string} = {};

        if(status !== undefined) data.status = status;
        if(notes !== undefined) data.notes = notes;

        if(Object.keys(data).length == 0) {
            return res.status(400).json({ error: 'Provide at least status or notes'});
        }

        const application = await prisma.application.update({ where: { id }, data});
        return res.status(200).json(application);

    } catch (error) {
        console.error('PATCH error:', error);
        return res.status(500).json({ error: 'Unable to update application' });
    }
});

export default router;