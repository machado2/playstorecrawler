const express = require('express');
const repo = require("./Repository.js")

const app = express();

app.listen(9090, function () { console.log('server up at 9090') });

app.get('/stats', async function(req, res) {
    let stats = await repo.stats();
    res.json(stats);
});

app.get('/free', async function(req, res) {
    let freegames = await (await repo.reallyFreeGames()).toArray()
    res.json(freegames)
})

app.use(express.static('frontend/dist/frontend'))
