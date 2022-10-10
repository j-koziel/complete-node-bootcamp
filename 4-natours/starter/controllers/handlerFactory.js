const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    // No data is being sent back to the client hence why the value is not stored in a var
    // Finds the tour with the _id and deletes it
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
