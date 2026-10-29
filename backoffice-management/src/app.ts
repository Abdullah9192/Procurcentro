import express from "express";
import { PORT } from "./config/EnvVariables";
import AppDataSource from "./config/DatabaseSource";
import v1Routes from "./app/v1/routes/index";
import morgan from "morgan";
import cors from "cors";
import "./app/models";

const app = express();
app.use(express.json());
app.use(morgan("tiny"));
app.use(cors());
app.get("/", (req, res) => {
  res.send(`<h1>BackOffice service is running</h1>`);
});

// app.use("/v1", mainRoutes);
app.use("/v1" , v1Routes);

const port = PORT || 50015;

const init = async () => {
  try {
    await AppDataSource.authenticate();
    // Optionally sync models
    // await AppDataSource.sync({ alter: true });

    // Start your server here
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error("Unable to connect to DB:", err);
  }
};

init();
