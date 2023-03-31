const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 1000;
const app = express();
const jwt = require("jsonwebtoken");
const fs = require("fs");


// middleware
app.use(cors());
app.use(express.json());

// variable

const secret = process.env.ACCESS_TOKEN;



function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  //   console.log(authHeader);
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, secret, function (err, decoded) {
    if (err) {
      // console.log(err);
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}



      
       const verifyAdmin = async (req, res, next) => {
         const decodedEmail = req.decoded.email;
           const query = { email: decodedEmail };
        //    console.log(query);
           const user = await usersCollection.findOne(query);
        //    console.log(user);
         if (user?.user_type !== "Admin") {
           return res.status(403).send({ message: "forbidden access.." });
         }
         next();
       };

    //* JWT
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      //   console.log(user);
      if (user) {
        const token = jwt.sign({ email }, secret, { expiresIn: "7d" });
        return res.send({ accessToken: token });
      }
      return res.status(403).send({ accessToken: "" });
    });


    app.get('/categories',async(req, res)=> {
      const categories = JSON.parse(fs.readFileSync("./fakedata/categories.json"));
      res.send(categories);
    })
app.get('/products',async(req, res)=> {
  const products = JSON.parse(fs.readFileSync("./fakedata/products.json"));
  res.send(products);
})
    

    //* Users
    app.post("/users", async (req, res) => {
      
      
    });

   

   



app.get("/", async (req, res) => {
  res.send("em shop is running");
});

app.listen(port, () => {
  console.log("em shop running on", port);
});
