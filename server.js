const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(db)
  .then((connection) => {
    // console.log(connection.connections);
    console.log('Connection successful!');

    // const testTour = new Tour({
    //   name: 'The Park Camper',
    //   price: 997,
    // });

    // testTour
    //   .save()
    //   .then((doc) => {
    //     console.log(doc);
    //   })
    //   .catch((err) => {
    //     console.log('Error: ', err);
    //   });
  })
  .catch((err) => {
    console.log('Connection error');
  });

const app = require('./app');

// console.log(app.get('env'));
// console.log(process.env)

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
