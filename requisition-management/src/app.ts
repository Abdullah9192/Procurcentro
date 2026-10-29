import express from 'express';
import { PORT } from './config/EnvVariables';
import  AppDataSource  from './config/DatabaseSource';
import morgan from 'morgan';
import cors from 'cors';
import "./app/models";
import { defineModelAssociations } from "./app/models/ModelAssociation";
import mainRoutes from "./app/v1/routes/index";
import passport from 'passport';
import { startGrpcServer } from "./grpc/server";

const app = express();
app.use(express.json());
app.use(passport.initialize());

app.use(morgan('tiny'));

app.use(cors({ origin: '*' }));

startGrpcServer();

app.get('/', (req, res) => {
  res.send('budget is running')
})
app.use("/v1", mainRoutes);


const port = PORT || 5005;

const init = async () => {
  try {
    await AppDataSource.authenticate();
    defineModelAssociations();
    // Optionally sync models
    // await AppDataSource.sync({ alter: true });

    // Start your server here
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error("Unable to connect to DB:", err);
  }
};

init();