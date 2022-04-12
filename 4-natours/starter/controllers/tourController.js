const Tour = require('../models/tourModel');

// Check body function
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price)
    return res
      .status(400)
      .json({ status: 'fail', message: 'Invalid request (400)' });

  next();
};

exports.getAllTours = (req, res, next) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    // results: tours.length,
    // data: {
    //   tours,
    // },
  });
};

exports.getTour = (req, res) => {
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tours,
  //   },
  // });
};

exports.createTour = (req, res) => {
  res.status(201).json({
    status: 'success',
    // data: {
    //   tour: newTour,
    // },
  });
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
