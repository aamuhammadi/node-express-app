const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "attachments") {
      cb(null, "src/data/attachments");
    } else {
      cb(null, "src/data");
    }
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname);
    const originalFileName = path.basename(file.originalname, fileExtension);
    const uniqueFilename = `${originalFileName}_${timestamp}${fileExtension}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 51 * 1024 * 1024,
  },
});

module.exports = upload;
