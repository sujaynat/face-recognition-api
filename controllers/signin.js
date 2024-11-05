
const handleSignin = (db, bcrypt) => (req, res) => {
    db.select('email','hash').from('login')
    .where({'email': req.body.email})
    .then(data=>{
       const isValid =  bcrypt.compareSync(req.body.password, data[0].hash); 
       if(isValid){
        return db.select('*').from('users')
        .where({'email':req.body.email})
        .then(user=>{
            res.json(user[0])
        })
        .catch(err => res.status(400).json('Unable to get User'));
       }else{
        res.status(400).json('Wrong Credentials')
       }
       
    })
    .catch(err => res.status(400).json('Bad Request'));
}

module.exports = {
    handleSignin: handleSignin
}