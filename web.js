const express = require('express');
const bodyParser = require('body-parser');
const repo = require("./Repository.js")

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
});

app.listen(9090, function () { console.log('server up at 9090') });

app.get('/stats', async function(req, res) {
    let stats = await repo.stats();
    res.json(stats);
});

app.get('/free', async function(req, res) {
    let freegames = await (await repo.reallyFreeGames()).toArray()
    res.json(freegames)
})