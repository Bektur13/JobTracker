import { prisma } from '@/lib/prisma';

const create = async () => {
    const application = await prisma.application.create({
        data: {
            company: "Google",
            role: "Software Engineer",
            notes: "Applied via referral",
            id: 1, 
            status: "PENDING",  
            date_applied: new Date(),
        }
    })
}

const get = async () => {
    const applicaton = await prisma.application.findMany();

}