import express from "express";
import { connectDB } from "./dbConnection.js";
import Berry from "./model.js";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import multer from "multer";
import csvParser from "csv-parser";
import { Readable } from "stream";
// import { Promise } from "mongoose";

// ----- FOR CRUDS: EXPRESS ROUTER(ENDPOINTS), MULTER, DB CONNECTION, FIREBASE -----

const router = express.Router();
const connect = await connectDB();
const multerStorage = multer.memoryStorage();
const multerUpload = multer({ storage: multerStorage });

const fireConfig = initializeApp(firebaseConfig);
console.log("Collection Name:", Berry.collection.name);

// ----- GET PAGE(S) -----

router.get("/products", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 2;

    const totalProducts = await Berry.countDocuments();

    const allProducts = await Berry.find()
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.send({ data: allProducts, total: totalProducts }).status(200);
    console.log(`page No. ${page} is requested`);
    console.log("\nAll products found successfully");
  } catch (error) {
    console.log("Error while getting the products from DB:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ----- INSERT ONE WITH IMAGES -----

const storage = getStorage(fireConfig);
const storageRef = ref(storage); // points to the root of the Cloud Storage bucket.
const folderRef = ref(storage, "images"); // points to 'images' folder.

router.post(
  "/upload/form",
  multerUpload.array("images", 15),
  async (req, res) => {
    let imageObjectsArr;

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).send("No files reached the server.");
      }

      imageObjectsArr = req.files.map((file) => ({
        originalname: file.originalname,
        data: file.buffer,
        contentType: file.mimetype,
      }));

      res.status(200).send("Images in the Multer's buffer.");
    } catch (error) {
      console.log("Error while processing Multer files:", error);
      return res.status(500).send("Internal Server Error");
    }

    // --- to FIREBASE ---
    const promises = imageObjectsArr.map(async (imageObject) => {
      const eachImageRef = ref(storage, `images/${imageObject.originalname}`);
      const snapshot = await uploadBytes(eachImageRef, imageObject.data);
      return await getDownloadURL(snapshot.ref);
    });

    // --- data to MONGO DB ---
    try {
      const imageURLs = await Promise.all(promises);
      const existingProduct = await Berry.findOne({ name: req.body.name });

      if (existingProduct) {
        console.log("Product with the same name already exists.");
        return res
          .status(400)
          .send(
            "Product with the same name already exists, hence your form was not submitted."
          );
      }

      const newProduct = await Berry.create({
        name: req.body.name,
        availability: req.body.availability,
        kg: req.body.kg,
        price: req.body.price,
        images: imageURLs,
      });
      res.status(204);
      console.log("ONE NEW PRODUCT CREATED IN DB:", newProduct);
    } catch (error) {
      console.log("Error while inserting a product to DB:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ----- INSERT MANY FROM FILE -----

router.post("/import/products", multerUpload.single("file"), (req, res) => {
  try {
    if (!req.file || req.file.length === 0) {
      return res.status(400).send("CSV file did not reach the server.");
    }
    const fileInBuffer = req.file.buffer;
    console.log("file in the buffer");
    const readableStream = Readable.from(fileInBuffer.toString());

    const productsDataArr = [];
    readableStream
      .pipe(csvParser({ headers: true }))
      .on("data", (data) => productsDataArr.push(data))
      .on("end", () => {
        // Call a function to save data to MongoDB using Mongoose
        // saveToMongoDB(results);
        console.log(
          "File uploaded and processed successfully. Products Arr:",
          productsDataArr
        );
        res.send("File uploaded and processed successfully.");
      });
  } catch (error) {
    console.log(
      "Error while processing files by Multer or saving in the database:",
      error
    );
    return res.status(500).send("Internal Server Error");
  }
});
// ----- DELETE ALL ------

router.delete("/All", async (req, res) => {
  // ---- In Mongo ----
  try {
    await Berry.deleteMany({});
    res.status(204).send("\nIntire Collection was DELETED\n");
    console.log("\nIntire Collection was DELETED\n");
  } catch (error) {
    console.log("Error while deleteing All", error);
    res.status(500).send("Internal Server Error");
  }
  // ---- In Firebase (IMAGES) using List ----
  listAll(folderRef)
    .then((res) => {
      res.prefixes.forEach((folderRef) => {
        console.log("Subdirectory found:", folderRef.name);
      });
      res.items.forEach((itemRef) => {
        console.log("\nItems found in the folder:", itemRef.name);
      });
      const promisesToDelArr = res.items.map((item) => {
        return deleteObject(item); // delete() method returns promises
      });
      return Promise.all(promisesToDelArr); // so, resolve them and output an array of results
    })
    .then(() => {
      console.log("All images have been deleted successfully.");
    })
    .catch((error) => {
      console.error(
        "An error occurred while forming a list or deletion.",
        error
      );
    });
});

export default router;
