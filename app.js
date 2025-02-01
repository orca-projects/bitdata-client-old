import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/*', (req, res) => {
    const fileName = req.params[0] ? req.params[0] : 'index';
    res.sendFile(path.join(__dirname, 'dist', `${fileName}.html`));
});

app.listen(PORT, () => {
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
});
