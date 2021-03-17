const dbService = require("./dbService");

async function getDayRisk(cognitoId, date) {

  let teamInfo = await dbService.getTeamsInfo(cognitoId);
  let teamIdArray = teamInfo.map(function (teamId) {
    return teamId["teamId"];
  });
  let teamThresholdArray = teamInfo.map(function (teamThreshold) {
    return parseInt(teamThreshold["threshold"]);
  });

  let TeamMemberCount = await dbService.getTeamMemberCount(teamIdArray);
  let employeeOnLeaveCountArray = new Array();

  for (let index = 0; index < teamIdArray.length; index++) {
    let employeeId = await dbService.getEmployeeIdOfTeamMember(
      teamIdArray[index]
    );
    let employeeIdArray = employeeId.map(function (employeeId) {
      return employeeId["employeeId"];
    });

    let dateIs = new Date(date);
    let d = new Date(dateIs),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    var formattedDate = [year, month, day].join("-");
    let employeeOnLeaveCount = await dbService.getEmployeeOnLeave(
      employeeIdArray,
      formattedDate
    );
    employeeOnLeaveCountArray.push(employeeOnLeaveCount);
  }

  let percentOfUnavailableEmployeeArray = new Array();

  for (let index = 0; index < TeamMemberCount.length; index++) {
    let percentOfUnavailableEmployee =
      (employeeOnLeaveCountArray[index] /
        TeamMemberCount[index].dataValues.count) *
      100;
    percentOfUnavailableEmployeeArray.push(percentOfUnavailableEmployee);
  }

  let riskArray = new Array();
  for (
    let index = 0;
    index < percentOfUnavailableEmployeeArray.length;
    index++
  ) {
    if (percentOfUnavailableEmployeeArray[index] >= teamThresholdArray[index]) {
      let risk = true;
      riskArray.push(risk);
    } else {
      let risk = false;
      riskArray.push(risk);
    }
  }
  const result = {[formattedDate]:riskArray}

  return result;
}

async function getWeeklyRisk(cognitoId ,date) {
  let weekDaysDateArray = new Array();
  let startDay =
    date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
  let startDateOfWeek = new Date(date.setDate(startDay));

  let lastday = date.getDate() - (date.getDay() - 1) + 6;
  let endDateOfWeek = new Date(date.setDate(lastday));

  for (
    var d = startDateOfWeek;
    d <= endDateOfWeek;
    d.setDate(d.getDate() + 1)
  ) {
    weekDaysDateArray.push(new Date(d));
  }

  // let formattedWeekDaysDateArray = new Array();
  // for (let index = 0; index < weekDaysDateArray.length; index++) {
  //   let dateIs = new Date(weekDaysDateArray[index]);
  //   let d = new Date(dateIs),
  //     month = "" + (d.getMonth() + 1),
  //     day = "" + d.getDate(),
  //     year = d.getFullYear();

  //   if (month.length < 2) month = "0" + month;
  //   if (day.length < 2) day = "0" + day;

  //   let formattedDate = [year, month, day].join("-");
  //   formattedWeekDaysDateArray.push(formattedDate);
  // }
  
  let weeklyRiskArray = new Array();
  for (let index = 0; index < weekDaysDateArray.length; index++) {

    var weeklyRisk = await getDayRisk(cognitoId, weekDaysDateArray[index] )
    weeklyRiskArray.push(weeklyRisk);
  }

  return weeklyRiskArray;
}

module.exports = {
  getDayRisk,
  getWeeklyRisk,
};
