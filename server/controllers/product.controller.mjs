import AsyncHandler from "express-async-handler";
import Product from "../models/product.model .mjs"
import upload_on_cloudinary from "../utils/cloudinary.utils.mjs";
import delete_from_cloudinary from "../utils/cloudinary.delete.utils .mjs"
import mongoose from "mongoose"
import Category from "../models/category.model.mjs"

const getAllproducts = AsyncHandler(async (req, res) => {
    const product = await Product.find().populate("category","category_name")
    const productCount = await Product.countDocuments()
    return res.status(200).json({
        massage: "get all producte",
        success: true,
        productCount,   
        product
    });
});

const createproduct = AsyncHandler(async (req, res) => {
    const { product_name, price, category } = req.body


    if (!product_name?.trim() || !Number.isFinite(Number(price)) || Number(price) <= 0 || !mongoose.isValidObjectId(category)) {
        return res.status(400).json({
            massage: "Provide a product name, positive price, and valid category.",
            success: false
        });
    }

    if (!req.file){
        return res.status(400).json({
            massage:"Please select a product image.",
            success: false
        })
    }

    const categoryExists = await Category.exists({ _id: category })
    if (!categoryExists) {
        return res.status(400).json({ massage: "The selected category does not exist.", success: false })
    }

    let product_image
    try {
        product_image = await upload_on_cloudinary(req.file.path)
    } catch (error) {
        console.error("Product image upload failed:", error.message)
        return res.status(502).json({
            massage: "Product image upload failed. Check the server image storage settings and try again.",
            success: false
        })
    }

    if (!product_image?.secure_url || !product_image?.public_id) {
        return res.status(502).json({
            massage: "The product image could not be uploaded. Please try again.",
            success: false
        })
    }
    // const productExists = await Product.findOne({ product_name: productName });
    // if (productExists) {
    //     return res.status(409).json({
    //         massage: "product already exists",
    //         success: false
    //     });
    // }

    const product = await Product.create({ 
        product_name,
         price, 
         category,
        product_image_url : product_image.secure_url,
           product_image_public_id : product_image.public_id

        });
    return res.status(201).json({
        massage: "create productes",
        success: true,
        product
    });
});

const getSingleproduct = AsyncHandler(async (req, res) => {
    const {id} =req.params

    const product =await Product.findById(id).populate("category","category_name")
    
 if (!product) {
        return res.status(404).json({
            massage: "product does not exists",
            success: false
        })
 }

    return res.status(200).json({ 
        massage: "get single producte", 
        success: true, 
         product });
});

const updateproduct = AsyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ massage: "Invalid product id.", success: false })
    }

    const { product_name, price, category } = req.body
    if (!product_name?.trim() || !Number.isFinite(Number(price)) || Number(price) <= 0 || !mongoose.isValidObjectId(category)) {
        return res.status(400).json({ massage: "Provide a product name, positive price, and valid category.", success: false })
    }

    const product = await Product.findById(id)
    
 if (!product) {
        return res.status(404).json({
            massage: "product does not exists",
            success: false
        })
 }

    const updatedproduct = await Product.findByIdAndUpdate(
        id,
        { product_name: product_name.trim(), price: Number(price), category },
        { new: true, runValidators: true }
    ).populate("category", "category_name")

    return res.status(200).json({ 
        massage: "update producte", 
        success: true,
        updatedproduct
     });
});

const deleteproduct = AsyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ massage: "Invalid product id.", success: false })
    }

    const product = await Product.findById(id)
    
 if (!product) {
        return res.status(404).json({
            massage: "product does not exists",
            success: false
        })
 }
    await Product.findByIdAndDelete(id)

    let warning
    if (product.product_image_public_id) {
        try {
            await delete_from_cloudinary(product.product_image_public_id)
        } catch (error) {
            console.error(`Could not remove image for deleted product ${id}:`, error.message)
            warning = "The product was deleted, but its image could not be removed from storage."
        }
    }

    return res.status(200).json({ massage: "delete producte", success: true, warning });


});

export { getAllproducts, createproduct, getSingleproduct, updateproduct, deleteproduct };