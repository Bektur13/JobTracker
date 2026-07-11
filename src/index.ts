import express from 'express';
import { Request, Response, NextFunction } from 'express';
import applicationsRoutes from '@/routes/applicationsRoutes';

const app = express();
const port = 3001;

app.use(express.json());

app.use('/applications', applicationsRoutes);

app.use((err: Error, _req: express.Request, res: express.Response) => {
    console.error('Express error handler:', err);
    res.status(500).json({ error: err.message });
});

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err.stack);
    res.status(500).send('Something brake!');
    next(err);
})