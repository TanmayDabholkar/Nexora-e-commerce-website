const products = require('./catalogue.json');

module.exports = (request, response) => {
  response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  response.status(200).json(products);
};
