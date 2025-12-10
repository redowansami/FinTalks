import 'reflect-metadata';
import express from 'express';
import { registerDependencies } from './config/dependencyContainer';
import { errorHandler, routeNotFoundHandler } from './middleware/errorMiddleware';
import { env } from './utils/envParser';

const PORT = env.PORT;
const app = express();

app.use(express.json());

registerDependencies()
	.then(() => {
		const userRoutes = require('./routes/userRoutes').default;
		const storyRoutes = require('./routes/storyRoutes').default;
		const authRoutes = require('./routes/authRoutes').default;
		const categoryRoutes = require('./routes/categoryRoutes').default;

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
