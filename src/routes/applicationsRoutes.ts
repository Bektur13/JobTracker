import { Request, Response, Router } from 'express';
import { prisma } from '@/lib/prisma';
import { Prisma, Stage } from '../../generated/prisma/client';
import { validationResult } from 'express-validator';
import { postValidators, getValidators, stageValidators, idParamValidators, patchValidators } from '@/middlewares/applications';
import { resolveDbUser } from '@/middlewares/auth';
import { findOrCreateCompanyByName } from '@/lib/companies';

const router = Router();

const SORTABLE_FIELDS = ['dateApplied', 'createdAt', 'updatedAt', 'role'] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

router.use(resolveDbUser);

router.get('/', getValidators, async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { stage, companyId, role, sortBy, order } = req.query as Record<string, string | undefined>;

        const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
        const pageSize = Math.min(Math.max(parseInt(req.query.pageSize as string, 10) || 20, 1), 100);

        const where: Prisma.JobApplicationWhereInput = { userId: req.dbUser!.id };
        if (stage) where.stage = stage as Stage;
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
                include: { company: true },
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

        const {
            role, companyId, companyName, stage, skills, dateApplied,
            location, salaryRange, description, sourceUrl, source,
        } = req.body;

        const resolvedCompanyId = companyId ?? (await findOrCreateCompanyByName(companyName)).id;

        const application = await prisma.jobApplication.create({
            data: {
                role,
                companyId: resolvedCompanyId,
                userId: req.dbUser!.id,
                stage: stage ?? Stage.APPLIED,
                skills: skills ?? [],
                location, salaryRange, description, sourceUrl, source,
                ...(dateApplied ? { dateApplied: new Date(dateApplied) } : {}),
            },
            include: { company: true },
        });

        return res.status(201).json(application);
    } catch (error) {
        console.error('POST error:', error);
        return res.status(500).json({ error: 'Unable to create application' });
    }
});

router.get('/:id', idParamValidators, async (req: Request, res: Response) => {
    const id = req.params.id as string;

    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const application = await prisma.jobApplication.findFirst({
            where: { id, userId: req.dbUser!.id },
            include: { company: true },
        });

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        return res.status(200).json(application);
    } catch (error) {
        console.error('GET /:id error:', error);
        return res.status(500).json({ error: 'Unable to fetch application' });
    }
});

router.patch('/:id', patchValidators, async (req: Request, res: Response) => {
    const id = req.params.id as string;

    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { role, companyId, skills, dateApplied } = req.body;
        const data: Prisma.JobApplicationUpdateInput = {};

        if (role !== undefined) data.role = role;
        if (companyId !== undefined) data.company = { connect: { id: companyId } };
        if (skills !== undefined) data.skills = skills;
        if (dateApplied !== undefined) data.dateApplied = new Date(dateApplied);

        if (Object.keys(data).length === 0) {
            return res.status(400).json({ error: 'Provide at least one field to update' });
        }

        const existing = await prisma.jobApplication.findFirst({
            where: { id, userId: req.dbUser!.id },
            select: { id: true },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const application = await prisma.jobApplication.update({ where: { id }, data, include: { company: true } });

        return res.status(200).json(application);
    } catch (error) {
        console.error('PATCH /:id error:', error);
        return res.status(500).json({ error: 'Unable to update application' });
    }
});

router.delete('/:id', idParamValidators, async (req: Request, res: Response) => {
    const id = req.params.id as string;

    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { count } = await prisma.jobApplication.deleteMany({
            where: { id, userId: req.dbUser!.id },
        });

        if (count === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        return res.status(204).send();
    } catch (error) {
        console.error('DELETE error:', error);
        return res.status(500).json({ error: 'Unable to delete application' });
    }
});

router.patch('/:id/stage', stageValidators, async (req: Request, res: Response) => {
    const id = req.params.id as string;

    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const existing = await prisma.jobApplication.findFirst({
            where: { id, userId: req.dbUser!.id },
            select: { id: true },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const application = await prisma.jobApplication.update({
            where: { id },
            data: { stage: req.body.stage },
            include: { company: true },
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
