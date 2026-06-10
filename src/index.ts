import express from 'express';

import applicationsRoutes from '@/routes/applications';

const app = express();
const port = 3001;

app.use(express.json());

app.use('/applications', applicationsRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Express error handler:', err);
    res.status(500).json({ error: err.message });
});

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});