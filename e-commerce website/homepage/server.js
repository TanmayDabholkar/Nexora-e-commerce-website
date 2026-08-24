const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { getAllProducts } = require('./products-database');
const { findUserByEmail, createUser } = require('./users-database');
const PORT = process.env.PORT || 3001;
const ROOT = __dirname;
const LOGIN_ROOT = path.resolve(ROOT, '..', 'login-page');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg' };
const sendJson = (response, status, data) => { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); response.end(JSON.stringify(data)); };
const hashPassword = password => {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
};
const verifyPassword = (password, storedHash) => {
  const [salt, hash] = storedHash.split(':');
  return crypto.timingSafeEqual(crypto.scryptSync(password, salt, 64), Buffer.from(hash, 'hex'));
};
const readJson = request => new Promise((resolve, reject) => {
  let body = '';
  request.on('data', chunk => { body += chunk; if (body.length > 10000) request.destroy(); });
  request.on('end', () => { try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid request body.')); } });
  request.on('error', reject);
});
async function handleAuth(request, response) {
  try {
    const body = await readJson(request);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) throw new Error('Enter a valid email address.');
    if (request.url === '/api/register') {
      const name = String(body.name || '').trim();
      if (name.length < 2 || name.length > 100) throw new Error('Enter a name between 2 and 100 characters.');
      if (password.length < 8) throw new Error('Password must contain at least 8 characters.');
      try { createUser(name, email, hashPassword(password)); }
      catch (error) { if (error.message.includes('UNIQUE')) return sendJson(response, 409, { error: 'An account with that email already exists.' }); throw error; }
      return sendJson(response, 201, { message: 'Account created. You can now sign in.' });
    }
    if (request.url === '/api/login') {
      const user = findUserByEmail(email);
      if (!user || !verifyPassword(password, user.password_hash)) return sendJson(response, 401, { error: 'Incorrect email or password.' });
      return sendJson(response, 200, { message: `Welcome back, ${user.name}!` });
    }
    return sendJson(response, 404, { error: 'Not found.' });
  } catch (error) { return sendJson(response, 400, { error: error.message || 'Unable to process request.' }); }
}
http.createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/api/products') return sendJson(response, 200, getAllProducts());
  if (request.method === 'POST' && request.url.startsWith('/api/')) return handleAuth(request, response);
  if (request.method !== 'GET') return sendJson(response, 405, { error: 'Method not allowed.' });
  const requestPath = new URL(request.url, 'http://localhost').pathname;
  const isLoginPage = requestPath === '/login' || requestPath.startsWith('/login/');
  const relativePath = isLoginPage ? requestPath.replace(/^\/login\/?/, '') || 'index.html' : requestPath === '/' ? 'index.html' : requestPath.slice(1);
  const base = isLoginPage ? LOGIN_ROOT : ROOT;
  const file = path.resolve(base, relativePath);
  if (!file.startsWith(base + path.sep) || !fs.existsSync(file)) return sendJson(response, 404, { error: 'Not found.' });
  response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
}).listen(PORT, () => console.log(`Nexora is running at http://localhost:${PORT}`));
