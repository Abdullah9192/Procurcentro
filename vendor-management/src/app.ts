import express from "express";
import { PORT } from "./config/EnvVariables";
import AppDataSource from "./config/DatabaseSource";
import morgan from "morgan";
import cors from "cors";
import "./app/models";
import { defineModelAssociations } from "./app/models/ModelAssociation";
import mainRoutes from "./app/v1/routes/index";
import { main } from "./message-consumer";
import { startGrpcServer as startVendorGrpcServer } from './grpc/server';
import "./config/passport";
import passport from "passport";

const app = express();
app.use(express.json());
app.use(passport.initialize());
// initializeMicrosoftStrategy();

app.use(morgan("tiny"));
app.use(cors());
main();
startVendorGrpcServer();
app.get('/', (req, res) => {
  res.send('Vendor is running')
})

app.use("/v1", mainRoutes);

const port = PORT || 5002;

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
