const MongoClient = require('mongodb').MongoClient;
const config = require("./config.js")

let db = null

async function connect() {
  const conf = await config.getConfig();
  return await new Promise(function (resolve, reject) {
    const client = new MongoClient(conf.connectionUrl, { useUnifiedTopology: true });
    client.connect(function (err) {
      if (err != null) {
        reject(err);
      } else {
        resolve(client.db(conf.dbName));
      }
    })
  })
}

async function getDb() {
  if (db === null) {
    db = await connect()
  }
  return db
}

async function getPackageList() {
  let db = await getDb()
  let col = db.collection("packageList")
  col.createIndex({
    appId: 1
  }, {
    unique: true
  })
  col.createIndex({
    lastUpdated: 1
  })
  return col
}

exports.insertIds = async function (list) {
  let packs = await getPackageList()
  for (let id of list) {
    packs.updateOne({
      appId: id,
    }, {
      $set: { appId: id }
    }, {
      upsert: true
    })
  }
}

exports.update = async function (package) {
  let packs = await getPackageList()
  package.lastUpdated = new Date();
  await packs.updateOne({
    appId: package.appId,
  }, {
    $set: package
  }, {
    upsert: true
  })
}

exports.moveToEnd = async function (id) {
  let packs = await getPackageList()
  await packs.updateOne({
    appId: id,
  }, {
    $set: { lastUpdated: new Date() }
  }, {
    upsert: true
  })
}

exports.get = async function (id) {
  let packs = await getPackageList()
  return packs.findOne({
    appId: id
  })
}

exports.stats = async function () {
  let packs = await getPackageList()
  return {
    known: await packs.countDocuments(),
    processed: await packs.find({ lastUpdated: { $ne: null } }).count(),
    noiapgames: await (await this.noiapgames()).count(),
    reallyFreeGames: await (await this.reallyFreeGames()).count(),
    games: await packs.find({ genreId: { $regex: /^GAME/ } }).count()
  }
}

exports.reallyFreeGames = async function () {
  let packs = await getPackageList()
  return await packs.find({
    genreId: { $regex: /^GAME/ }, offersIAP: false, adSupported: false, price: 0,
    score: { $gt: 4.0 },
    reviews: { $gt: 10 },
    description: { $not: /account/ }
  })
}

exports.noiapgames = async function () {
  let packs = await getPackageList()
  return await packs.find({
    genreId: { $regex: /^GAME/ }, offersIAP: false, adSupported: false,
    score: { $gt: 4.0 },
    reviews: { $gt: 10 },
    description: { $not: /account/ }
  }).limit(100)
}

exports.getOldest = async function () {
  let packs = await getPackageList()
  let data = await packs.find({ i: null}).sort({ lastUpdated: 1 }).limit(1).toArray()
  if (data.length > 0)
    return data[0];
  else
    return null;
}
