const { Sequelize, Op } = require("sequelize");
const Logger = require("./logger/logger");
const log = new Logger();

const {
  Employee,
  Team,
  Leave,
  TeamMember,
  TeamManager,
} = require("./dbConnection");

// function to add new record for employee when user sign up
function addEmployee(value, cognitoId) {
  // Input is firstname, lastname, email, cognitoId
  // Output is new employee record will be created
  log.info("dbService|addEmployee", log.methodStart);
  return new Promise(async (resolve, reject) => {
    await Employee.create({
      firstName: value.firstName,
      lastName: value.lastName,
      cognitoId: cognitoId,
      email: value.email,
    })
      .then((results) => {
        if (results != null) {
          resolve(results);
        } else {
          reject("Employee not created!!");
        }
        log.info("dbService|addEmployee", log.methodEnd);
      })
      .catch((error) => {
        log.error(
          "dbService|addEmployee",
          "Error in addEmployee function " + error.message
        );
        reject(error);
        log.info("dbService|addEmployee", log.methodEnd);
      });
  });
}

// function to get employeeId of logged in user
function getEmployeeId(cognitoId) {
  // Input is cognitoId
  // Output is employeeId
  log.info("dbService|getEmployeeId", log.methodStart);
  return new Promise(async (resolve, reject) => {
    await Employee.findOne({
      attributes: ["employeeId"],
      where: {
        cognitoId: cognitoId,
      },
    })
      .then((results) => {
        if (results != null) {
          resolve(results);
        } else {
          reject("EmployeeId not found!!");
        }
        log.info("dbService|getEmployeeId", log.methodEnd);
      })
      .catch((error) => {
        log.error(
          "dbService|getEmployeeId",
          "Error in getEmployeeId function " + error.message
        );
        reject(error);
        log.info("dbService|getEmployeeId", log.methodEnd);
      });
  });
}

// Function to get employee details
function getEmployeeDetails(employeeId) {
  // Input is employeeId
  // Output is employee's firstname, lastname
  log.info("dbService|getEmployeeDetails", log.methodStart);
  return new Promise(async (resolve, reject) => {
    await Employee.findOne({
      attributes: ["employeeId", "firstName", "lastName"],
      where: {
        employeeId: employeeId,
      },
    })
      .then((results) => {
        if (results != null) {
          resolve(results);
        } else {
          reject("Employee not found!!");
        }
        log.info("dbService|getEmployeeDetails", log.methodEnd);
      })
      .catch((error) => {
        log.error(
          "dbService|getEmployeeDetails",
          "Error in getEmployeeDetails function " + error.message
        );
        reject(error);
        log.info("dbService|getEmployeeDetails", log.methodEnd);
      });
  });
}

// Function to get teamId of the teams which are under team manager(employee)
function getTeamId(employeeId) {
  // Input is employeeId
  // Output is teamId
  log.info("dbService|getTeamId", log.methodStart);
  return new Promise(async (resolve, reject) => {
    await TeamManager.findAll({
      attributes: ["teamId"],
      where: {
        employeeId: employeeId,
      },
    })
      .then((results) => {
        if (results != null) {
          resolve(results);
        } else {
          reject("TeamId not found!!");
        }
        log.info("dbService|getTeamId", log.methodEnd);
      })
      .catch((error) => {
        log.error(
          "dbService|getTeamId",
          "Error in getTeamId function " + error.message
        );
        reject(error);
        log.info("dbService|getTeamId", log.methodEnd);
      });
  });
}

// Function to get team details
function getTeamDetails(teamId) {
  // Input is teamId
  // Output is teamId, teamName, threshold
  log.info("dbService|getTeamDetails", log.methodStart);
  return new Promise(async (resolve, reject) => {
    await Team.findOne({
      attributes: ["teamId", "teamName", "threshold"],
      where: {
        teamId: teamId,
      },
    })
      .then((results) => {
        if (results != null) {
          resolve(results);
        } else {
          reject("Team not found!!");
        }
        log.info("dbService|getTeamDetails", log.methodEnd);
      })
      .catch((error) => {
        log.error(
          "dbService|getTeamDetails",
          "Error in getTeamDetails function " + error.message
        );
        reject(error);
        log.info("dbService|getTeamDetails", log.methodEnd);
      });
  });
}

