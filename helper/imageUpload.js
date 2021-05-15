const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");
const DataURIParser = require("datauri/parser");
const parser = new DataURIParser();

exports.formatBufferTo64 = (file) =>
  parser.format(path.extname(file.originalname).toString(), file.buffer);

exports.cloudinaryUpload = (file) =>
  cloudinary.uploader.upload(file, { folder: "gossip-app/" });

const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/jpg"];
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (ALLOWED_FORMATS.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Not supported file type!"), false);
    }
  },
});

const singleUpload = upload.single("image");

exports.singleUploadCtrl = (req, res, next) => {
  singleUpload(req, res, (error) => {
    if (error) {
      return res.status(422).send({ errors: "Image upload fail!" });
    }
    next();
  });
};
