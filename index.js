const express = require("express");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require('path');

const UPLOADS_FOLDER = "./upload/";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_FOLDER);
    },
    filename: (req, file, cb) => {
        // Important file.pdf => important-file-349698563842.pdf
        const fileExt = path.extname(file.originalname);
        const fileName = file.originalname.replace(fileExt, "").toLowerCase().split(" ").join("-") + "-" + Date.now()
        console.log(fileName);
        cb(null,fileName+ fileExt)
    }
});
const upload = multer({
  storage: storage,
  dest: UPLOADS_FOLDER,
  limits: {
    fileSize: 1000000,
  },
  fileFilter: (req, file, cb) => {
    // console.log(req, file, cb);
    if (file.fieldname === "avatar") {
      if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
      ) {
        cb(null, true);
      } else {
        cb(new Error("Only .jpg, .png of .jpeg formate allowed!"));
      }
    } else if (file.fieldname === "doc") {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(new Error("Only .pd format allowed!"));
      }
    } else {
      cb(new Error("There was and unknown error!"));
    }
  },
});

const app = express();
app.use(cookieParser());
app.use(express.json());

const adminRouter = express.Router();

/*
const logger = (req, res, next) => {
  console.log(
    `${new Date(Date.now()).toLocaleString()} - ${req.method} - ${
      req.protocol
    } - ${req.originalUrl} - ${req.ip}`
  );
  //   next();
  throw new Error("This is an error");
};
*/

const loggerWrapper = (options) => {
  return function (req, res, next) {
    if (options.log) {
      console.log(
        `${new Date(Date.now()).toLocaleString()} - ${req.method} - ${
          req.protocol
        } - ${req.originalUrl} - ${req.ip}`
      );
      next();
    } else {
      throw new Error("Failed to log");
    }
  };
};

//adminRouter.use(logger);
adminRouter.use(loggerWrapper({ log: false }));

adminRouter.get("/dashboard", (req, res) => {
  res.send("Dashboard");
});

app.post(
  "/upload",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "doc", maxCount: 2 },
  ]),
  (req, res) => {
    res.send("Hello world");
  }
);
/* app.post("/upload", upload.single("avatar"), (req, res) => {
  res.send("Hello world");
}); */

app.use((err, req, res, next) => {
  if (err) {
    if (err instanceof multer.MulterError) {
      res.status(500).send("There was an upload error !");
    }
    res.status(500).send(err.message);
  } else {
    res.send("success");
  }
});

app.use("/admin", adminRouter);

// app.use(logger);
app.get("/", (req, res) => {
  res.send("Home Route");
});

const errorMiddleware = (err, req, res, next) => {
  console.log(err.message);
  res.status(500).send("Server side error");
};

adminRouter.use(errorMiddleware);

app.listen(5000, () => {
  console.log("Server Listening Port is", 5000);
});
