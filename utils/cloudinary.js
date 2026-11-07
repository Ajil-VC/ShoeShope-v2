const { v2: cloudinary } = require('cloudinary');
const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET
} = require('../config/config');

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

function uploadImage(file) {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        throw new Error('Cloudinary configuration is incomplete. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
    }

    if (!file || !file.buffer) {
        throw new Error('A buffered image file is required for Cloudinary upload.');
    }

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'shoeshope', resource_type: 'image' },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                if (!result || !result.secure_url) {
                    return reject(new Error('Cloudinary did not return an image URL.'));
                }

                resolve(result.secure_url);
            }
        );

        uploadStream.end(file.buffer);
    });
}

async function uploadImages(files) {
    return Promise.all(files.map(uploadImage));
}

module.exports = { uploadImage, uploadImages };
