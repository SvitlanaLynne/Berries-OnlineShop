import express from "express";
import { connectDB } from "./dbConnection.js";
import Berry from "./model.js";

// ----- FOR CRUDS: EXPRESS ROUTER(ENDPOINTS), DB CONNECTION -----

const router = express.Router();
const connect = await connectDB();

// ----- INSERT ONE -----

router.post("/products", async (req, res) => {
  const newProduct = await Berry.create({
    picture: req.body.picture,
    name: req.body.name,
    availability: req.body.availability,
    kg: req.body.kg,
    price: req.body.price,
  });

  try {
    res.send(newProduct).status(204);
    console.log("ONE NEW PRODUCT CREATED IN DB:", result);
  } catch (error) {
    console.log("Error while inserting a product to DB:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ----- DELETE ALL ------

router.delete("/All", async (req, res) => {
  try {
    await Berry.deleteMany({});
    res.status(204).send("\nIntire Collection was DELETED\n");
    console.log("\nIntire Collection was DELETED\n");
  } catch (error) {
    console.log("Error while deleteing All", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