// Function to get team member count of team
function getTeamMemberCount(teamId) {
  // Input is teamId
  // Output is team member count
  log.info("dbService|getTeamMemberCount", log.methodStart);
  return new Promise(async (resolve, reject) => {
    await TeamMember.findAll({
      attributes: [
        "teamId",
        [Sequelize.fn("count", Sequelize.col("teamId")), "count"],
      ],
      group: ["teamId"],
      where: {
        teamId: teamId,
      },
    })
      .then((results) => {
        if (results != null) {
          resolve(results);
        } else {
          reject("TeamMemberCount not found!!");
        }
        log.info("dbService|getTeamMemberCount", log.methodEnd);
      })
      .catch((error) => {
        log.error(
          "dbService|getTeamMemberCount",
          "Error in getTeamMemberCount function " + error.message
        );
        reject(error);
        log.info("dbService|getTeamMemberCount", log.methodEnd);
      });
  });
}

// Function to get employeeId of team member
function getEmployeeIdOfTeamMember(teamId) {
  // Input is teamId
  // Output is employeeId
  log.info("dbService|getEmployeeIdOfTeamMember", log.methodStart);
  return new Promise(async (resolve, reject) => {
    await TeamMember.findAll({
      attributes: ["employeeId"],
      where: {
        teamId: teamId,
      },
    })
      .then((results) => {
        if (results != null) {
          resolve(results);
        } else {
          reject("EmployeeId not found!!");
        }
        log.info("dbService|getEmployeeIdOfTeamMember", log.methodEnd);
      })
      .catch((error) => {
        log.error(
          "dbService|getEmployeeIdOfTeamMember",
          "Error in getEmployeeIdOfTeamMember function " + error.message
        );
        reject(error);
        log.info("dbService|getEmployeeIdOfTeamMember", log.methodEnd);
      });
  });
}

// Function to get employeeId of employees on leave
function getEmployeeOnLeave(employeeId, date) {
  // Input is employeeId and date
  // Output is  employeeId
  log.info("dbService|getEmployeeOnLeave", log.methodStart);
  const Operator = Sequelize.Op;
  let dateIs = new Date(date);
  let day = dateIs.getDay();
  if (day == 1 || day == 2 || day == 3 || day == 4 || day == 5) {
    return new Promise(async (resolve, reject) => {
      await Leave.findAll({
        attributes: ["employeeId"],
        where: {
          employeeId: {
            [Operator.in]: employeeId,
          },

          startDate: {
            [Operator.lte]: date,
          },

          endDate: {
            [Operator.gte]: date,
          },
        },
      })
        .then((results) => {
          if (results != null) {
            let employeeIdJsonLength = Object.keys(results).length;
            let employeeIdCount = JSON.stringify(employeeIdJsonLength);
            resolve(employeeIdCount);
          } else {
            reject("TeamMemberId not found!!");
          }
          log.info("dbService|getEmployeeOnLeave", log.methodEnd);
        })
        .catch((error) => {
          log.error(
            "dbService|getEmployeeOnLeave",
            "Error in getEmployeeOnLeave function " + error.message
          );
          reject(error);
          log.info("dbService|getEmployeeOnLeave", log.methodEnd);
        });
    });
  } else {
    return new Promise((resolve, reject) => {
      let employeeIdCount = JSON.stringify(0);
      let count = Promise.resolve(employeeIdCount);
      count
        .then((value) => {
          resolve(value);
          log.info("dbService|getEmployeeOnLeave", log.methodEnd);
        })
        .catch((error) => {
          log.error(
            "dbService|getEmployeeOnLeave",
            "Error in getEmployeeOnLeave function " + error.message
          );
          reject(error);
          log.info("dbService|getEmployeeOnLeave", log.methodEnd);
        });
    });
  }
}

// Function to add new leave record
function addLeave(value) {
  // Input is employeeId, startDate, endDate
  // Output is new record will be created
  log.info("dbService|addLeave", log.methodStart);
  return new Promise(async (resolve, reject) => {
    await Leave.create({
      employeeId: value.employeeId,
      startDate: value.startDate,
      endDate: value.endDate,
      status: value.status,
    })
      .then((results) => {
        if (results != null) {
          resolve(results);
        } else {
          reject("Employee not created!!");
        }
        log.info("dbService|addLeave", log.methodEnd);
      })
      .catch((error) => {
        log.error(
          "dbService|addLeave",
          "Error in addLeave function " + error.message
        );
        reject(error);
        log.info("dbService|addLeave", log.methodEnd);
      });
  });
}

