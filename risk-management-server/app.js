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
const riskCalculation = require("./riskCalculation");

app.get("/server", (req, res) => {
  res.send("Hello it's server");
});

app.post("/employee/addEmployee", async (req, res) => {
  let cognitoIdentityId =
    req.apiGateway.event.requestContext.identity.cognitoIdentityId;
  dbService
    .addEmployee(req.body, cognitoIdentityId)
    .then((results) => {
      res.send(results);
    })
    .catch((error) => res.send(error));
});

app.get("/team/getTeamName", async (req, res) => {
  // let cognitoIdentityId =
  //   req.apiGateway.event.requestContext.identity.cognitoIdentityId;
  
  dbService
  .getTeamsInfo("ap-south-1:de248c54-4d9b-4bc1-92d3-3c2eee10ea43")
  .then((results) => {
    res.send(results);
  })
  .catch((error) => res.send(error));
});

app.get("/team/test", async (req, res) => {
  //  let employeeId= [22, 23, 24, 25];
    let date = new Date();
  
  // let teamId = [1, 2, 5];
  // riskCalculation.getWeeklyRisk(date)
 riskCalculation.getDayRisk("ap-south-1:de248c54-4d9b-4bc1-92d3-3c2eee10ea43" ,date)
  .then((results) => {
    res.send(results);
  })
  .catch((error) => res.send(error));
});



app.listen(2000, () => console.log("listening to port 2000"));

module.exports.handler = serverless(app);
