const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");
const apiError = require("../utils/apiError");
const uploadOnCloudinary = require("../utils/cloudinary");
const Product = require("../models/product.model");
const { v4: uuidv4 } = require("uuid"); 
// Create new product
const createNewProduct = asyncHandler(async (req, res) => {
    try {
        const id = uuidv4(); 

        const {
            title,
            description,
            price,
            discountPercentage,
            rating,
            stock,
            brand,
            category,
        } = req.body;

        console.log(req.body);

        if (
            !title ||
            !description ||
            !price ||
            !discountPercentage ||
            !rating ||
            !stock ||
            !brand ||
            !category
        ) {
            throw new apiError(400, "Missing required fields");
        }

        const existingProduct = await Product.findOne({ id });

        if (existingProduct) {
            throw new apiError(409, "Product with this ID already exists");
        }

        const thumbnailPath = req.files?.thumbnail?.[0]?.path;
        if (!thumbnailPath) {
            throw new apiError(400, "Thumbnail photo is required");
        }

        const thumbnailFinal = await uploadOnCloudinary(thumbnailPath);
        if (!thumbnailFinal) {
            throw new apiError(400, "Failed to upload thumbnail photo");
        }

        console.log("thumbnail image added");

        const imagePaths = req.files?.images?.map((file) => file.path) || [];
        if (imagePaths.length === 0) {
            throw new apiError(400, "At least one product image is required");
        }


        const imagesFinal = await Promise.all(
            imagePaths.map(async (path) => {
                const result = await uploadOnCloudinary(path);
                if (!result) {
                    throw new apiError(400, "Failed to upload an image");
                }
                return result;
            })
        );

        console.log("images added");


        console.log("thumbnail and images added");


        const newProduct = await Product.create({
            id,
            title,
            description,
            price,
            discountPercentage,
            rating,
            stock,
            brand,
            category,
            thumbnail: thumbnailFinal.url,
            images: imagesFinal.url,
        });

        res.status(201).json(new apiResponse(201, newProduct, "Product created successfully"));
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const errorMessage = error.message || "An unexpected error occurred";

        res.status(statusCode).json(new apiResponse(statusCode, null, errorMessage));
    }
});


// fetching all the product 
const fetchAllProducts = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find({});

        res.status(200).json(new apiResponse(200, products, "Successfully loaded all products"));
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const errorMessage = error.message || "An unexpected error occurred";

        res.status(statusCode).json(new apiResponse(statusCode, null, errorMessage));
    }
});


// update fields in the database of a specific product 
const updateProduct = asyncHandler(async (req, res) => {
    try {
        const { productId } = req.params;
        const {
            title,
            description,
            price,
            discountPercentage,
            rating,
            stock,
            brand,
            category,
            thumbnail,
            images,
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new apiError(400, "Invalid product ID");
        }

        const product = await Product.findById(productId);
        if (!product) {
            throw new apiError(404, "Product not found");
        }


        const updatedData = {};
        if (title) updatedData.title = title;
        if (description) updatedData.description = description;
        if (price) updatedData.price = price;
        if (discountPercentage) updatedData.discountPercentage = discountPercentage;
        if (rating) updatedData.rating = rating;
        if (stock) updatedData.stock = stock;
        if (brand) updatedData.brand = brand;
        if (category) updatedData.category = category;
        if (thumbnail) updatedData.thumbnail = thumbnail;
        if (images) updatedData.images = images;

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: updatedData },
            { new: true }
        );

        res.status(200).json(new apiResponse(200, updatedProduct, "Product updated successfully"));
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const errorMessage = error.message || "An unexpected error occurred";

        res.status(statusCode).json(new apiResponse(statusCode, null, errorMessage));
    }
});

// delete the product from the database 
const deleteProduct = asyncHandler(async (req, res) => {
    try {

        const {id} = req.body;

        if (!id) {
            throw new apiError(400, "Product ID is required");
        }

        const product = Product.findOne({id});

        if(!product){
            throw new apiResponse(400,null ,"Invalid product ID");
        }

        const deletedProduct = await Product.deleteOne({id});

        if (deletedProduct.deletedCount === 0) {
            throw new apiError(400, "Product deletion failed");
        }

        res.status(200).json(new apiResponse(200, null, "Product deleted successfully"));

    } catch (error) {
        const statusCode = error.statusCode || 500;
        const errorMessage = error.message || "An unexpected error occurred";

        res.status(statusCode).json(new apiResponse(statusCode, null, errorMessage));
    }
})

// range of products
const fetchProductsInPriceRange = asyncHandler(async (req, res) => {
    try {
        const { minPrice, maxPrice } = req.query;

        if (!minPrice || !maxPrice) {
            throw new apiError(400, "Both minPrice and maxPrice must be provided");
        }

        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);

        if (isNaN(min) || isNaN(max)) {
            throw new apiError(400, "minPrice and maxPrice must be valid numbers");
        }

        if (min > max) {
            throw new apiError(400, "minPrice must be less than or equal to maxPrice");
        }

        const products = await Product.find({
            price: { $gte: min, $lte: max },
        });

        res.status(200).json(new apiResponse(200, products, "Products fetched successfully"));
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const errorMessage = error.message || "An unexpected error occurred";

        res.status(statusCode).json(new apiResponse(statusCode, null, errorMessage));
    }
});


module.exports = {
    createNewProduct, fetchAllProducts, updateProduct , deleteProduct , fetchProductsInPriceRange
};


