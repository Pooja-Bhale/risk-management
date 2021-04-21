const dbService = require("./dbService");
const Logger = require("./logger/logger");
const log = new Logger();

async function getDayRisk(cognitoId, date) {
  log.info("riskCalculation|getDayRisk", log.methodStart);
  let teamInfo = await dbService.getTeamsInfo(cognitoId);
  let teamIdArray = teamInfo.map(function (teamId) {
    return teamId["teamId"];
  });
  let teamThresholdArray = teamInfo.map(function (teamThreshold) {
    return parseInt(teamThreshold["threshold"]);
  });

  let TeamMemberCountArray = new Array();
  for (let index = 0; index < teamIdArray.length; index++) {
    let TeamMemberCount = await dbService.getTeamMemberCount(
      teamIdArray[index]
    );
    TeamMemberCountArray.push(TeamMemberCount[0].dataValues.count);
  }
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

  for (let index = 0; index < TeamMemberCountArray.length; index++) {
    let percentOfUnavailableEmployee =
      (employeeOnLeaveCountArray[index] / TeamMemberCountArray[index]) * 100;
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
      riskArray.push({
        ["teamId"]: teamIdArray[index],
        ["date"]: formattedDate,
        ["riskIs"]: risk,
      });
      console.log(risk);
    } else {
      let risk = false;
      riskArray.push({
        ["teamId"]: teamIdArray[index],
        ["date"]: formattedDate,
        ["riskIs"]: risk,
      });
    }
  }
  log.info("riskCalculation|getDayRisk", log.methodEnd);

  return riskArray;
}

async function getPreviousNextDayRisk(teamId, date) {
  log.info("riskCalculation|getPreviousNextDayRisk", log.methodStart);
  let teamInfo = await dbService.getTeamDetails(teamId);
  let teamInfoArray = new Array(teamInfo);
  let teamThresholdArray = teamInfoArray.map(function (teamThreshold) {
    return parseInt(teamThreshold["threshold"]);
  });

  let teamIdArray = new Array();
  teamIdArray.push(teamId);
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
      riskArray.push({
        ["teamId"]: teamIdArray[index],
        ["date"]: formattedDate,
        ["riskIs"]: risk,
      });
    } else {
      let risk = false;
      riskArray.push({
        ["teamId"]: teamIdArray[index],
        ["date"]: formattedDate,
        ["riskIs"]: risk,
      });
    }
  }
  log.info("riskCalculation|getPreviousNextDayRisk", log.methodEnd);

  return riskArray;
}

async function getWeeklyRisk(cognitoId, date) {
  log.info("riskCalculation|getWeeklyRisk", log.methodStart);
  let weekDaysDateArray = new Array();
  let startDay =
    date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
  let startDateOfWeek = new Date(date.setDate(startDay));

  let lastday = date.getDate() - (date.getDay() - 1) + 6;
  let endDateOfWeek = new Date(date.setDate(lastday));

  for (
    let d = startDateOfWeek;
    d <= endDateOfWeek;
    d.setDate(d.getDate() + 1)
  ) {
    weekDaysDateArray.push(new Date(d));
  }

  let weeklyRiskArray = new Array();
  for (let index = 0; index < weekDaysDateArray.length; index++) {
    let weeklyRisk = await getDayRisk(cognitoId, weekDaysDateArray[index]);
    weeklyRiskArray.push(weeklyRisk);
  }

  let allTeamsWeeklyRisk = {};
  for (let index = 0; index < weeklyRiskArray.length; index++) {
    let week = weeklyRiskArray[index];

    for (let i = 0; i < week.length; i++) {
      let id = week[i].teamId;
      let risk = week[i].riskIs;
      let date = week[i].date;
      let hasId = allTeamsWeeklyRisk.hasOwnProperty(id);

      if (!hasId) {
        allTeamsWeeklyRisk = {
          ...allTeamsWeeklyRisk,
          [id]: { date: [], weekRisk: [] },
        };
      }

      allTeamsWeeklyRisk[id].date.push(date);
      allTeamsWeeklyRisk[id].weekRisk.push(risk);
    }
  }
  log.info("riskCalculation|getWeeklyRisk", log.methodEnd);

  return allTeamsWeeklyRisk;
}

