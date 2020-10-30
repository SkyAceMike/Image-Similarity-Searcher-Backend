const express = require("express");
const router = express.Router();

const middlewares = require("../middlewares");

// File reading setup
const fs = require('fs');
const { imageHamming } = require("../middlewares");

router.get('/', (req, res) => {
    // var db = req.db;
    // var collection = db.get('JS_IMG_SORT');

    res.json(res.locals.filenames);
});

// Get the similar ham list of images
const getHammingDists = async (req, res, next) => {

    // ----- Speed Testing -----
    const tick = Date.now();
    const log = (v) => console.log(`${v}\nElapsed: ${Date.now() - tick}`);

    // Get the list of images
    const images = req.imageList;

    // Make sure the image array has at least 2 images
    const numImages = images.length;
    if (numImages < 2) return res.send("Not Enough in Array of Images for Ham");

    console.log("Getting Similar images...");

    // Compare every 2 pair of images once and add it to the similar list if similar
    let similarList = [];
    for (let i=0; i<numImages-1; i++) {
        for (let j=i+1; j<numImages; j++) {
            if (await imageHamming(images[i], images[j], 0.15)) {
                similarList.push([ images[i], images[j] ]);
            }

            log("Single Image Pair Processed");
        }
    }

    console.log("All Image Pairs Finished Comparisons");
    console.log(similarList);

    // Return object with similar image pairing and image info
    res.locals.similarImages = {images: similarList, info: req.imageInfo};
    next();
}

router.get('/similar', getHammingDists, (req, res) => {
    res.json(res.locals.similarImages);
});

// Try not to use this to prevent accidental deletions. Use the other delete function below
// router.delete('/:imageName', (req, res) => {
//     const image = `${process.env.IMAGES_FOLDER}\\${req.params.imageName}`
//     fs.unlink(image, (err) => {
//         if (err) console.log(err);
//         console.log(`${image} deleted`);
//     });
//     res.send("Delete request received");
// });

router.delete("/:imageName", (req, res) => {
    // Instead of hard deleting images, move them to the process.env.DELETE_FOLDER for the user to manually delete
    const oldImagePath = `${process.env.IMAGES_FOLDER}\\${req.params.imageName}`;
    const newImagePath = `${process.env.IMAGES_FOLDER}\\${process.env.DELETE_FOLDER}\\${req.params.imageName}`;
    // If an image with the same name already exists in the folder, this function overwrites it 
    fs.rename(oldImagePath, newImagePath, (err) => {
        if (err) {
            console.log(err);
            // Send status 400 (BAD)
            res.sendStatus(400);
        }
        else {
            console.log(`${oldImagePath} moved to ${newImagePath}`);
            // Send status 200 (OK)
            res.sendStatus(200);
        }
    });
});

module.exports = router;