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
const Logger = require("./logger/logger");
const log = new Logger();

app.get("/server", (req, res) => {
  res.send("Hello it's server");
});

app.post("/employee/addEmployee", async (req, res) => {
  log.info("/employee/addEmployee", log.methodStart);
  let cognitoIdentityId =
    req.apiGateway.event.requestContext.identity.cognitoIdentityId;
  dbService
    .addEmployee(req.body, cognitoIdentityId)
    .then((results) => {
      res.send(results);
      log.info("/employee/addEmployee", log.methodEnd);
    })
    .catch((error) => {
      log.error(
        "/employee/addEmployee",
        "Error in addEmployee API " + error.message
      );
      res.send(error);
      log.info("/employee/addEmployee", log.methodEnd);
    });
});

app.post("/leave/addLeave", async (req, res) => {
  log.info("/leave/addLeave", log.methodStart);
  dbService
    .addLeave(req.body)
    .then((results) => {
      res.send(results);
      log.info("/leave/addLeave", log.methodEnd);
    })
    .catch((error) => {
      log.error("/leave/addLeave", "Error in addLeave API " + error.message);
      res.send(error);
      log.info("/leave/addLeave", log.methodEnd);
    });
});

app.get("/team/getTeamName/:teamId", async (req, res) => {
  log.info("/team/getTeamName/:teamId", log.methodStart);
  dbService
    .getTeamDetails(req.params.teamId)
    .then((results) => {
      res.send(results);
      log.info("/team/getTeamName/:teamId", log.methodEnd);
    })
    .catch((error) => {
      log.error(
        "/team/getTeamName/:teamId",
        "Error in getTeamName API " + error.message
      );
      res.send(error);
      log.info("/team/getTeamName/:teamId", log.methodEnd);
    });
});

app.get("/leave/getLeaveDetails", async (req, res) => {
// app.get("/leave/getLeaveDetails/:teamId/:date", async (req, res) => {
  log.info("/leave/getLeaveDetails/:teamId/:date", log.methodStart);
  let teamId = 1;
  let date = "2021-04-16";
  dbService
     .getTeamEmployeeOnLeave(teamId, date)
    // .getTeamEmployeeOnLeave(req.params.teamId, req.params.date)
    .then((results) => {
      res.send(results);
      log.info("/leave/getLeaveDetails/:teamId/:date", log.methodEnd);
    })
    .catch((error) => {
      log.error(
        "/leave/getLeaveDetails/:teamId/:date",
        "Error in getLeaveDetails API " + error.message
      );
      res.send(error);
      log.info("/leave/getLeaveDetails/:teamId/:date", log.methodEnd);
    });
});

  app.get("/leave/getLeaveDetailsOfTeam/:teamId/:startDate/:endDate", async (req, res) => {
    log.info("/leave/getLeaveDetailsOfTeam/:teamId/:startDate/:endDate", log.methodStart);
    dbService
    .getEmployeeDetailsOnLeave(req.params.teamId, req.params.startDate, req.params.endDate)
      .then((results) => {
        res.send(results);
        log.info("/leave/getLeaveDetailsOfTeam/:teamId/:startDate/:endDate", log.methodEnd);
      })
      .catch((error) => {
        log.error(
          "/leave/getLeaveDetailsOfTeam/:teamId/:startDate/:endDate",
          "Error in getLeaveDetails API " + error.message
        );
        res.send(error);
        log.info("/leave/getLeaveDetails/:teamId/:startDate/:endDate", log.methodEnd);
      });
  });
  

app.get("/risk/getDayRisk", async (req, res) => {
  log.info("/risk/getDayRisk", log.methodStart);
  let cognitoIdentityId =
    req.apiGateway.event.requestContext.identity.cognitoIdentityId;
  console.log("cognitoIdentityId", cognitoIdentityId);
  let date = new Date();
  console.log("date", date);
  riskCalculation
    .getDayRisk(cognitoIdentityId, date)
    .then((results) => {
      res.send(results);
      log.info("/risk/getDayRisk", log.methodEnd);
    })
    .catch((error) => {
      log.error("/risk/getDayRisk", "Error in getDayRisk API " + error.message);
      res.send(error);
      log.info("/risk/getDayRisk", log.methodEnd);
    });
});

app.get("/risk/getWeeklyRisk", async (req, res) => {
  log.info("/risk/getWeeklyRisk", log.methodStart);
  let cognitoIdentityId =
    req.apiGateway.event.requestContext.identity.cognitoIdentityId;
  console.log("cognitoIdentityId", cognitoIdentityId);
  let date = new Date();
  console.log("date", date);

  riskCalculation
    .getWeeklyRisk(cognitoIdentityId, date)
    .then((results) => {
      res.send(results);
      log.info("/risk/getWeeklyRisk", log.methodEnd);
    })
    .catch((error) => {
      log.error(
        "/risk/getWeeklyRisk",
        "Error in getWeeklyRisk API " + error.message
      );
      res.send(error);
      log.info("/risk/getWeeklyRisk", log.methodEnd);
    });
});

app.get("/risk/getPreviousNextDayRisk/:date", async (req, res) => {
  log.info("/risk/getPreviousNextDayRisk/:date", log.methodStart);
  let cognitoIdentityId =
    req.apiGateway.event.requestContext.identity.cognitoIdentityId;
  console.log("cognitoIdentityId", cognitoIdentityId);
  console.log("date is api msg", req.params);
  riskCalculation
    .getPreviousNextDayRisk(cognitoIdentityId, req.params)
    .then((results) => {
      res.send(results);
      log.info("/risk/getPreviousNextDayRisk/:date", log.methodEnd);
    })
    .catch((error) => {
      log.error(
        "/risk/getPreviousNextDayRisk/:date",
        "Error in getPreviousNextDayRisk API " + error.message
      );
      res.send(error);
      log.info("/risk/getPreviousNextDayRisk/:date", log.methodEnd);
    });
});

