import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';

const create = async (req: Request, res: Response) => {
    try {
        const application = await prisma.application.create({ data: req.body });

        return res.status(201).json(application);
    } catch (error) {
        return res.status(500).json({ error: "Unable to create application"})
    }
}

const get = async () => {
    const applicaton = await prisma.application.findMany();
}