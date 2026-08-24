const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, 'kiln.db'));
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);

const insertUser = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
const getUser = db.prepare('SELECT name, password_hash FROM users WHERE email = ? COLLATE NOCASE');

function sendJson(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
}
function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  return crypto.timingSafeEqual(crypto.scryptSync(password, salt, 64), Buffer.from(hash, 'hex'));
}
function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => { body += chunk; if (body.length > 10000) request.destroy(); });
    request.on('end', () => { try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid request body.')); } });
    request.on('error', reject);
  });
}
function registrationData(body) {
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (name.length < 2 || name.length > 100) throw new Error('Enter a name between 2 and 100 characters.');
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) throw new Error('Enter a valid email address.');
  if (password.length < 8) throw new Error('Password must contain at least 8 characters.');
  return { name, email, password };
}
async function handleApi(request, response) {
  try {
    const body = await readJson(request);
    if (request.url === '/api/register') {
      const { name, email, password } = registrationData(body);
      try { insertUser.run(name, email, hashPassword(password)); }
      catch (error) { if (error.message.includes('UNIQUE')) return sendJson(response, 409, { error: 'An account with that email already exists.' }); throw error; }
      return sendJson(response, 201, { message: 'Account created. You can now sign in.' });
    }
    if (request.url === '/api/login') {
      const user = getUser.get(String(body.email || '').trim().toLowerCase());
      if (!user || !verifyPassword(String(body.password || ''), user.password_hash)) return sendJson(response, 401, { error: 'Incorrect email or password.' });
      return sendJson(response, 200, { message: `Welcome back, ${user.name}!` });
    }
    return sendJson(response, 404, { error: 'Not found.' });
  } catch (error) { return sendJson(response, 400, { error: error.message || 'Unable to process request.' }); }
}
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg' };
http.createServer((request, response) => {
  if (request.method === 'POST' && request.url.startsWith('/api/')) return handleApi(request, response);
  if (request.method !== 'GET') return sendJson(response, 405, { error: 'Method not allowed.' });
  const file = path.resolve(ROOT, `.${request.url === '/' ? '/index.html' : request.url}`);
  if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file)) return sendJson(response, 404, { error: 'Not found.' });
  response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
}).listen(PORT, () => console.log(`Kiln is running at http://localhost:${PORT}`));

