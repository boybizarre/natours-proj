/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
      // trim: true,
    },

    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Ratings must be above 1.0'],
      max: [5, 'Ratings must be below 5.0'],
    },

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },

    // parent referencing
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },

  // what this does is to populate the document with fields that are not persistent to the database when there is an output
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// cannot post more than one review on a tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// DOCUMENT MIDDLEWARE
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name -guides',
  // }).populate({
  //   path: 'user',
  //   select: 'name',
  // });

  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    // select all the reviews of the tour that was passed in as argument
    {
      $match: {
        tour: tourId,
      },
    },

    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  // console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // this points to the current review
  this.constructor.calcAverageRatings(this.tour);
});

// passing the document after which this query middleware would have had access to it since it saved, the running the calcAverageRatings function on it.
reviewSchema.post(/^findOneAnd/, async function (doc) {
  await doc.constructor.calcAverageRatings(doc.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
