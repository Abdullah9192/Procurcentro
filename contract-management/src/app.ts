import express from "express";
import { PORT } from "./config/EnvVariables";
import AppDataSource from "./config/DatabaseSource";
import morgan from "morgan";
import cors from "cors";
import v1Routes from "./app/v1/routes/index";
import "./app/models";
import passport from 'passport';
import { defineModelAssociations } from "./app/models/ModelAssociation";

const app = express();
app.use(express.json());

app.use(morgan("tiny"));

app.use(cors());

app.use(passport.initialize());

app.use("/v1", v1Routes);
app.get("/", (req, res) => {
  res.send(`<h1>Procurement System  Contract API</h1>`);
})

const port = PORT || 50016;

const init = async () => {
  try {
    await AppDataSource.authenticate();
    defineModelAssociations();
    // Optionally sync models
    // await AppDataSource.sync({ alter: true });
    console.log('db connected successfully..');
    // Start your server here
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error("Unable to connect to DB:", err);
  }
};

init();
