import { prisma } from '@/lib/prisma';

const create = async () => {
    const application = await prisma.jobApplication.create({});
    console.log("Created application: ", application)

}

create().then(async () => {
    await prisma.$disconnect();
}).catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
})