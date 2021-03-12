const serverless = require("serverless-http");
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//to handle cors error
const cors = require("cors");
app.use(cors());
const db = require("./dbConnection");
const dbService = require("./dbService");


app.get("/server", (req, res) => {
    res.send("Hello it's server");
  });

  app.post("/employee/addEmployee", async (req, res) => {
    console.log("/employee/addEmployee api")
    console.log("body", req.body)
    console.log("header", req.header)
    console.log("requet ", req.apiGateway.event.requestContext.identity)
    let cognitoIdentityId = req.apiGateway.event.requestContext.identity.cognitoIdentityId;
    console.log("cognitoIdentityId is ", cognitoIdentityId)
    dbService
      .createEmployee(req.body,cognitoIdentityId )
      .then((results) => {
        console.log("result is")
        res.send(results);
        console.log(results);
      })
      .catch((error) => res.send(error));
  });  
app.listen(2000, () => console.log("listening to port 2000"));

module.exports.handler = serverless(app);