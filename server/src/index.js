const mongoose = require('mongoose');
const app = require("./app");

(async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/GadiGoda');

        console.log("MongoDB connection established");

        app.listen(8080, () => {
            console.log("Express app is listening on port 8080");
        });

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);

        process.exit(1);
    }
})();