/* eslint-disable prefer-object-spread */
/* eslint-disable no-unused-vars */
const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);

// console.log(tours);

exports.checkID = (req, res, next, val) => {
  console.log(`The tour id is ${val}`);

  if (req.params.id * 1 > tours.length - 1) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }

  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    result: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  // console.log(req.params);

  // convert parameter to a number
  const id = req.params.id * 1;

  // console.log(tours.length);

  // check if tour exists. can also use if(!tour){}

  const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.updateTour = (req, res) => {
  // long process in updating tour so i'll only just be doing the main steps

  // convert parameter to a number
  const id = req.params.id * 1;

  // receive and edit tour from data base

  // - - - - - - - - - - - - - - - - - - - - - - - -

  // check if tour exists. can also use if(!tour){}

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<>Tour Updated!<>',
    },
  });
};

exports.deleteTour = (req, res) => {
  // long process in updating tour so i'll only just be doing the main steps

  // receive and edit tour from data base
  const id = req.params.id * 1;

  // - - - - - - - - - - - - - - - - - - - - - - - -

  // check if tour exists. can also use if(!tour){}

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

exports.createTour = (req, res) => {
  console.log(req.body);

  // created new object of the request oject
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  // push to array of tour objects
  tours.push(newTour);

  // write file to local database
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    },
  );

  // res.send('Done!');
};