// Function to get teams details
async function getTeamsInfo(cognitoId) {
  // Input is cognitoId
  // Output is teamId, teamName, threshold
  log.info("dbService|getTeamsInfo", log.methodStart);
  let employeeId = await getEmployeeId(cognitoId);
  let teamId = await getTeamId(employeeId.employeeId);

  var teamInfo = new Array();
  for (var id = 0; id < teamId.length; id++) {
    let result = await getTeamDetails(teamId[id].teamId);
    teamInfo.push(result);
  }
  log.info("dbService|getTeamsInfo", log.methodEnd);
  return teamInfo;
}

// Function to get complete team details of one specific team
async function getTeamCompleteInfo(teamId) {
  // Input is teamId
  // Output is teamId, teamName, threshold, teamMemberId, teamMember's firstname, lastname
  log.info("dbService|getTeamCompleteInfo", log.methodStart);
  let team = new Array(await getTeamDetails(teamId.teamId));
  let teamMember = await getEmployeeIdOfTeamMember(teamId.teamId);
  let employeeIdArray = teamMember.map(function (employeeId) {
    return employeeId["employeeId"];
  });
  let employeeDetailskArray = new Array();
  for (let index = 0; index < employeeIdArray.length; index++) {
    let employeeDetails = await getEmployeeDetails(employeeIdArray[index]);
    employeeDetailskArray.push(employeeDetails);
  }
  let result = team.concat(employeeDetailskArray);
  log.info("dbService|getTeamCompleteInfo", log.methodEnd);
  return result;
}

// Function to get teamMember details
async function getTeamMemberDetails(cognitoId) {
  // Input is coginitoId
  // Output is teamMemberId, firstName, lastName
  log.info("dbService|getTeamMemberDetails", log.methodStart);
  let employeeIdOfManager = await getEmployeeId(cognitoId);
  let teamId = await getTeamId(employeeIdOfManager.employeeId);
  let teamIdArray = teamId.map(function (teamId) {
    return teamId["teamId"];
  });
  let teamMemberIdArray = new Array();
  for (let index = 0; index < teamIdArray.length; index++) {
    let teamMemberId = await getEmployeeIdOfTeamMember(teamIdArray[index]);
    for (let index = 0; index < teamMemberId.length; index++) {
      teamMemberIdArray.push(teamMemberId[index].employeeId);
    }
  }
  let distinct = (value, index, self) => {
    return self.indexOf(value) === index;
  };
  let distinctTeamMemberIdArray = teamMemberIdArray.filter(distinct);

  let teamMemberDetailsArray = new Array();
  for (let index = 0; index < distinctTeamMemberIdArray.length; index++) {
    let teamMemberDetails = await getEmployeeDetails(
      distinctTeamMemberIdArray[index]
    );
    teamMemberDetailsArray.push(teamMemberDetails);
  }

  const employeeDetails = teamMemberDetailsArray.map((teamMemberDetails) => ({
    value: teamMemberDetails.employeeId,
    label: teamMemberDetails.firstName + " " + teamMemberDetails.lastName,
  }));
  log.info("dbService|getTeamMemberDetails", log.methodEnd);

  return employeeDetails;
}

// Function to get team employees on leave
async function getTeamEmployeeOnLeave(teamId, date) {
  // Input is teamId, date
  // Output is employeeId, firstName, lastName
  log.info("dbService|getTeamEmployeeOnLeave", log.methodStart);
  let dateIs = new Date(date);
  let teamMemberIdArray = new Array();
  let teamMemberId = await getEmployeeIdOfTeamMember(teamId);
  for (let index = 0; index < teamMemberId.length; index++) {
    teamMemberIdArray.push(teamMemberId[index].employeeId);
  }
  const Operator = Sequelize.Op;

  let employeeId = await Leave.findAll({
    attributes: ["employeeId"],
    where: {
      employeeId: {
        [Operator.in]: teamMemberIdArray,
      },

      startDate: {
        [Operator.lte]: dateIs,
      },

      endDate: {
        [Operator.gte]: dateIs,
      },
    },
  }).catch((error) => {
    log.error(
      "dbService|getTeamEmployeeOnLeave",
      "Error in getTeamEmployeeOnLeave function " + error.message
    );
    reject(error);
    log.info("dbService|getTeamEmployeeOnLeave", log.methodEnd);
  });

  let employeeldArray = employeeId.map(function (employeeId) {
    return parseInt(employeeId["employeeId"]);
  });

  let employeeOnLeaveDetails = new Array();
  for (let index = 0; index < employeeldArray.length; index++) {
    let employeeDetails = await getEmployeeDetails(employeeldArray[index]);
    employeeOnLeaveDetails.push(employeeDetails);
  }
  log.info("dbService|getTeamEmployeeOnLeave", log.methodEnd);

  return employeeOnLeaveDetails;
}

