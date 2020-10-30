# Image Similarity Searcher (Backend)

![Frontend Example Image](./Examples/dogs-test-half.png)
![Backend Example Image](./Examples/backend-data.png)

## Background

---

### **What is this?**

This project aims to make organizing images much easier when cleaning out hard drives by providing a simple GUI to manage deletions of similar images on the machine running the backend.

### **Why would I use this?**

If you're like me and you constantly backup images on all of your devices over the span of years, you may have some image redundancy. These similar images may have differing resolutions, quality, file format, or file size, and it would be nearly impossible to manually find and remember all similar images across multiple directories. 

This project aims to offload that hard work from the user.

### **How does it work?**

1. When the backend starts, it creates a 50x50 pixel greyscale version of every image (with [Jimp](https://github.com/oliver-moran/jimp)) in the user-specified image folder and grabs the image dimensions, file name, and file size. 

1. It then acts as a REST API which will perform both a hamming distance and pixel diffing on each possible pair of minified greyscale images to calculate image similarity. The image pairs and image data are then sent to the frontend. 

1. The frontend will then fetch the original images which are served statically from the backend.

1. On deletion request, the backend will **MOVE** the image to a folder marked for manual deletion by the user (This is done to prevent accidental image deletions!).

## Usage (Backend)

---

1. Place your images in the `!put_images_here` folder included in the project!

2. Open the backend directory
```
cd Path\To\Backend\Directory
```
3. Install npm packages
```
npm install
```
4. Run development server
```
npm start
```
Wait until the console prints the ready message, then start the frontend project.

(Instructions on the [Frontend Repository](https://github.com/SkyAceMike/Image-Similarity-Searcher-Frontend))

**Currently, this project only supports .png and .jpg image extensions!**

