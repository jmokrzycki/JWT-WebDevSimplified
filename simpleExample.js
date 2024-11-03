require('dotenv').config()

const express = require('express')
const app = express()

const jwt = require('jsonwebtoken')

app.use(express.json())

const posts = [
    {
        username: 'user1',
        title: 'post 1'
    },
    {
        username: 'user2',
        title: 'post 2'
    }
]

app.get('/posts', authenticateToken, (req, res) => {
     // req.user => { name: username, test: 'test', iat: 1730593548 } (claims)
     // req comes from middleware authenticateToken
    res.json(posts.filter(post => post.username === req.user.name));
});

app.post('/login', (req, res) => {
    // usually check username and password (not in this)
    const username = req.body.username
    const user = { name: username, test: 'test' } // test param for example (claims)

    // generate token
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    // return token
    res.json({ accessToken: accessToken })
});

function authenticateToken(req, res, next) {
    // extract Bearer Token, example:
    // Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidXNlcjEiLCJpYXQiOjE3MzA1OTE4NzB9.lRu5MF1TKYLN6zprP7pzCK2VM2TafetTNQrKCt7YxWo
    const authHeader = req.headers['authorization']; 
    // extract token
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.sendStatus(401)

    // if verified return user (user is claims)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user // { name: username, test: 'test', iat: 1730593548 } (claims)
        next()
    })
}

app.listen(3000);


// token pobrac z logowania (POST http://localhost:3000/login i recznie dodac)
// GET http://localhost:3000/posts
// Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidXNlcjEiLCJ0ZXN0IjoidGVzdCIsImlhdCI6MTczMDU5MzU0OH0.xYl6jMtRErF5R-WY-0T8Wqgj1qHWO8I0EsxvM_vfAJE

// ###

// POST http://localhost:3000/login
// Content-Type: application/json

// {
//     "username": "user1"
// }