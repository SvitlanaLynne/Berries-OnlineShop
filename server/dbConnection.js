import mongoose from "mongoose";
import "./loadstring.js";

const connectionString = process.env.DB_CONNECT_STRING || "";

export function connectDB() {
  const state = mongoose.connection;

  return mongoose
    .connect(connectionString)
    .then(() => {
      switch (state.readyState) {
        case 0:
          console.log("\nDB is disconnected!");
          break;
        case 1:
          console.log("\nDB is connected!");
          break;
        case 2:
          console.log("\nConnecting");
          break;
        case 3:
          console.log("\nDisconnecting");
          break;
        default:
          console.log("\nUnknown connection state");
      }
    })
    .catch((error) => {
      console.error("\nUnsuccessful Connection to MongoDB due to:", error);
      handleError(error);
    });
}

process.on("SIGINT", () => {
  try {
    mongoose.connection.close();
    console.log("\nMongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.log("\nError closing MongoDB connection:", error);
    process.exit(1);
  }
});