app.get(
  "/risk/getPreviousNextWeekRisk/:startDateOfWeek/:endDateOfWeek",
  async (req, res) => {
    log.info(
      "/risk/getPreviousNextWeekRisk/:startDateOfWeek/:endDateOfWeek",
      log.methodStart
    );
    let cognitoIdentityId =
      req.apiGateway.event.requestContext.identity.cognitoIdentityId;
    console.log("cognitoIdentityId", cognitoIdentityId);
    riskCalculation
      .getPreviousNextWeekRisk(
        cognitoIdentityId,
        req.params.startDateOfWeek,
        req.params.endDateOfWeek
      )
      .then((results) => {
        res.send(results);
        log.info(
          "/risk/getPreviousNextWeekRisk/:startDateOfWeek/:endDateOfWeek",
          log.methodEnd
        );
      })
      .catch((error) => {
        log.error(
          "/risk/getPreviousNextWeekRisk/:startDateOfWeek/:endDateOfWeek",
          "Error in getPreviousNextWeekRisk API " + error.message
        );
        res.send(error);
        log.info(
          "/risk/getPreviousNextWeekRisk/:startDateOfWeek/:endDateOfWeek",
          log.methodEnd
        );
      });
  }
);

app.get("/team/getTeamInfo", async (req, res) => {
  log.info("/team/getTeamInfo", log.methodStart);
  let cognitoIdentityId =
    req.apiGateway.event.requestContext.identity.cognitoIdentityId;
  console.log("cognitoIdentityId", cognitoIdentityId);

  dbService
    .getTeamsInfo(cognitoIdentityId)
    .then((results) => {
      res.send(results);
      log.info("/team/getTeamInfo", log.methodEnd);
    })
    .catch((error) => {
      log.error(
        "/team/getTeamInfo",
        "Error in getPreviousNextWeekRisk API " + error.message
      );
      res.send(error);
      log.info("/team/getTeamInfo", log.methodEnd);
    });
});

app.get("/team/getTeamDetails/:teamId", async (req, res) => {
  log.info("/team/getTeamInfo", log.methodStart);
  dbService
    .getTeamCompleteInfo(req.params)
    .then((results) => {
      res.send(results);
      log.info("/team/getTeamDetails/:teamId", log.methodEnd);
    })
    .catch((error) => {
      log.error(
        "/team/getTeamDetails/:teamId",
        "Error in getTeamDetails API " + error.message
      );
      res.send(error);
      log.info("/team/getTeamDetails/:teamId", log.methodEnd);
    });
});

app.get("/team/getTeamMember", async (req, res) => {
  log.info("/team/getTeamMember", log.methodStart);
  let cognitoIdentityId =
    req.apiGateway.event.requestContext.identity.cognitoIdentityId;
  console.log("cognitoIdentityId", cognitoIdentityId);
  dbService
    .getTeamMemberDetails(cognitoIdentityId)
    .then((results) => {
      res.send(results);
      log.info("/team/getTeamMember", log.methodStart);
    })
    .catch((error) => {
      log.error(
        "/team/getTeamMember",
        "Error in getTeamMember API " + error.message
      );
      res.send(error);
      log.info("/team/getTeamMember", log.methodEnd);
    });
});

app.get("/team/getMonthlyRisk/:teamId", async (req, res) => {
  log.info("/team/getMonthlyRisk/:teamId", log.methodStart);
  let nowdate = new Date();
  let monthStartDay = new Date(nowdate.getFullYear(), nowdate.getMonth(), 1);
  let monthEndDay = new Date(nowdate.getFullYear(), nowdate.getMonth() + 1, 0);
  riskCalculation
    .getMonthlyRisk(req.params, monthStartDay, monthEndDay)
    .then((results) => {
      res.send(results);
      log.info("/team/getMonthlyRisk/:teamId", log.methodEnd);
    })
    .catch((error) => {
      log.error(
        "/team/getMonthlyRisk/:teamId",
        "Error in getMonthlyRisk API " + error.message
      );
      res.send(error);
      log.info("/team/getMonthlyRisk/:teamId", log.methodEnd);
    });
});

app.get(
  "/team/getPrevNextMonthlyRisk/:teamId/:monthStartDay/:monthEndDay",
  async (req, res) => {
    log.info(
      "/team/getPrevNextMonthlyRisk/:teamId/:monthStartDay/:monthEndDay",
      log.methodStart
    );
    riskCalculation
      .getPrevNextMonthlyRisk(
        req.params.teamId,
        req.params.monthStartDay,
        req.params.monthEndDay
      )
      .then((results) => {
        res.send(results);
        log.info(
          "/team/getPrevNextMonthlyRisk/:teamId/:monthStartDay/:monthEndDay",
          log.methodEnd
        );
      })
      .catch((error) => {
        log.error(
          "/team/getPrevNextMonthlyRisk/:teamId/:monthStartDay/:monthEndDay",
          "Error in getPrevNextMonthlyRisk API " + error.message
        );
        res.send(error);
        log.info(
          "/team/getPrevNextMonthlyRisk/:teamId/:monthStartDay/:monthEndDay",
          log.methodEnd
        );
      });
  }
);


app.listen(2000, () => console.log("listening to port 2000"));

module.exports.handler = serverless(app);
