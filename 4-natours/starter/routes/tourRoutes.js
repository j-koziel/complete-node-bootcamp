const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

// The router object is like a "mini-application".
// It allows you to clean up your routes so that the file does not become cluttered.
// Only performs middleware and routing functions.
const router = express.Router();

// Routes
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
