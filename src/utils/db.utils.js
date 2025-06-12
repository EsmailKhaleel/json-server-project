const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../db.json');

const readDB = () => {
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

module.exports = {
  readDB,
  writeDB
}; 