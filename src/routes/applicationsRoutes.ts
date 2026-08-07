import { Request, Response, Router } from 'express';
import { prisma } from '@/lib/prisma';
import { Prisma, Stage } from '../../generated/prisma/client';
import { validationResult } from 'express-validator';
import { postValidators, getValidators, stageValidators } from '@/middlewares/applications';

const router = Router();

const SORTABLE_FIELDS = ['dateApplied', 'createdAt', 'updatedAt', 'role'] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

router.get('/', getValidators, async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { stage, userId, companyId, role, sortBy, order } = req.query as Record<string, string | undefined>;

        const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
        const pageSize = Math.min(Math.max(parseInt(req.query.pageSize as string, 10) || 20, 1), 100);

        const where: Prisma.JobApplicationWhereInput = {};
        if (stage) where.stage = stage as Stage;
        if (userId) where.userId = userId;
        if (companyId) where.companyId = companyId;
        if (role) where.role = { contains: role, mode: 'insensitive' };

        const sortField: SortableField = SORTABLE_FIELDS.includes(sortBy as SortableField)
            ? (sortBy as SortableField)
            : 'dateApplied';
        const sortOrder: Prisma.SortOrder = order === 'asc' ? 'asc' : 'desc';

        const [applications, total] = await prisma.$transaction([
            prisma.jobApplication.findMany({
                where,
                orderBy: { [sortField]: sortOrder },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.jobApplication.count({ where }),
        ]);

        return res.status(200).json({
            data: applications,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    } catch (error) {
        console.error('GET error:', error);
        return res.status(500).json({ error: 'Unable to fetch applications' });
    }
});

router.post('/', postValidators, async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { role, userId, companyId, stage, skills, dateApplied } = req.body;

        const application = await prisma.jobApplication.create({
            data: {
                role,
                userId,
                companyId,
                stage: stage ?? Stage.APPLIED,
                skills: skills ?? [],
                ...(dateApplied ? { dateApplied: new Date(dateApplied) } : {}),
            },
        });

        return res.status(201).json(application);
    } catch (error) {
        console.error('POST error:', error);
        return res.status(500).json({ error: 'Unable to create application' });
    }
});

router.patch('/:id/stage', stageValidators, async (req: Request, res: Response) => {
    const id = req.params.id as string;

    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const application = await prisma.jobApplication.update({
            where: { id },
            data: { stage: req.body.stage },
        });

        return res.status(200).json(application);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: 'Application not found' });
        }
        console.error('PATCH error:', error);
        return res.status(500).json({ error: 'Unable to update application stage' });
    }
});

export default router;
