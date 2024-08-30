import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import logger from './config/logger';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.use(errorHandler);

app.use(cors());

const PORT = process.env.PORT || 4017;

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Auth API',
            version: '1.0.0',
            description: 'A simple authentication API',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 4017}`,
            },
        ],
    },
    apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer().catch((err) => console.error('Server startup error:', err));

export default app;
