// const fs = require('fs');
// const express = require('express');

// const app = express();
// const morgan = require('morgan');

// app.use(morgan('dev'));

// app.use((req, res, next) => {
//   console.log('Hello from the middleware');
//   next();
// });

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// app.use(express.json());

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
// );

// const getAllTours = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     requestedAt: req.requestTime,
//     result: tours.length,
//     data: {
//       tours,
//     },
//   });
// };

// const getTour = (req, res) => {
//   // console.log(req.params);

//   // convert parameter to a number
//   const id = req.params.id * 1;

//   console.log(tours.length);

//   // check if tour exists. can also use if(!tour){}
//   if (id > tours.length - 1) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }

//   const tour = tours.find((el) => el.id === id);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// };

// const updateTour = (req, res) => {
//   // long process in updating tour so i'll only just be doing the main steps

//   // convert parameter to a number
//   const id = req.params.id * 1;

//   // receive and edit tour from data base

//   // - - - - - - - - - - - - - - - - - - - - - - - -

//   // check if tour exists. can also use if(!tour){}
//   if (id > tours.length - 1) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: '<>Tour Updated!<>',
//     },
//   });
// };

// const deleteTour = (req, res) => {
//   // long process in updating tour so i'll only just be doing the main steps

//   // convert parameter to a number
//   const id = req.params.id * 1;

//   // receive and edit tour from data base

//   // - - - - - - - - - - - - - - - - - - - - - - - -

//   // check if tour exists. can also use if(!tour){}
//   if (id > tours.length - 1) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// };

// const createTour = (req, res) => {
//   console.log(req.body);

//   // created new object of the request oject
//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);

//   // push to array of tour objects
//   tours.push(newTour);

//   // write file to local database
//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: newTour,
//         },
//       });
//     }
//   );

//   // res.send('Done!');
// };

// const getAllUsers = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     data: 'This route is not yet defined',
//   });
// };

// const createUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     data: 'This route is not yet defined',
//   });
// };

// const getUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     data: 'This route is not yet defined',
//   });
// };

// const updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     data: 'This route is not yet defined',
//   });
// };

// const deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     data: 'This route is not yet defined',
//   });
// };

// // app.get('/api/v1/tours', getAllTours);

// // app.post('/api/v1/tours', createTour);

// // app.get('/api/v1/tours/:id', getTour);

// // app.patch('/api/v1/tours/:id', updateTour);

// // app.delete('/api/v1/tours/:id', deleteTour);

// const tourRouter = express.Router();
// const userRouter = express.Router();

// tourRouter.route('/').get(getAllTours).post(createTour);
// tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

// userRouter.route('/').get(getAllUsers).post(createUser);
// userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

// app.use('/api/v1/tours', tourRouter);
// app.use('/api/v1/users', userRouter);

// const port = 3000;

// app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });
