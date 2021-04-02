const { Sequelize, Op } = require("sequelize");

const {
  Employee,
  Team,
  Leave,
  TeamMember,
  TeamManager,
} = require("./dbConnection");

function addEmployee(value, cognitoId) {
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
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getEmployeeId(cognitoId) {
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
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getEmployeeDetails(employeeId) {
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
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getTeamId(employeeId) {
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
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getTeamDetails(teamId) {
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
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getTeamMemberCount(teamId) {
  // const Operator = Sequelize.Op;
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
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getEmployeeIdOfTeamMember(teamId) {
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
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getEmployeeOnLeave(employeeId, date) {
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
        })
        .catch((error) => {
          reject(error);
        });
    });
  } else {
    return new Promise((resolve, reject) => {
      let employeeIdCount = JSON.stringify(0);
      let count = Promise.resolve(employeeIdCount);
      count
        .then((value) => {
          resolve(value);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

function addLeave(value) {
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
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function getTeamsInfo(cognitoId) {
  let employeeId = await getEmployeeId(cognitoId);
  let teamId = await getTeamId(employeeId.employeeId);

  var teamInfo = new Array();
  for (var id = 0; id < teamId.length; id++) {
    let result = await getTeamDetails(teamId[id].teamId);
    teamInfo.push(result);
  }
  return teamInfo;
}

async function getTeamCompleteInfo(teamId) {
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
  return result;
}

async function getTeamMemberDetails(cognitoId) {
  let employeeIdOfManager = await getEmployeeId(cognitoId);
  console.log("employeeIdOfManager", employeeIdOfManager);
  let teamId = await getTeamId(employeeIdOfManager.employeeId);
  console.log("teamId", teamId);
  let teamIdArray = teamId.map(function (teamId) {
    return teamId["teamId"];
  });
  console.log("teamIdArray", teamIdArray);
  let teamMemberIdArray = new Array();
  for (let index = 0; index < teamIdArray.length; index++) {
    let teamMemberId = await getEmployeeIdOfTeamMember(teamIdArray[index]);
    console.log("teamMemberId", teamMemberId);
    for (let index = 0; index < teamMemberId.length; index++) {
      teamMemberIdArray.push(teamMemberId[index].employeeId);
    }
  }
  console.log("teamMemberIdArray", teamMemberIdArray);
  let distinct = (value, index, self) => {
    return self.indexOf(value) === index;
  };
  let distinctTeamMemberIdArray = teamMemberIdArray.filter(distinct);
  console.log("distinctTeamMemberIdArray", distinctTeamMemberIdArray);

  let teamMemberDetailsArray = new Array();
  for (let index = 0; index < distinctTeamMemberIdArray.length; index++) {
    let teamMemberDetails = await getEmployeeDetails(
      distinctTeamMemberIdArray[index]
    );
    console.log("teamMemberDetails", teamMemberDetails);
    teamMemberDetailsArray.push(teamMemberDetails);
  }
  console.log("teamMemberDetailsArray", teamMemberDetailsArray);
  return teamMemberDetailsArray;
}

async function getTeamEmployeeOnLeave(teamId, date) {
  //teamId, date
  let teamMemberIdArray = new Array();
  let teamMemberId = await getEmployeeIdOfTeamMember(teamId);
  console.log("teamMemberId", teamMemberId);
  for (let index = 0; index < teamMemberId.length; index++) {
    teamMemberIdArray.push(teamMemberId[index].employeeId);
  }
  console.log("teamMemberIdArray", teamMemberIdArray);
  const Operator = Sequelize.Op;

  let employeeId = await Leave.findAll({
    attributes: ["employeeId"],
    where: {
      employeeId: {
        [Operator.in]: teamMemberIdArray,
      },

      startDate: {
        [Operator.lte]: date,
      },

      endDate: {
        [Operator.gte]: date,
      },
    },
  }).catch((error) => {
    reject(error);
  });

  console.log("employeeId", employeeId);

  let employeeldArray = employeeId.map(function (employeeId) {
    return parseInt(employeeId["employeeId"]);
  });

  console.log("employeeldArray", employeeldArray);

  let employeeOnLeaveDetails = new Array();
  for (let index = 0; index < employeeldArray.length; index++) {
    let employeeDetails = await getEmployeeDetails(employeeldArray[index]);
    console.log("employeeDetails", employeeDetails);
    employeeOnLeaveDetails.push(employeeDetails);
  }

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
};
