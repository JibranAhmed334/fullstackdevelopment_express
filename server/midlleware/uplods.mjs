import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const uploadDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    }
});

const uploads = multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => {
        if (!file.mimetype.startsWith("image/")) {
            return callback(new Error("Please select an image file."))
        }
        callback(null, true)
    }
});

export default uploads;