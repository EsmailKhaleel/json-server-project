const fs = require('fs');
const path = require('path');

const REVIEWS_DB_PATH = path.join(__dirname, '../../reviews.json');

const readReviewsDB = () => {
  const data = fs.readFileSync(REVIEWS_DB_PATH, 'utf8');
  return JSON.parse(data);
};

const writeReviewsDB = (data) => {
  fs.writeFileSync(REVIEWS_DB_PATH, JSON.stringify(data, null, 2));
};

module.exports = {
  readReviewsDB,
  writeReviewsDB
}; 