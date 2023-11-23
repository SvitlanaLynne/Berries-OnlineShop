import express from "express";
import cors from "cors";

// ----- MIDDLEWARE -----

const PORT = process.env.port || 5050;
const app = express();
app.use(express.json());

// ----- CORS -----
const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// ----- RUN ON PORT -----

app.listen(PORT, () => {
  console.log("Server is running on port: ", `${PORT}`);
});
