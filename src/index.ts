import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { registerDependencies } from './config/dependencyContainer';
import { errorHandler, routeNotFoundHandler } from './middleware/errorMiddleware';
import { defaultLimiter } from './middleware/rateLimitMiddleware';
import { env } from './utils/envParser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './api-docs/swagger';

const PORT = env.PORT;
const app = express();

const corsOptions = {
	origin: env.CORS_ORIGIN,
	credentials: true,
	optionsSuccessStatus: 200,
};
app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());
app.use(defaultLimiter);

registerDependencies()
	.then(() => {
		const userRoutes = require('./routes/userRoutes').default;
		const storyRoutes = require('./routes/storyRoutes').default;
		const authRoutes = require('./routes/authRoutes').default;
		const categoryRoutes = require('./routes/categoryRoutes').default;
		app.get('/', (_req, res) => {
			res.json({ message: 'Welcome to FinTalks API' });
		});
		app.use(`/api/v1/users`, userRoutes);
		app.use(`/api/v1/stories`, storyRoutes);
		app.use('/api/v1/auth', authRoutes);
		app.use('/api/v1/categories', categoryRoutes);

		app.use(routeNotFoundHandler);
		app.use(errorHandler);

		console.log('Database connected successfully');
		app.listen(PORT, () => {
			console.log(`Server is running on port: ${PORT}`);
		});
	})
	.catch((err) => console.error('Error during initialization', err));
