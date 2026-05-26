import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello from Express');
});

router.get('/', (req, res) => {

    const id = Number(req.query.id);

    const applications = [
        {
            id: 1,
            company: "Google",
            status: "In progress",
        },
        {
            id: 2,
            company: "Amazon",
            status: "Done",
        }
    ]

    if(id) {
        const requested = applications.find((app) => app.id === id);
        return res.json(requested);
    }

    res.json(applications);
});

export default router;