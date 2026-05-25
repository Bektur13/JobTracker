import express from 'express';
const app = express();

app.get('/', (req, res) => {
    res.send('Hello from Express');
});

app.get('/applications', (req, res) => {
    res.json([
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
    ]);
});

app.listen(3000, () => {
    console.log('The server is running');
})