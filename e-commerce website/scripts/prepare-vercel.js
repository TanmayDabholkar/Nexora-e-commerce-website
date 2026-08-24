/* Builds the deployment-only public folder without changing the source folders. */
const fs = require('node:fs');
const path = require('node:path');
const { getAllProducts } = require('../homepage/products-database');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
fs.rmSync(publicDir, { recursive: true, force: true });
fs.mkdirSync(publicDir, { recursive: true });

// The browser receives the homepage at / and the auth page at /login/.
fs.cpSync(path.join(root, 'homepage'), publicDir, {
  recursive: true,
  filter: source => !source.includes(`${path.sep}data`) && !source.endsWith('server.js') && !source.endsWith('users-database.js') && !source.endsWith('products-database.js')
});
fs.cpSync(path.join(root, 'login-page'), path.join(publicDir, 'login'), {
  recursive: true,
  filter: source => !source.includes(`${path.sep}data`) && !source.endsWith('server.js')
});

// Product catalogue is read-only, so a generated JSON module is faster and
// simpler than querying Postgres for every product card.
fs.mkdirSync(path.join(root, 'api'), { recursive: true });
fs.writeFileSync(path.join(root, 'api', 'catalogue.json'), JSON.stringify(getAllProducts()));
