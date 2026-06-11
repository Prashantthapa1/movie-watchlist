import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import appRoutes from './src/routes/appRoutes';

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
    credentials: true
}));

app.use('/api', appRoutes);

app.get('/health', (_req, res) => {
    console.log("Server is running...");
    res.status(200).json({ success: true, message: "Server is running..."});
});

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});