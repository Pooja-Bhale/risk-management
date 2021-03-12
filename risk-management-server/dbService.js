const { Employee, Team, Leave, TeamMember, TeamManager } = require("./dbConnection");

function createEmployee(value, cognitoId) {
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
            console.log(results);
          } else {
            reject("Employee not created!!");
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  module.exports = {createEmployee };
  
