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

app.post("/leave/addLeave", async (req, res) => {
  
  dbService
    .addLeave(req.body)
    .then((results) => {
      res.send(results);
    })
    .catch((error) => res.send(error));
});

app.get("/risk/getDayRisk", async (req, res) => {
  let cognitoIdentityId =
    req.apiGateway.event.requestContext.identity.cognitoIdentityId;
  //"ap-south-1:de248c54-4d9b-4bc1-92d3-3c2eee10ea43"
  let date = new Date();

  riskCalculation
    .getDayRisk(cognitoIdentityId, date)
    .then((results) => {
      res.send(results);
    })
    .catch((error) => res.send(error));
});

app.get("/risk/getWeeklyRisk", async (req, res) => {
  let cognitoIdentityId =
    req.apiGateway.event.requestContext.identity.cognitoIdentityId;
  let date = new Date();

  riskCalculation
    .getWeeklyRisk(cognitoIdentityId, date)
    .then((results) => {
      res.send(results);
    })
    .catch((error) => res.send(error));
});

app.get("/risk/getPreviousNextDayRisk/:teamId/:date", async (req, res) => {
  // /:teamId/:date req.params
  // let teamId = 1;
  // let date = new Date();
  // let prevDate = new Date(date);
  // console.log("api start")
  //   prevDate.setDate(prevDate.getDate() - 1)
  riskCalculation
    .getPreviousNextDayRisk(req.params.teamId, req.params.date)
    .then((results) => {
      res.send(results);
    })
    .catch((error) => res.send(error));
});

app.get(
  "/risk/getPreviousNextWeekRisk/:teamId/:startDateOfWeek/:endDateOfWeek",
  async (req, res) => {
  //  /:teamId/:startDateOfWeek/:endDateOfWeek req.params.teamId, req.params.startDateOfWeek, req.params.endDateOfWeek
  //  let teamId = 1;
  //  let date = new Date();
  //  let prevstartDate = new Date(date.setDate(8)).toISOString();
  //  let prevendDate = new Date(date.setDate(14)).toISOString();
    riskCalculation
      .getPreviousNextWeekRisk(req.params.teamId, req.params.startDateOfWeek, req.params.endDateOfWeek)
      .then((results) => {
        res.send(results);
      })
      .catch((error) => res.send(error));
  }
);

app.get("/team/getTeamInfo", async (req, res) => {
  let cognitoIdentityId =
    req.apiGateway.event.requestContext.identity.cognitoIdentityId;

  dbService
    .getTeamsInfo(cognitoIdentityId)
    .then((results) => {
      res.send(results);
    })
    .catch((error) => res.send(error));
});

app.get("/team/getTeamDetails/:teamId", async (req, res) => {
 dbService.getTeamCompleteInfo(req.params)
    .then((results) => {
      res.send(results);
    })
    .catch((error) => res.send(error));
});

app.listen(2000, () => console.log("listening to port 2000"));

module.exports.handler = serverless(app);
