const Jimp = require('jimp');
const glob = require("glob");
const fs = require('fs');
require('dotenv').config()

module.exports = {
    // Get .png and .jpg images
    getImages: (directory) => {
        const images = glob.sync("*.@(png|jpg)", {"cwd": directory});
        console.log("getImages:", images, "from", directory);
        return images;
    },
    // Helper function to create new directories (overwrite if already exists)
    createDirectorySync: (directory, newDirectoryName) => {
        const directory_folder = `${directory}\\${newDirectoryName}`;
        // Using the sync function to prevent async race conditions
        fs.mkdirSync(directory_folder, {recursive: true});
        console.log(`${directory_folder} created`);
    },
    // Populate tmp folder with 50x50 greyscale minified images
    resizeImagesAndGetImageInfo: (directory, imageList) => {
        const img_folder = directory;
        const tmp_folder = `${directory}\\${process.env.TMP_FOLDER}`;
        // const images = module.exports.getImages(img_folder);
        const images = imageList;
        // Will store dimensions and filesizes of each image with the image name as the key
        let imageInfo = {};

        // Write 50x50 greyscale image copies to speed up image comparisons
        images.forEach((imageName, index) => {
            // Get the image filesize in bytes
            const {size} = fs.statSync(`${img_folder}\\${imageName}`);
            imageInfo[imageName] = {filesize: size};
            // Put the image through Jimp to get Dimensions and Resize the image
            Jimp.read(`${img_folder}\\${imageName}`, (err, img) => {
                if (err) console.error(err);
                // Get Image dimensions and store it in the same key-value pair with the filesize
                Object.assign(imageInfo[imageName], {dimensions: [img.bitmap.width, img.bitmap.height]});
                // The real deal: resize to 50x50 and then greyscale every image
                img.resize(50, 50).greyscale().write(`${tmp_folder}\\${imageName}`);
                // Print completion msgs to console when all images are resized
                if (index === images.length - 1) {
                    console.log(imageInfo);
                    console.log("All Image Dimensions and Filesizes Collected & Resized to tmp Folder!");
                    console.log("Backend is now ready for GET requests to 'images/similar'!");
                    console.log("-------------------------READY-------------------------");
                }
            });
        });
        return imageInfo;
    },
    // Get hamming dist and diff of two images
    imageHamming: async (imgURL1, imgURL2, tolerance) => {
        // ----- Speed Testing -----
        const tick = Date.now();
        const log = (v) => console.log(`${v}\nElapsed: ${Date.now() - tick}`);
        
        // Will be set to true if the 2 images are similar
        let similarImages = false;

        // Get the 2 images
        const tmp_folder = `${process.env.IMAGES_FOLDER}\\${process.env.TMP_FOLDER}`;
        const image1 = Jimp.read(`${tmp_folder}\\${imgURL1}`);
        const image2 = Jimp.read(`${tmp_folder}\\${imgURL2}`);
        let images = await Promise.all([image1, image2]);

        // Calculate distance and difference
        const distance = new Promise ((resolve) => {
            resolve(Jimp.distance(images[0], images[1])); // perceived distance
        });
        const diff = new Promise ((resolve) => {
            resolve(Jimp.diff(images[0], images[1], 0.1)); // pixel difference
        });
        const ham = await Promise.all([distance, diff]);

        console.log("----------------------");
        console.log(imgURL1);
        console.log(imgURL2);

        // Tolerance Test (distance || diff)
        if (ham[0] < 0.15 || ham[1].percent < 0.15) {
            console.log("Images are similar");
            similarImages = true;
        } else {
            console.log("Images are NOT similar");
            console.log("distance: " + ham[0]);
            console.log("diff: " + ham[1].percent);
        }

        console.log("----------------------");
        
        return similarImages;
    }
}
