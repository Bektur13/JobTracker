import { Request, Response, NextFunction } from 'express';
import { getAuth, clerkClient } from '@clerk/express';
import { prisma } from '@/lib/prisma';
import type { User } from '../../generated/prisma/client';

declare global {
    namespace Express {
        interface Request {
            dbUser?: User;
        }
    }
}

export const resolveDbUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId: clerkId } = getAuth(req);

        if (!clerkId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        let dbUser = await prisma.user.findUnique({ where: { clerkId } });

        if (!dbUser) {
            const clerkUser = await clerkClient.users.getUser(clerkId);
            const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

            if (!email) {
                return res.status(400).json({ error: 'Clerk account has no email address on file' });
            }

            dbUser = await prisma.user.upsert({
                where: { clerkId },
                update: {},
                create: {
                    clerkId,
                    email,
                    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
                },
            });
        }

        req.dbUser = dbUser;
        next();
    } catch (error) {
        console.error('resolveDbUser error:', error);
        return res.status(500).json({ error: 'Unable to resolve authenticated user' });
    }
}
