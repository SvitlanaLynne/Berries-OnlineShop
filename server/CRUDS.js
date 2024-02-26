import express from "express";
import { connectDB } from "./dbConnection.js";
import Berry from "./model.js";
// import { initializeApp as initializeAdminApp } from "firebase-admin/app";
import { initializeApp as initializeStorageApp } from "firebase/app";
// import { readFileSync } from "fs";

import firebaseConfig from "./firebase/firebaseConfig.js";
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

// ----- FOR CRUDS: EXPRESS ROUTER(ENDPOINTS), MULTER, DB CONNECTION, FIREBASE(STORAGE & AUTH) -----

const router = express.Router();
const connect = await connectDB();
const multerStorage = multer.memoryStorage();
const multerUpload = multer({ storage: multerStorage });

// ---- Admin Access Set Up ----
// const path = "./firebase/berries-c3141-firebase-adminsdk-6hs4u-4789e65509.json";
// const fileContent = readFileSync(path, "utf8");
// const serviceAccount = JSON.parse(fileContent);
// const authapp = initializeAdminApp(); // or initializeAdminApp(serviceAccount if using service account key, least secure option)

// Receive token from the Authorization header
router.post("/auth", async (req, res) => {
  try {
    const idToken = req.headers.authorization.split("Bearer ")[1];

    // Verify token
    // const decodedToken = await admin.auth().verifyIdToken(idToken); //admin is not defined at this stage: Admin SDK not initiated

    console.log("Token incoded:", idToken);
    // console.log("Decoded Token:", decodedToken);
    res.status(200).send("ID token recieved, not yet decoded");
  } catch (error) {
    console.error("Error reciving ID token:", error);
    res.status(401).send("Unauthorized");
  }
});

// ---- Firebase Storage Set Up ----
const fireStorageConfig = initializeStorageApp(firebaseConfig);
console.log("Collection Name:", Berry.collection.name);
const storage = getStorage(fireStorageConfig);
const storageRef = ref(storage); // points to the root of the Cloud Storage bucket.
const folderRef = ref(storage, "images"); // points to 'images' folder.

// ----- GET -----

router.get("/products", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

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

// ---- IMAGES ----
const handleImagesUpload = (req, res, next) => {
  // --- to MULTER  ---
  multerUpload.array("images", 15)(req, res, async (error) => {
    if (error) {
      console.error("MULTER error:", error);
      return res.status(500).send("Internal Server Error");
    }

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

      // --- to FIREBASE ---
      // data validation ....https://firebase.google.com/docs/storage/security

      const promises = imageObjectsArr.map(async (imageObject) => {
        const eachImageRef = ref(storage, `images/${imageObject.originalname}`);
        const snapshot = await uploadBytes(eachImageRef, imageObject.data);
        return await getDownloadURL(snapshot.ref);
      });

      // Attach promises to the request object
      req.imageUploadPromises = promises;
      res.status(200).send("Images uploaded successfully.");
      next();
    } catch (error) {
      console.error(
        "Error while processing Multer files or uploading to Firebase:",
        error
      );
      return res.status(500).send("Internal Server Error");
    }
  });
};

