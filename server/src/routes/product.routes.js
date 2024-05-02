const { Router } = require("express");
const productController = require("../controllers/product.controller");
const upload = require("../middlewares/multer.middleware");
const router = Router();

// Create a new product
router.post(
    "/createProducts",
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 10 },
    ]),
    productController.createNewProduct
);

router.get("/products", productController.fetchAllProducts);

router.put("/products/:productId", productController.updateProduct);

router.delete("/products/:productId", productController.deleteProduct);

router.get("/products/price-range", productController.fetchProductsInPriceRange);

module.exports = router;
