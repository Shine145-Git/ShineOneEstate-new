const cloudinary = require("cloudinary").v2;
const fs = require("fs");


cloudinary.config({
    cloud_name: process.env.Cloudinary_name,
    api_key: process.env.Cloudinary_api_key,
    api_secret: process.env.Cloudinary_api_secret
})

const uploadoncloudinary = async (path) => {
    try {
        if (!path) return null;
        // upload the file on cloudinary
        const result = await cloudinary.uploader.upload(path, {
            resource_type: "auto",

        });
        // File has been uploaded successfully
        console.log("file Uploaded successfully", result);
        return result;
    } catch (error) {
        throw error;    // remove the locally saved temporary file as the upload operation is failed
    }
    finally {
        fs.unlinkSync(path);
    }
}


module.exports  = { uploadoncloudinary };