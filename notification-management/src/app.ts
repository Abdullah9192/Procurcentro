import express from 'express';
import { PORT } from './config/EnvVariables';
import "./grpc/server";
import AppDataSource from './config/DatabaseSource';
import morgan from 'morgan';
import cors from 'cors';
import { main } from './message-consumer';
import notificationRoutes from './app/v1/routes/index';
import http from "http";
import { initSocket } from "./sockets/socket";

const app = express();
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors({ origin: '*' }));

app.use("/v1", notificationRoutes);

app.get('/', (req, res) => {
  res.send('Procurement System Notification API');
});

const port = PORT || 5004;

AppDataSource.sync()
  .then(() => {

    const server = http.createServer(app);

    // ✅ Attach socket on same server
    initSocket(server);

    server.listen(port, () => {
      console.log(`🚀 Notification + Socket running on port ${port}`);
    });

    main();
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });
