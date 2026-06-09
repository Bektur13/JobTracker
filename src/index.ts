import express from 'express';
import { }

const app = express();
const port = 3000;

app.use(express.json());

app.get('/routes/applications.ts', (req, res) => {
    res.send('GET method!');
});