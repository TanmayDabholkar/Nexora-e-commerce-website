const crypto = require('node:crypto');
const { neon } = require('@neondatabase/serverless');

function send(response, status, body) { return response.status(status).json(body); }
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
}
function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  return crypto.timingSafeEqual(crypto.scryptSync(password, salt, 64), Buffer.from(hash, 'hex'));
}
function validate(body, requireName) {
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (requireName && (name.length < 2 || name.length > 100)) throw new Error('Enter a name between 2 and 100 characters.');
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) throw new Error('Enter a valid email address.');
  if (password.length < 8) throw new Error('Password must contain at least 8 characters.');
  return { name, email, password };
}
async function database() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  const sql = neon(process.env.DATABASE_URL);
  await sql`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(254) UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  return sql;
}
module.exports = { database, hashPassword, verifyPassword, validate, send };
