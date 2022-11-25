const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const AppError = require("../utils/appError");

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

// All of these functions are asynchronous as they are making requests to the Mongo database
exports.getAllTours = factory.getAll(Tour);

// This function returns only one tour specified by the _id field
exports.getTour = factory.getOne(Tour, { path: "reviews" });

// Creates new tours
exports.createTour = factory.createOne(Tour);

// Updates a tour with new data
exports.updateTour = factory.updateOne(Tour);

// Delete a tour
exports.deleteTour = factory.deleteOne(Tour);

// catchAsync(async (req, res, next) => {
//   // No data is being sent back to the client hence why the value is not stored in a var
//   // Finds the tour with the _id and deletes it
//   // Issues the mongoDB findOneAndDelete() command
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError("No tour found with that ID", 404));
//   }

//   res.status(204).json({
//     status: "success",
//     // No data to be sent
//     data: null,
//   });
// });

// Return most important tour stats.
exports.getTourStats = catchAsync(async (req, res, next) => {
  // Aggregates the tours to only return the specified data
  // Takes in an aggregation pipeline as an array of objects
  const stats = await Tour.aggregate([
    // Only tours which have an average rating of 4.5 or above
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    // Group the tours by difficulty
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        // Returns a sum of all the documents in the specified difficulty
        numTours: { $sum: 1 },
        // Sum the number of ratings in this group of difficulty
        numRatings: { $sum: "$ratingsQuantity" },
        // Calculate the average rating from all the averages of each documet
        avgRating: { $avg: "$ratingsAverage" },
        // Find the average price from all the documents
        avgPrice: { $avg: "$price" },
        // Find the minimum price from all the documents
        minPrice: { $min: "$price" },
        // Find the maximum price from all the documents
        maxPrice: { $max: "$price" },
      },
    },
    // Sort by the average price (ascending order)
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

// Returns all the tours depending on which month they start
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // Find the year from the request
  const year = +req.params.year; // 2021

  // Aggregation pipeline to group tours into their respective months
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    // Groups by the month
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    // Adds a new field to the document
    // In this example the field is called month and its val
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      $limit: 6,
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      plan,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng"
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res
    .status(200)
    .json({ status: "success", results: tours.length, data: tours });
});
