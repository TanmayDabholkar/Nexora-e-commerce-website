const { database, hashPassword, validate, send } = require('./_auth');

module.exports = async (request, response) => {
  if (request.method !== 'POST') return send(response, 405, { error: 'Method not allowed.' });
  try {
    const { name, email, password } = validate(request.body || {}, true);
    const sql = await database();
    await sql`INSERT INTO users (name, email, password_hash) VALUES (${name}, ${email}, ${hashPassword(password)})`;
    return send(response, 201, { message: 'Account created. You can now sign in.' });
  } catch (error) {
    if (error.code === '23505') return send(response, 409, { error: 'An account with that email already exists.' });
    return send(response, 400, { error: error.message || 'Unable to create account.' });
  }
};
