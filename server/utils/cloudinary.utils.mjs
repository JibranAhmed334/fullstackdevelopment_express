import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs/promises";

const upload_on_cloudinary = async (file_path, folder_name) => {
    if (!file_path) {
        throw new Error("Product image file is missing.")
    }

    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        throw new Error("Image storage is not configured on the server.")
    }

    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET
    })

    let result
    try {
        result = await cloudinary.uploader.upload(file_path, {
            resource_type: "image",
            folder: folder_name || "alnoor_products"
        });

    } catch (error) {
        throw new Error(`Product image upload failed: ${error.message}`, { cause: error })
    } finally {
        try {
            await fs.unlink(file_path)
        } catch (error) {
            if (error.code !== "ENOENT") {
                console.error("Could not remove temporary product image:", error.message)
            }
        }
    }

    return result
}

export default upload_on_cloudinary;