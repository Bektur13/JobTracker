import { prisma } from '@/lib/prisma';


// model Application {
//   id Int  @id @default(autoincrement())
//   company  String 
//   role  String
//   status  String  @default("applied")
//   date_applied  DateTime  @default(now())
//   notes String?
//   skills  String[]
// }

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
    });
    console.log("Created application: ", application)

}

create().then(async () => {
    await prisma.$disconnect();
}).catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
})