const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Ensure the upload directory exists before saving files
const ensureUploadFolder = (folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
};

// ✅ Set up storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadFolder =
      file.fieldname === "drivingLicense" || file.fieldname === "passport"
        ? "uploads/users"
        : "uploads/motorcycles";

    ensureUploadFolder(uploadFolder); // ✅ Ensure the folder exists
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // ✅ Unique filename
  },
});

// ✅ File filter (Only allow images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, JPG allowed!"), false);
  }
};

// ✅ Multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;