async function getPreviousNextWeekRisk(teamId, startDateOfWeek, endDateOfWeek) {
  log.info("riskCalculation|getPreviousNextWeekRisk", log.methodStart);
  let weekDaysDateArray = new Array();
  let start = new Date(startDateOfWeek);
  let end = new Date(endDateOfWeek);
  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    weekDaysDateArray.push(new Date(d));
  }

  let weeklyRiskArray = new Array();
  for (let index = 0; index < weekDaysDateArray.length; index++) {
    let weeklyRisk = await getPreviousNextDayRisk(
      teamId,
      weekDaysDateArray[index]
    );
    weeklyRiskArray.push(weeklyRisk);
  }

  let teamWeeklyRisk = {};
  for (let index = 0; index < weeklyRiskArray.length; index++) {
    let week = weeklyRiskArray[index];

    for (let i = 0; i < week.length; i++) {
      let id = week[i].teamId;
      let risk = week[i].riskIs;
      let date = week[i].date;
      let hasId = teamWeeklyRisk.hasOwnProperty(id);

      if (!hasId) {
        teamWeeklyRisk = {
          ...teamWeeklyRisk,
          [id]: { date: [], weekRisk: [] },
        };
      }

      teamWeeklyRisk[id].date.push(date);
      teamWeeklyRisk[id].weekRisk.push(risk);
    }
  }
  log.info("riskCalculation|getPreviousNextWeekRisk", log.methodEnd);

  return teamWeeklyRisk;
}

async function getMonthlyRisk(teamId, monthStartDay, monthEndDay) {
  log.info("riskCalculation|getMonthlyRisk", log.methodStart);
  let start = new Date(monthStartDay);
  let end = new Date(monthEndDay);
  let monthDateArray = new Array();

  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    monthDateArray.push(new Date(d));
  }

  let monthlyRiskArray = new Array();
  for (let index = 0; index < monthDateArray.length; index++) {
    let monthlylyRisk = await getPreviousNextDayRisk(
      teamId.teamId,
      monthDateArray[index]
    );
    monthlyRiskArray.push(monthlylyRisk);
  }

  let teamMonthlyRisk = {};
  for (let index = 0; index < monthlyRiskArray.length; index++) {
    let week = monthlyRiskArray[index];

    for (let i = 0; i < week.length; i++) {
      let id = week[i].teamId;
      let risk = week[i].riskIs;
      let date = week[i].date;
      let hasId = teamMonthlyRisk.hasOwnProperty(id);

      if (!hasId) {
        teamMonthlyRisk = {
          ...teamMonthlyRisk,
          [id]: { date: [], monthRisk: [] },
        };
      }

      teamMonthlyRisk[id].date.push(date);
      teamMonthlyRisk[id].monthRisk.push(risk);
    }
  }
  log.info("riskCalculation|getMonthlyRisk", log.methodEnd);

  return teamMonthlyRisk;
}

async function getPrevNextMonthlyRisk(teamId, monthStartDay, monthEndDay) {
  log.info("riskCalculation|getPrevNextMonthlyRisk", log.methodStart);
  let start = new Date(monthStartDay);
  let end = new Date(monthEndDay);
  let monthDateArray = new Array();

  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    monthDateArray.push(new Date(d));
  }

  let monthlyRiskArray = new Array();
  for (let index = 0; index < monthDateArray.length; index++) {
    let monthlylyRisk = await getPreviousNextDayRisk(
      teamId,
      monthDateArray[index]
    );
    monthlyRiskArray.push(monthlylyRisk);
  }

  let teamMonthlyRisk = {};
  for (let index = 0; index < monthlyRiskArray.length; index++) {
    let week = monthlyRiskArray[index];

    for (let i = 0; i < week.length; i++) {
      let id = week[i].teamId;
      let risk = week[i].riskIs;
      let date = week[i].date;
      let hasId = teamMonthlyRisk.hasOwnProperty(id);

      if (!hasId) {
        teamMonthlyRisk = {
          ...teamMonthlyRisk,
          [id]: { date: [], monthRisk: [] },
        };
      }

      teamMonthlyRisk[id].date.push(date);
      teamMonthlyRisk[id].monthRisk.push(risk);
    }
  }
  log.info("riskCalculation|getPrevNextMonthlyRisk", log.methodEnd);

  return teamMonthlyRisk;
}

module.exports = {
  getDayRisk,
  getWeeklyRisk,
  getPreviousNextDayRisk,
  getPreviousNextWeekRisk,
  getMonthlyRisk,
  getPrevNextMonthlyRisk,
};
