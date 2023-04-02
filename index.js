const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 1000;
const app = express();
const jwt = require("jsonwebtoken");

// middleware
app.use(cors());
app.use(express.json());

// variable
const user = process.env.DB_USER;
const password = process.env.DB_PASS;
const Secret = process.env.ACCESS_TOKEN;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${user}:${password}@cluster0.nvx6pod.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, Secret, function (err, decoded) {
    if (err) {
      res.status(401).send({ message: "Unauthorized access" });
    }
    req.decoded = decoded;
    //   console.log(decoded);
    next();
  });
}

async function run() {
  try {
    const categoriesCollection = client.db("em-shop").collection("categories");
    const productsCollection = client.db("em-shop").collection("products");
    const usersCollection = client.db("em-shop").collection("users");

    //* JWT
    app.post("/jwt", (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, Secret, { expiresIn: "7d" });
      console.log(token);
      res.send({ token });
    });

    //* Users
    app.post("/users", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const filter = { mobile: user.mobile };
      const mobile = await usersCollection.findOne(filter);
      if (mobile) {
        res.send({ message: "Already have account with this number." });
      } else {
        const result = await usersCollection.insertOne(user);
        res.send({ result, user });
      }
    });

    app.post("/loginUser", async (req, res) => {
      // console.log("in");
      const user = req.body;
      // console.log(user);
      const filter = { mobile: user.mobile, password: user.password };
      const result = await usersCollection.findOne(filter);
      // console.log(result);
      if (result) {
        res.send({ result, user });
      } else {
        res.send({ message: "something is wrong." });
      }
    });

    app.get("/products", async (req, res) => {
      const query = {};
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await categoriesCollection.find(query).toArray();
      // console.log(result);
      res.send(result);
    });
    app.get("/categoryProduct", async (req, res) => {
      const id = req.query.id;
      // console.log(id);
      const query = { category_id: id };
      const category = await categoriesCollection.findOne(query);
      // console.log(category);
      const name = category?.category_name;
      // console.log(id);
      const products = await productsCollection.find(query).toArray();
      // console.log(result);
      res.send({ products, name });
    });

    app.get("/productDetails", async (req, res) => {
      const id = req.query.id;
      // console.log(id);
      const filter = { _id: new ObjectId(id) };
      const product = await productsCollection.findOne(filter);
      // console.log(product);
      res.send(product);
    });

    app.get('/customers', async (req, res) => {
      const query = {}
      const data = await usersCollection.find(query).toArray();
      res.send(data)
    })
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("em shop is running");
});

app.listen(port, () => {
  console.log("em shop running on", port);
});