function getEmployeeIdOnLeaveEmployee(teamMemberIdArray, dateIs) {
  log.info("dbService|getEmployeeIdOnLeaveEmployee", log.methodStart);
  let date = new Date(dateIs);
  let day = date.getDay();
  if (day == 1 || day == 2 || day == 3 || day == 4 || day == 5) {
  return new Promise(async (resolve, reject) => {
    const Operator = Sequelize.Op;
    await Leave.findAll({
      attributes: ["employeeId"],
      where: {
        employeeId: {
          [Operator.in]: teamMemberIdArray,
        },

        startDate: {
          [Operator.lte]: dateIs,
        },

        endDate: {
          [Operator.gte]: dateIs,
        },
      },
    })
      .then((results) => {
        if (results != null) {
          let employeeldArray = results.map(function (employeeId) {
            return parseInt(employeeId["employeeId"]);
          });
          resolve(employeeldArray);
        } else {
          reject("EmployeeId not found!!");
        }
        log.info("dbService|getEmployeeIdOnLeaveEmployee", log.methodEnd);
      })
      .catch((error) => {
        log.error(
          "dbService|getEmployeeIdOnLeaveEmployee",
          "Error in getEmployeeIdOnLeaveEmployee function " + error.message
        );
        reject(error);
        log.info("dbService|getEmployeeIdOnLeaveEmployee", log.methodEnd);
      });
  });
} else {
  return new Promise((resolve, reject) => {
    let employeeId = [];
    let count = Promise.resolve(employeeId);
    count
      .then((value) => {
        resolve(value);
        log.info("dbService|getEmployeeIdOnLeaveEmployee", log.methodEnd);
      })
      .catch((error) => {
        log.error(
          "dbService|getEmployeeIdOnLeaveEmployee",
          "Error in getEmployeeIdOnLeaveEmployee function " + error.message
        );
        reject(error);
        log.info("dbService|getEmployeeIdOnLeaveEmployee", log.methodEnd);
      });
  });
}
}

async function getEmployeeDetailsOnLeave(teamId, startDate, endDate) {
  log.info("dbService|getEmployeeDetailsOnLeave", log.methodStart);
  let teamMemberIdArray = new Array();
  let teamMemberId = await getEmployeeIdOfTeamMember(teamId);
  for (let index = 0; index < teamMemberId.length; index++) {
    teamMemberIdArray.push(teamMemberId[index].employeeId);
  }

  let start = new Date(startDate);
  let end = new Date(endDate);
  let monthDateArray = new Array();

  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    monthDateArray.push(new Date(d));
  }

  let resultArray = new Array();
  for (let index = 0; index < monthDateArray.length; index++) {
    let dateIs = new Date(monthDateArray[index]);
    let d = new Date(dateIs),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    var formattedDate = [year, month, day].join("-");
      var result = await getEmployeeIdOnLeaveEmployee(
        teamMemberIdArray,
        dateIs
      );
    if (result.length != 0) {
      let resObject = {
        employeeId: result,
        date: formattedDate,
      };
      resultArray.push(resObject);
    }
  }

  let employeeOnLeaveDetails = new Array();
  for (let index = 0; index < resultArray.length; index++) {
    let empIdArray = resultArray[index].employeeId;
    for (let i = 0; i < empIdArray.length; i++) {
      let employeeDetails = await getEmployeeDetails(empIdArray[i]);
      let resObject = {
        title:
          employeeDetails.firstName +
          " " +
          employeeDetails.lastName +
          " " +
          "On leave",
        date: resultArray[index].date,
        color: "#91e038",
      };
      employeeOnLeaveDetails.push(resObject);
    }
  }
  log.info("dbService|getEmployeeDetailsOnLeave", log.methodEnd);

  return employeeOnLeaveDetails;
}

module.exports = {
  addEmployee,
  getEmployeeId,
  getEmployeeDetails,
  getTeamId,
  getTeamDetails,
  getTeamMemberCount,
  getEmployeeIdOfTeamMember,
  getEmployeeOnLeave,
  addLeave,
  getTeamsInfo,
  getTeamCompleteInfo,
  getTeamMemberDetails,
  getTeamEmployeeOnLeave,
  getEmployeeDetailsOnLeave,
  getEmployeeIdOnLeaveEmployee,
};
