import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import api from './api';

const app = express();

app.use(express.json());
app.use(morgan('tiny'));

mongoose.set('useFindAndModify', false);

mongoose
  .connect(process.env.MONGODB_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    console.log('Connected to MongoDB.');
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error.message);
  });

app.use('/api', api);

export default app;
