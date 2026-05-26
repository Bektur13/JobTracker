import express from 'express';
import applicationRouter from '@/routes/applications.js';

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/applications', applicationRouter);

app.get('/', (req, res) => {
    res.send("Hello from Express");
});

app.listen(PORT, () => {
    console.log(`The server is running on localhost ${PORT}`);
});