import dotenv from 'dotenv';
import express from 'express';
import { AppDataSource } from './config/dataSource';
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json())

app.get('/',(req,res)=>{
    res.send('Hello');
});

app.listen(PORT,()=>{
    console.log(`Server is running on port : ${PORT}`);
})

AppDataSource.initialize()
  .then(() => console.log('Database connected'))
  .catch((err) => console.error('Error during initialization', err));