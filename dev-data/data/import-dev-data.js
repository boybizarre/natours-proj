const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModels');

dotenv.config({ path: './config.env' });

const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

const importOrDelete = () => {
  const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
  );

  const importData = async () => {
    try {
      await Tour.create(tours);
      console.log('Data successfully created!');
    } catch (err) {
      console.log(err);
    }
    process.exit();
  };

  // Delete all data
  const deleteData = async () => {
    try {
      await Tour.deleteMany();
      console.log('Data successfully deleted!');
    } catch (err) {
      console.log(err);
    }
    process.exit();
  };

  if (process.argv[2] === '--import') {
    importData();
  } else if (process.argv[2] === '--delete') {
    deleteData();
  }
};

mongoose
  .connect(db)
  .then((connection) => {
    console.log('Connection successful!');
    importOrDelete();
  })
  .catch((err) => {
    console.log('Connection error');
  });
