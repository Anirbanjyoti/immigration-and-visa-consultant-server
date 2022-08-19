const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lyhwvwn.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// JWT Token verify
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}
async function run() {
  try {
    const serviceCollection = client
      .db("immigration-visa-consultant")
      .collection("services");
    const countryCollection = client
      .db("immigration-visa-consultant")
      .collection("countries");
    const userCollection = client
      .db("immigration-visa-consultant")
      .collection("users");
    const candidateCollection = client
      .db("immigration-visa-consultant")
      .collection("candidate");

    //  Get all Services data
    app.get("/services", async (req, res) => {
      const services = await serviceCollection.find().toArray();
      res.send(services);
    });
    //  create API to get single data
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });
    //  Get all Countries data
    app.get("/countries", async (req, res) => {
      const countries = await countryCollection.find().toArray();
      res.send(countries);
    });
    //  Get all Countries data
    app.get("/user", async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });
    // By 'PUT' method taking Login and registration User data
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1hr" }
      );
      res.send({ result, token });
    });

    // Post API-- to create / add candidate to all candidateCollection
    app.post("/candidate", async (req, res) => {
        const candidateDetails = req.body;
        const result = await candidateCollection.insertOne(candidateDetails);
        res.send(result);
      });
    // Get API-- to get all candidate data
      app.get("/candidate", async (req, res) => {
        const result = await candidateCollection.find().toArray();
        res.send(result);
      });

      
  } finally {
    //
  }
}

run().catch(console.dir);

//   DB_USER=visa_consultant
//   DB_PASS=NxAFaWzGAziMCp6I

app.get("/", (req, res) => {
  res.send("immigration-and-visa-consultant-server is Running!");
});
app.get("/hero", (req, res) => {
  res.send("immigration-and-visa-consultant-server is Running on Heroku!");
});

app.listen(port, () => {
  console.log(`immigration-and-visa-consultant-server Listening on port ${port}`);
});
