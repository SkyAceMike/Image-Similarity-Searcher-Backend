const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");
const middlewares = require("./middlewares");

// Routes
const imagesRouter = require('./routes/images');

const app = express();

// ----- Start of Manual Code -----

// Static Image Path
app.use(express.static(process.env.IMAGES_FOLDER));

// Create directories that will be used later on
console.log("----- Creating Directories -----");
middlewares.createDirectorySync(process.env.IMAGES_FOLDER, process.env.TMP_FOLDER);
middlewares.createDirectorySync(process.env.IMAGES_FOLDER, process.env.DELETE_FOLDER);

// Get all images in the folder specified by the .env file
console.log("----- Getting Image List -----");
const imageList = middlewares.getImages(process.env.IMAGES_FOLDER);

// Get the image dimensions and then resize the images to 50x50 greyscale images to a new tmp folder
console.log("----- Getting Image Dimensions & Resizing Images -----");
const imageInfo = middlewares.resizeImagesAndGetImageInfo(process.env.IMAGES_FOLDER, imageList);

// Make imageList and imageDimensions global
app.use((req, res, next) => {
  req.imageList = imageList;
  req.imageInfo = imageInfo;
  next();
});

// CORS
app.use(cors());

// ----- End of Manual Code -----

app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/images', imagesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
