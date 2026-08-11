import { prisma } from '@/lib/prisma';

export async function findOrCreateCompanyByName(name: string, website?: string) {
    const trimmed = name.trim();

    const existing = await prisma.company.findFirst({
        where: { name: { equals: trimmed, mode: 'insensitive' } },
    });

    if (existing) return existing;

    return prisma.company.create({ data: { name: trimmed, website } });
}
