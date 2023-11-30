import express from "express";
import { connectDB } from "./dbConnection.js";
import Berry from "./model.js";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import multer from "multer";

// ----- FOR CRUDS: EXPRESS ROUTER(ENDPOINTS), MULTER, DB CONNECTION, FIREBASE -----

const router = express.Router();
const connect = await connectDB();
const multerStorage = multer.memoryStorage();
const multerUpload = multer({ storage: multerStorage });

const fire = initializeApp(firebaseConfig);
console.log("Collection Name:", Berry.collection.name);

// ----- UPLOAD MANY IMAGES -----

// --- Images to MULTER Buffer ---

// -- Multiple files:
const storage = getStorage(fire);
const storageRef = ref(storage); // points to the root of the Cloud Storage bucket.
const imagesRef = ref(storage, "images"); // imagesRef now points to 'images'.

let imageObjectsArr = [];

router.post(
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
    console.log("array of images in the multer's buffer:", imageObjectsArr);

    try {
      uploadBytes(imagesRef, imageObjectsArr.data).then((snapshot) => {
        console.log("uploadBytes invoked...");
      });

      // getDownloadURL(uploadBytes.snapshot.ref).then((downloadURL) => {
      //   console.log("IMAGE AVAILABLE at:", downloadURL);
      // });
    } catch (error) {
      console.log("Error while uploading from buffer to the cloud:", error);
    }
  }
);

// -- Single file:

// let newImage = {};
// router.post(
//   "/upload/image",
//   multerUpload.single("newImage"),
//   async (req, res) => {
//     console.log("original:", req.file, req.body);
//     newImage = {
//       originalname: req.file.originalname,
//       data: req.file.buffer,
//       contentType: req.file.mimetype,
//     };
//     console.log("my new object:", newImage);
//   }
// );

// -- for uploading a single image (not complete)
// const newUploadedImageRef = ref(storage, `images/${newImage.originalname}`);
// if (Object.keys(newImage).length > 0) {
//   try {
//     uploadBytes(newUploadedImageRef, newImage.data).then((snapshot) => {
//       console.log("Uploaded an image!");
//     });

//     getDownloadURL(---->uploadTask.snapshot.ref).then((downloadURL) => {
//       console.log("IMAGE AVAILABLE at:", downloadURL);
//     });
//   } catch (error) {
//     console.log("Error while uploading from buffer to the cloud:", error);
//   }
// } else {
//   console.log("No image in the buffer to upload yet");
// }

// ----- INSERT ONE -----

router.post("/products", async (req, res) => {
  const existingProduct = await Berry.findOne({ name: req.body.name });

  if (existingProduct) {
    return res.status(400).send("Product with the same name already exists.");
  }

  const newProduct = await Berry.create({
    picture: req.body.picture,
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
