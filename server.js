const express = require('express');
var cors = require('cors');
const image = require('./controllers/image');
const app = express();
const bcrypt = require('bcrypt-nodejs');
const { console } = require('inspector');
const signin = require('./controllers/signin');
const register = require('./controllers/register');
const profile = require('./controllers/profile');

app.use(cors());
app.use(express.json()); 

const PORT = process.env.PORT;

const db = require('knex')({
    client: 'pg',
    connection: {
      connectionString:process.env.DB_URL,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
  });


app.get('/', (req,res) =>{
    res.json(db.users);
})


app.post('/signin', signin.handleSignin(db, bcrypt))

app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })


app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db)})
app.put('/image', (req, res) => { image.handleImage(req, res, db)})
app.post("/imageurl", async function(req, res){  
    var data = await image.handleApiCall(req);
    console.log(data);
    res.json(data);
 })



app.listen(PORT, ()=>{
    console.log(PORT);
    console.log("app is running on ${PORT}");
});

