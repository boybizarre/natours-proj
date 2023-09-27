/* eslint-disable prefer-object-spread */
/* eslint-disable no-unused-vars */
const Tour = require('../models/tourModel');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// const catchAsync = (fn) => (req, res, next) => {
//   fn(req, res, next).catch(next);
// };

exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });
// exports.getTour = catchAsync(async (req, res, next) => {
//   // const tour = await Tour.findById(req.params.id).populate('guides');
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   if (!tour) {
//     return next(new AppError(`No tour found with that ID`, 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: tour,
//   });
// });

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError(`No tour found with that ID`, 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // select all documents with an ratingsAverage greater than 4.5
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    // calculate whatever average or sum you need to using the keys in the object
    // group by whatever value in object (_id)
    {
      $group: {
        // _id: '$ratingsAverage',
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    // sorting
    {
      $sort: { avgPrice: 1 },
    },

    // you can match multiple times
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  // send response
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    // unwind is used to destructure elements from an array document
    {
      $unwind: '$startDates',
    },

    // match stage is used for selecting
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    // the group stage is used to group the matched documents into what '_id" you choose
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: {
          $push: '$name',
        },
      },
    },

    // the addFIelds stage adds a field with the value for the field you choose
    {
      $addFields: {
        month: '$_id',
      },
    },

    // the project stage hides a field 0 = to hide, 1 = to show
    {
      $project: {
        _id: 0,
      },
    },

    // sorting 1 = for ascending, -1 = for descending
    {
      $sort: {
        numTour: 1,
      },
    },

    // limits the number of documents to what you have specified
    // {
    //   $limit: 6,
    // },
  ]);
  // send response
  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan,
    },
  });
});
