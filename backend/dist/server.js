import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js';
import harmonizationRoutes from './routes/harmonization.routes.js';
import userRoutes from './routes/user.routes.js';
import { handleCallback } from './controllers/auth.controller.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const app = express();
const PORT = process.env.PORT || 5000;
app.set('trust proxy', 1);
app.use(helmet({
    crossOriginOpenerPolicy: false,
}));
app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        'https://fayda.omobanksc.com',
        'http://10.11.0.59:3000',
        'http://10.11.0.59:5173',
        'http://localhost:3000',
        'http://localhost:5173'
    ].filter((origin) => !!origin),
    credentials: true
}));
app.use(express.json());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000
}));
app.use(express.urlencoded({ extended: true }));
const mongoUri = process.env.MONGO_URI || process.env.DB_URI || 'mongodb://127.0.0.1:27017/fayda-omo';
app.use(session({
    secret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-prod',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: mongoUri,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 15,
    }
}));
mongoose.connect(mongoUri)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
app.use('/api/auth', authRoutes);
app.use('/api/harmonization', harmonizationRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.get('/auth/fayda/callback', handleCallback);
app.get('/', (req, res) => {
    res.json({ message: 'Fayda-Omo API backend rebuilt from scratch! 🚀' });
});
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on port ${PORT}.`);
    if (process.env.NODE_ENV === 'production') {
        console.log(`   Public URL: https://fayda.omobanksc.com`);
    }
    console.log(`   Local URL:  http://localhost:${PORT} or your LAN IP.`);
    console.log(`(Time in Addis Ababa: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Addis_Ababa' })})`);
});
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} signal received. Closing HTTP server...`);
    server.close(() => {
        console.log('HTTP server closed.');
        mongoose.connection.close(false).then(() => {
            console.log('MongoDB connection closed. Exiting.');
            process.exit(0);
        });
    });
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
//# sourceMappingURL=server.js.map