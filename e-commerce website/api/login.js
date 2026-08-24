const { database, verifyPassword, validate, send } = require('./_auth');

module.exports = async (request, response) => {
  if (request.method !== 'POST') return send(response, 405, { error: 'Method not allowed.' });
  try {
    const { email, password } = validate(request.body || {}, false);
    const sql = await database();
    const rows = await sql`SELECT name, password_hash FROM users WHERE email = ${email} LIMIT 1`;
    const user = rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) return send(response, 401, { error: 'Incorrect email or password.' });
    return send(response, 200, { message: `Welcome back, ${user.name}!` });
  } catch (error) {
    return send(response, 400, { error: error.message || 'Unable to sign in.' });
  }
};
