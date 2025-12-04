import express from 'express';
import { AppDataSource } from './config/dataSource';
import userRoutes from './routes/userRoutes';
import storyRoutes from './routes/storyRoutes';
import authRoutes from './routes/authRoutes';
import { errorHandler, routeNotFoundHandler } from './middleware/errorMiddleware';
import { env } from './utils/envParser';

const PORT = env.PORT;
const app = express();

app.use(express.json());

app.use(`/api/v1/users`, userRoutes);
app.use(`/api/v1/stories`, storyRoutes);
app.use('/api/v1/auth', authRoutes);

app.use(routeNotFoundHandler);

app.use(errorHandler);

AppDataSource.initialize()
	.then(() => {
		console.log('Database connected successfully');
		app.listen(PORT, () => {
			console.log(`Server is running on port: ${PORT}`);
		});
	})
	.catch((err) => console.error('Error during initialization', err));
