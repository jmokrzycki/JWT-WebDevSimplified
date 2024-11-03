require('dotenv').config()

const express = require('express')
const app = express()

const jwt = require('jsonwebtoken')

app.use(express.json())

// check if we arleady have a refresh token
// this is example, should be stored in database
let refreshTokens = []

app.post('/token', (req, res) => {
    // refresh session by refresh token
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    
    // if verified return new access token (user is claims)    
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name })
        res.json({ accessToken: accessToken })
    })
})

app.post('/login', (req, res) => {
    // usually check username and password (not in this)
    const username = req.body.username
    const user = { name: username, test: 'test' } // test param for example (claims)

    // generate token
    const accessToken = generateAccessToken(user)
    // generate refresh token
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    // refresh tokens should be stored in database
    refreshTokens.push(refreshToken)

    // return tokens
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
});

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20s' });
}

app.listen(4000);
