const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');


const db = require('knex')({
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      port: 5432,
      user: 'sujaynat',
      password: '',
      database: 'smart-brain',
    },
  });
const app = express();

app.use(cors());
app.use(express.json()); 


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



app.listen(3000, ()=>{
    console.log("app is running on 3000");
});

