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
      attributes: ["firstName", "lastName"],
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
  const Operator = Sequelize.Op;
  return new Promise(async (resolve, reject) => {
    await TeamMember.findAll({
      attributes: [
        "teamId",
        [Sequelize.fn("count", Sequelize.col("teamId")), "count"],
      ],
      group: ["teamId"],
      where: {
        teamId: {
          [Operator.in]: teamId,
        },
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
  if (day !== 0 || day !== 6) {
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
    let employeeIdCount = JSON.stringify(0);
    resolve(employeeIdCount);
  }
}

function addLeave(value) {
  return new Promise(async (resolve, reject) => {
    await Leave.create({
      employeeId: value.employeeId,
      startDate: value.startDate,
      endDate: value.endDate,
      days: value.days,
      reason: value.reason,
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
};
