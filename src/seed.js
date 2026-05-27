import { PrismaClient } from "@/app/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
    await prisma.applications.createMany({
        data: [{
            id: 1,
            company: 'Google',
            status: 'In progress',
        }, {
            id: 2, 
            company: 'Amazon',
            status: 'Done',
        }]
    });
    console.log('Database seeded succesfully');
};

main().catch((e) => console.error(e)).finally(async () => await prisma.$disconnect);