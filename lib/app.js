const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/fruits', async(req, res) => {
  try {
    const data = await client.query('SELECT * from fruits');
    
    res.json(data.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/fruits/:id', async(req, res) => {
  try {
    const data = await client.query(`SELECT * from fruits where id=${req.params.id}`);
    
    res.json(data.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/fruits', async(req, res) => {
  try {
    const data = await client.query(`
      INSERT INTO fruits (name, category, price)
      VALUES ($1, $2, $3)
      RETURNING *`, [req.body.name, req.body.category, req.body.price]);
    
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/fruits/:id', async(req, res) => {
  try {
    const data = await client.query(`
      update fruits
      set name=$1,
      category=$2,
      price=$3
      where id=$4
      returning *
      `, [req.body.name, req.body.category, req.body.price, req.params.id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/fruits/:id', async(req, res) => {
  try {
    const data = await client.query(`delete from fruits where id=$1`, [req.params.id]);
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});


app.use(require('./middleware/error'));

module.exports = app;
