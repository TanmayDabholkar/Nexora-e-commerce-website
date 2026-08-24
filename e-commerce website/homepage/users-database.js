const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');
const dataDirectory = path.join(__dirname, 'data');
fs.mkdirSync(dataDirectory, { recursive: true });
const usersDb = new DatabaseSync(path.join(dataDirectory, 'users.db'));
usersDb.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE, password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);

// Earlier versions of the sign-in page used its own database. Import those
// accounts once so both pages authenticate against this shared database.
const legacyDatabase = path.resolve(__dirname, '..', 'login-page', 'data', 'kiln.db');
if (fs.existsSync(legacyDatabase)) {
  const legacyDb = new DatabaseSync(legacyDatabase, { readOnly: true });
  const legacyUsers = legacyDb.prepare('SELECT name, email, password_hash, created_at FROM users').all();
  const importUser = usersDb.prepare('INSERT OR IGNORE INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)');
  legacyUsers.forEach(user => importUser.run(user.name, user.email, user.password_hash, user.created_at));
  legacyDb.close();
}
module.exports = {
  findUserByEmail: email => usersDb.prepare('SELECT id, name, email, password_hash, created_at FROM users WHERE email = ? COLLATE NOCASE').get(email),
  createUser: (name, email, passwordHash) => usersDb.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name, email, passwordHash)
};
