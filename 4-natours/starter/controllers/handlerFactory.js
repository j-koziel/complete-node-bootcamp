const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    // No data is being sent back to the client hence why the value is not stored in a var
    // Finds the doc with the _id and deletes it
    // Issues the mongoDB findOneAndDelete() command
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No doc found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      // No data to be sent
      data: null,
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    // Finds the doc by the _id field
    // Updates according to the request body
    // Will return the updated doc
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      // Will return the new updated object with this option
      new: true,
      // Will run validators on the new data
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No doc found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        // Send the updated doc
        data: doc,
      },
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    // const doc = new Model({})
    // doc.save()
    // Model.create returns a promise.
    // Use await to receive the fulfilled value
    // The fulfilled value is going to be the request body that has been sent.
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        // Send the newly created tour as a response
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // Returns a promise hence the use of ✨ await ✨
    // findById returns a query object
    // This allows for chaining
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError("No tour found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        // Send the tour as a response
        doc,
      },
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // EXECUTE QUERY
    // The find method here pretty much finds ✨ documents ✨
    // The find method also returns a mongoose query object so that queries can be executed as ✨ middleware ✨
    // Notes about "APIFeatures are in ../utils/apiFeatures.js"
    const features = new APIFeatures(Model.find(filter), req.query)
      .sort()
      .filter()
      .limitFields()
      .paginate();

    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        doc,
      },
    });
  });
