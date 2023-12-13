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

// ----- FOR CRUDS: EXPRESS ROUTER(ENDPOINTS), MULTER, DB CONNECTION, FIREBASE -----

const router = express.Router();
const connect = await connectDB();
const multerStorage = multer.memoryStorage();
const multerUpload = multer({ storage: multerStorage });

const fire = initializeApp(firebaseConfig);
console.log("Collection Name:", Berry.collection.name);

// ----- GET -----

router.get("/products", async (req, res) => {
  const allProducts = await Berry.find();
  try {
    res.send(allProducts).status(204);
    console.log("\nAll products found successfully");
  } catch (error) {
    console.log("Error while getting the products from DB:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ----- UPLOAD MANY IMAGES -----

const storage = getStorage(fire);
const storageRef = ref(storage); // points to the root of the Cloud Storage bucket.
const folderRef = ref(storage, "images"); // points to 'images' folder.

let imageObjectsArr = [];

router.post(
  // --- Images to MULTER Buffer ---
  "/upload/images",
  multerUpload.array("images", 15),
  async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files reached the server.");
    }

    imageObjectsArr = req.files.map((file) => ({
      originalname: file.originalname,
      data: file.buffer,
      contentType: file.mimetype,
    }));

    // --- Images to FIREBASE ---
    try {
      for (const imageObject of imageObjectsArr) {
        const eachImageRef = ref(storage, `images/${imageObject.originalname}`);
        const snapshot = await uploadBytes(eachImageRef, imageObject.data);
        console.log(
          "\nImage uploaded. In-storage Path:",
          snapshot.ref.fullPath
        );

        const downloadURL = await getDownloadURL(snapshot.ref); // Get the download URL
        console.log("\nDownload URL:", downloadURL);
      }

      res.status(200).send("Images uploaded successfully.");
    } catch (error) {
      console.log("Error while uploading from buffer to the cloud:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ----- INSERT ONE -----

router.post("/productAdd", async (req, res) => {
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
  });

  try {
    res.send(newProduct).status(204);
    console.log("ONE NEW PRODUCT CREATED IN DB:", newProduct);
  } catch (error) {
    console.log("Error while inserting a product to DB:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ----- DELETE ALL ------

router.delete("/All", async (req, res) => {
  // IN MONGO
  try {
    await Berry.deleteMany({});
    res.status(204).send("\nIntire Collection was DELETED\n");
    console.log("\nIntire Collection was DELETED\n");
  } catch (error) {
    console.log("Error while deleteing All", error);
    res.status(500).send("Internal Server Error");
  }
  // IN FIREBASE (IMAGES)
  // --- List of images in the folder ---
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
