const cloudinary = require("cloudinary");

const { v2 } = cloudinary;

const fs = require("fs");


v2.config({
    cloud_name: "dpplukuqi",
    api_key: 455595154582159,
    api_secret: "o1iSAcmHf_frMJA13lCMdh4EHNE"
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        console.log("trying . . . ");
        const response = await v2.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        console.log(response);
        
        fs.unlinkSync(localFilePath);
        
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;

    }
}

module.exports = uploadOnCloudinary