router.post("/upload/form", handleImagesUpload, async (req, res) => {
  // --- data to MONGO DB ---
  try {
    const imageURLs = await Promise.all(req.imageUploadPromises);
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
});

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
router.post("/upload/bulk-images", handleImagesUpload, async (req, res) => {
  // --- bulk images to MONGO DB ---
  try {
    const imageURLs = await Promise.all(req.imageUploadPromises);

    for (let i = 0; i < imageURLs.length; i++) {
      const imageOriginalname = imageObjectsArr[i].originalname.split(".")[0];

      const existingProduct = await Berry.findOne({
        name: imageOriginalname,
      });

      if (!existingProduct) {
        console.log(`Product with the name ${imageOriginalname} not found.`);
        window.alert(`Product with the name ${imageOriginalname} not found. `);
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
});

// ----- EDIT ONE -----

router.patch(
  `/product/:productId`,
  multerUpload.single("image"),
  async (req, res) => {
    const productId = req.params.productId;
    const productToUpdate = await Berry.findById(productId);

    if (!productToUpdate) {
      console.log("Product not found");
      return res.status(404).send("Product not found");
    }

    try {
      // Update with images
      if (req.file && req.file.length !== 0) {
        // --- to Multer ---
        const imageObj = {
          originalname: req.file.originalname,
          data: req.file.buffer,
          contentType: req.file.mimetype,
        };
        // --- to Firebase ---
        // data validation ....https://firebase.google.com/docs/storage/security
        const imageRef = ref(storage, `images/${imageObj.originalname}`);
        const snapshot = await uploadBytes(imageRef, imageObj.data);
        const imageURL = await getDownloadURL(snapshot.ref);

        // --- to DB ---
        await Berry.findOneAndUpdate(
          { _id: productId },
          {
            name: req.body.name,
            availability: req.body.availability,
            kg: req.body.kg,
            price: req.body.price,
            images: imageURL,
          }
        );
      } else {
        // Update without images
        await Berry.findOneAndUpdate(
          { _id: productId },
          {
            name: req.body.name,
            availability: req.body.availability,
            kg: req.body.kg,
            price: req.body.price,
          }
        );
      }

      console.log(`UPDATED ${req.body.name}`);
      res.status(204).send();
    } catch (error) {
      console.log("Error while updating:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ----- BULK EDIT -----

router.patch("/bulk", multerUpload.array("_id"), async (req, res) => {
  const idArr = req.body._id;

  try {
    // Check if found
    const productsToUpdate = await Berry.find({ _id: { $in: idArr } });

    if (productsToUpdate.length !== idArr.length) {
      const notFoundProducts = idArr.filter(
        (productId) =>
          !productsToUpdate.some((product) => product._id == productId)
      );
      console.log(`Products ${notFoundProducts.join(", ")} not found`);
      return res.status(404).send("One or more products not found");
    }
    // which fields to update
    const fieldsToUpdate = () => {
      const { kg, price, availability } = req.body;

      if ((kg === "" && price !== "") || (kg !== "" && price === "")) {
        return kg === "" ? { price } : { kg, availability };
      } else if (kg === "" && price === "") {
        return null;
      } else {
        return { kg, price, availability };
      }
    };

    const updateFields = fieldsToUpdate();

    if (updateFields) {
      for (const productId of idArr) {
        const updatedProduct = await Berry.findByIdAndUpdate(
          productId,
          updateFields,
          { new: true }
        );

        if (updatedProduct) {
          console.log(`UPDATED product with ID ${productId}`);
        }
      }
      res.status(204).send();
    } else {
      // if empty submission
      const errorMessage =
        "Nothing submitted. Please enter weight or price of the products to update.";
      console.log(errorMessage);
      res.status(400).send(errorMessage);
    }
  } catch (error) {
    console.log("Error while Bulk update:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ----- DELETE ONE -----

const deleteImage = async (imageName) => {
  const imageRef = ref(storage, `images/${imageName}.jpg`);
  await deleteObject(imageRef);
  console.log(`Image ${imageName} deleted successfully.`);
};

const deleteImages = async (imageNames) => {
  try {
    await Promise.all(imageNames.map(deleteImage));
  } catch (error) {
    console.error("NOTICE during deleting images:", error);
  }
};

router.delete(`/product/:productId`, async (req, res) => {
  const productId = req.params.productId;

  try {
    // earse images from firebase
    const productToDelete = await Berry.findById(productId);

    if (!productToDelete) {
      console.log("Product not found");
      return res.status(404).send("Product not found");
    }

    const urls = productToDelete.images;
    if (urls && urls.length > 0) {
      const imageNames = urls.map((url) => {
        const match = url.match(/\/images%2F(.+?)\.(jpg|jpeg|png|gif)\?/i);
        return match ? match[1] : null;
      });

      const checkImageExistance = async (imageName) => {
        const imageRefJPG = ref(storage, `images/${imageName}.jpg`);
        const imageRefPNG = ref(storage, `images/${imageName}.png`);

        try {
          // for JPG
          const urlJPG = await getDownloadURL(imageRefJPG);
          return true;
        } catch (errorJPG) {
          try {
            // for PNG
            const urlPNG = await getDownloadURL(imageRefPNG);
            return true;
          } catch (errorPNG) {
            return false;
          }
        }
      };

      const checkImagesExistance = (imageNames) => {
        try {
          let result = [];
          imageNames.map((imageName) =>
            result.push(checkImageExistance(imageName))
          );
          return !result.includes(false);
        } catch (error) {
          console.error("Error while searching images:", error);
          throw error;
        }
      };
      const imagesExist = checkImagesExistance(imageNames);
      if (imagesExist) {
        await deleteImages(imageNames);
      }
    } else {
      console.log(
        "At least one image not found. Deleteing the product anyway..."
      );
    }

    // erase product from db
    await Berry.deleteOne({ _id: productId });
    console.log(`PRODUCT with the ID ${productId} was successfully DELETED`);

    res
      .status(204)
      .send("\nProduct  and its Images are successfully Deleted \n");
  } catch (error) {
    console.log("Error while deleting product or its images", error);
    res.status(500).send("Internal Server Error");
  }
});

// ----- BULK DELETE -----

router.delete("/bulkDel", async (req, res) => {
  const idArr = req.query._id;

  try {
    // Check if found
    const productsToBulkDelete = await Berry.find({ _id: { $in: idArr } });

    if (productsToBulkDelete.length !== idArr.length) {
      const notFoundProducts = idArr.filter(
        (productId) =>
          !productsToBulkDelete.some((product) => product._id == productId)
      );
      console.log(`Products ${notFoundProducts.join(", ")} not found`);
      return res.status(404).send("One or more products not found");
    }

    if (productsToBulkDelete.length > 0) {
      const deletedProductNames = [];

      for (const productId of idArr) {
        const deletedProduct = await Berry.findByIdAndDelete(productId);

        if (deletedProduct) {
          deletedProductNames.push(deletedProduct.name);
        }
      }

      if (deletedProductNames.length > 0) {
        console.log(
          `Deleted the following products: ${deletedProductNames.join(", ")}`
        );
      }
      res.status(204).send();
    }
  } catch (error) {
    console.error("Error while Bulk Delete:", error.message);
    res.status(500).send("Internal Server Error");
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
    // console root folder
    .then((res) => {
      res.prefixes.forEach((folderRef) => {
        console.log("Subdirectory found:", folderRef.name);
      });
      // console names
      res.items.forEach((itemRef) => {
        console.log(
          "\nList of all images in the Firebase before action:",
          itemRef.name
        );
      });
      //delete each
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
