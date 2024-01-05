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

    const productsPortion = await Berry.find()
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.send({ data: productsPortion, total: totalProducts }).status(200);
    console.log(`page No. ${page} is requested`);
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
        return res
          .status(400)
          .send("No images to send. Please choose a picture.");
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
    // data validation ....

    //....

    // https://firebase.google.com/docs/storage/security

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
// ---- Upload Bulk Data from CSV  ----
router.post(
  "/import/products",
  multerUpload.single("file"),
  async (req, res) => {
    // --- to Multer Buffer ---
    try {
      if (!req.file || req.file.length === 0) {
        return res.status(400).send("CSV file did not reach the server.");
      }
      const fileInBuffer = req.file.buffer;

      // Parse and transform according to schema
      const readableStream = Readable.from(fileInBuffer.toString());
      let isFirstRow = true;
      const productsDataArr = [];
      readableStream
        .pipe(csvParser({ headers: true }))
        .on("data", (row) => {
          if (isFirstRow) {
            isFirstRow = false; // skip the first row with headers
            return;
          }
          const transformedData = {
            name: row._0,
            availability: row._1 === "TRUE",
            kg: parseInt(row._2),
            price: parseInt(row._3),
            images: [row._4],
          };
          productsDataArr.push(transformedData);
        })
        .on("end", async () => {
          // --- csv to MONGO DB ---
          try {
            const newProducts = await Berry.insertMany(productsDataArr);

            // let ids = newProducts.insertedIds;
            // console.log(
            //   `${newProducts.insertedCount} documents were inserted.`
            // );
            // for (let id of Object.values(ids)) {
            //   console.log(`Inserted a document with id ${id}`);
            // }
            console.log("CSV file is uploaded and processed successfully.");
            res.send("File uploaded and processed successfully.");
          } catch (error) {
            console.log("Error while saving data to MongoDB:", error);
            res.status(500).send("Internal Server Error");
          }
        });
    } catch (error) {
      console.log("Error while processing files by Multer or parsing:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ---- Upload Bulk Images  ----
router.post(
  "/upload/bulk-images",
  multerUpload.array("images", 15),
  async (req, res) => {
    let imageObjectsArr;

    try {
      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .send("No files reached the server during bulk import.");
      }

      imageObjectsArr = req.files.map((file) => ({
        originalname: file.originalname,
        data: file.buffer,
        contentType: file.mimetype,
      }));
      res.status(200);
    } catch (error) {
      console.log("Error while importing images to Multer:", error);
      return res.status(500).send("Internal Server Error");
    }

    // --- bulk images to FIREBASE ---
    // data validation ....

    //....

    // https://firebase.google.com/docs/storage/security

    const promises = imageObjectsArr.map(async (imageObject) => {
      const eachImageRef = ref(storage, `images/${imageObject.originalname}`);
      const snapshot = await uploadBytes(eachImageRef, imageObject.data);
      return await getDownloadURL(snapshot.ref);
    });

    // --- bulk images to MONGO DB ---
    try {
      const imageURLs = await Promise.all(promises);

      for (let i = 0; i < imageURLs.length; i++) {
        const imageOriginalname = imageObjectsArr[i].originalname.split(".")[0];

        const existingProduct = await Berry.findOne({
          name: imageOriginalname,
        });

        if (!existingProduct) {
          console.log(`Product with the name ${imageOriginalname} not found.`);
          continue; // Skip to the next iteration
        }

        existingProduct.images = imageURLs[i]; // Update the product with the new image URL
        await existingProduct.save();
      }
      console.log(
        "\nSuccessful bulk image import. Links are added to the database."
      );
      res
        .status(204)
        .send("Links are added to the database. Successful bulk image import.");
    } catch (error) {
      console.log("Error while adding links to the database", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

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
        console.log(
          "\nList of all images in the Firebase before action:",
          itemRef.name
        );
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
