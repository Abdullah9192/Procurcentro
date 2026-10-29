import { Server , Socket} from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: { origin: "*" },
    path: "/socket.io",
  });

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_notification_room", (userId: string) => {
      if (!userId) return;
      socket.join(userId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

export const emitNotification = (
  receiverId: string,
  notification: any
) => {
  if (!io) return;
  io.to(receiverId).emit("new_notification", notification);
};
