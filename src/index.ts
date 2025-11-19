import dotenv from 'dotenv';
import express from 'express';
import { AppDataSource } from './config/dataSource';
import userRoutes from './routes/userRoutes';
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.use('/api/users', userRoutes);

AppDataSource.initialize()
	.then(() => {
		console.log('Database connected');
		app.listen(PORT, () => {
			console.log(`Server is running on port : ${PORT}`);
		});
	})
	.catch((err) => console.error('Error during initialization', err));
