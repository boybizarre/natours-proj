/* eslint-disable prefer-object-spread */
/* eslint-disable no-unused-vars */
const Tour = require('../models/tourModels');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

// console.log(tours);

// exports.checkID = (req, res, next, val) => {
//   console.log(`The tour id is ${val}`);

//   if (req.params.id * 1 > tours.length - 1) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }

//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }

//   next();
// };

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({})
    // newTour.save();
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }

  // res.send('Done!');
};

exports.getAllTours = async (req, res) => {
  
  try {
    const tours = await Tour.find();

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      result: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      data: err,
    });
  }
};

exports.getTour = async (req, res) => {
  
  try {
    const tour = await Tour.findById(req.params.id);
    // findOne({ _id: req.params.id};)
    
    res.status(200).json({
      status: 'success',
      data: tour,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }

  // console.log(req.params);
  // convert parameter to a number
  // const id = req.params.id * 1;
  // console.log(tours.length);
  // check if tour exists. can also use if(!tour){}
  // const tour = tours.find((el) => el.id === id);
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour,
  //   },
  // });
};

exports.updateTour = async (req, res) => {
  // long process in updating tour so i'll only just be doing the main steps

  // convert parameter to a number
  // const id = req.params.id * 1;

  // receive and edit tour from data base

  // - - - - - - - - - - - - - - - - - - - - - - - -

  // check if tour exists. can also use if(!tour){}

  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  // long process in updating tour so i'll only just be doing the main steps

  // receive and edit tour from data base
  // const id = req.params.id * 1;

  // - - - - - - - - - - - - - - - - - - - - - - - -

  // check if tour exists. can also use if(!tour){}

  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
