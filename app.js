const express = require('express')
const auth = require('./route/auth')
require("dotenv").config()

const app = express()
const port = process.env.PORT || 3000
app.use('/api/v1/auth', auth)

app.get('/', async(req, res) => {
    res.send('Hello World!')
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))