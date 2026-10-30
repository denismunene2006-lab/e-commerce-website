const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is required");

const client = new MongoClient(uri);
let databasePromise;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = client.connect().then(() =>
      client.db(process.env.MONGODB_DATABASE || "urbancart")
    );
  }
  return databasePromise;
}

async function getUsers() {
  const db = await getDatabase();
  return db.collection("users").find({}).toArray();
}

async function findUserByEmail(email) {
  const db = await getDatabase();
  return db.collection("users").findOne({ email });
}

async function findUserById(id) {
  const db = await getDatabase();
  return db.collection("users").findOne({ id });
}

async function createUser(user) {
  const db = await getDatabase();
  await db.collection("users").insertOne(user);
  return user;
}

async function createTransaction(transaction) {
  const db = await getDatabase();
  await db.collection("transactions").insertOne(transaction);
  return transaction;
}

async function updateTransactionByCheckoutId(checkoutRequestId, update) {
  const db = await getDatabase();
  return db.collection("transactions").findOneAndUpdate(
    { checkoutRequestId },
    { $set: update },
    { returnDocument: "after" }
  );
}

async function ensureIndexes() {
  const db = await getDatabase();
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("users").createIndex({ id: 1 }, { unique: true }),
    db.collection("transactions").createIndex({ checkoutRequestId: 1 })
  ]);
}

module.exports = {
  createTransaction,
  createUser,
  ensureIndexes,
  findUserByEmail,
  findUserById,
  getUsers,
  updateTransactionByCheckoutId
};
