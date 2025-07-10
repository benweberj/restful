const express = require("express")

const app = express()

app.use('/', (req, res) => {
    res.send("Servers running.")
})

app.listen(5000, () => {
    console.log("Servers running on port 5000")
})