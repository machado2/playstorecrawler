const MongoClient = require('mongodb').MongoClient;
const config = require("./config.js")

let db = null

async function connect() {
  const conf = await config.getConfig();
  return await new Promise(function (resolve, reject) {
    const client = new MongoClient(conf.connectionUrl, { useUnifiedTopology: true});
    client.connect(function(err) {
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
    packageId : 1
  }, {
    unique : true
  })
  col.createIndex({
    lastUpdated : 1
  })
  return col
}

exports.insertIds = async function (list) {
  let packs = await getPackageList()
  for (let id of list) {
    // not sure why some ids came truncated in a dot
    if (!id.endsWith(".")) {
      packs.updateOne({
        packageId: id,
      }, { 
        $set: { packageId : id }
      },  { 
        upsert: true 
      })
    }
  }
}

exports.update = async function (package) {
  let packs = await getPackageList()
  packs.updateOne({
    packageId: package.packageId,
  }, { 
    $set: package
  },  { 
    upsert: true 
  })
}

exports.moveToEnd = async function (id) {
  let packs = await getPackageList()
  packs.updateOne({
    packageId: id,
  }, { 
    $set: { lastUpdated: new Date() }
  },  { 
    upsert: true 
  })
}

exports.get = async function(id) {
  let packs = await getPackageList()
  return packs.findOne({
    packageId : id
  })
}

exports.getOldest = async function() {
  let packs = await getPackageList()
  let data = await packs.find().sort({ lastUpdated : 1}).limit(1).toArray()
  if (data.length > 0)
    return data[0];
  else
    return null;
}