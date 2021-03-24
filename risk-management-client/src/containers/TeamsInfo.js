import React, { useState, useEffect } from "react";
import API from "@aws-amplify/api";
import * as FaIcons from "react-icons/fa";
import AddLeave from "./AddLeave";

var TeamsInfo = () => {
  var [allTeams, setTeams] = useState([]);
  var [dayRisk, setDayRisk] = useState([]);
  var [teamData, setTeamData] = useState({});
  var [weeklyRisk, setWeeklyRisk] = useState([]);
  var [riskFor, setRiskFor] = useState(new Map());

  for (let i = 0; i < allTeams.length; i++) {
    let id = allTeams[i].teamId;
    let name = allTeams[i].teamName;

    let hasId = teamData.hasOwnProperty(id);
    if (!hasId) {
      teamData = {
        ...teamData,
        [id]: { teamId: 0, teamName: "", day: null, weekRisk: [] },
      };
    }
    teamData[id].teamId = id;
    teamData[id].teamName = name;
  }

  let today = new Date();
  let date = new Date();

  let teamDataKeys = Object.keys(teamData);

  let startDay =
    date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
  let startDateOfWeek = new Date(date.setDate(startDay));

  for (var i = 0; i < allTeams.length; i++) {
    let id = allTeams[i].teamId;
    let hasId = riskFor.hasOwnProperty(id);
    if (!hasId) {
      riskFor = {
        ...riskFor,
        [id]: {
          teamId: 0,
          currentDate: today,
          startDateOfWeek: startDateOfWeek,
        },
      };
    }
    riskFor[id].teamId = id;
  }

  var getTeams = async () => {
    try {
      let response = await API.get("riskmanagement", "/team/getTeamInfo");
      setTeams(response);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getTeams();
  }, []);

  var showTodayRisk = async () => {
    var todayComp = document.getElementById("todayRiskComp");
    var weeklyComp = document.getElementById("weeklyRiskComp");
    // for (let index = 0; index < allTeams.length; index++) {
    //   var todayRiskData = "todayRiskDataComp" + allTeams[index].teamId;
    //   console.log("todayRiskData", todayRiskData)
    // }
    // var todayDataComp = document.getElementById(todayRiskData);

    if (
      todayComp.style.display === "none"
      //&& todayDataComp.style.display === "none"
    ) {
      todayComp.style.display = "block";
      // todayDataComp.style.display = "block";
      weeklyComp.style.display = "none";
    } else {
      todayComp.style.display = "none";
      // todayDataComp.style.display = "none";
      weeklyComp.style.display = "none";
    }
    //
    try {
      await API.get("riskmanagement", "/risk/getDayRisk").then((response) => {
        setDayRisk(response);
        let tempTeamDataMap = { ...teamData };
        for (let index = 0; index < dayRisk.length; index++) {
          let id = teamDataKeys[index];
          let risk = dayRisk[index].riskIs;
          tempTeamDataMap[id].day = risk;
        }
        setTeamData(tempTeamDataMap);
        console.log("tempTeamDataMap", tempTeamDataMap);
      });
    } catch (err) {
      console.error(err.message);
    }
  };
  useEffect(() => {
    showTodayRisk();
  }, []);

  var showPreviousDayRisk = async (teamId) => {
    console.log("insidde prev ffun");
    let tempRiskFor = { ...riskFor };
    let riskMap = tempRiskFor[teamId];
    let date = riskMap.currentDate;
    let prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    tempRiskFor[teamId].currentDate = prevDate;
    setRiskFor(tempRiskFor);
    console.log("prevDate", prevDate);
    let d = new Date(prevDate),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    let previousDate = [year, month, day].join("-");

    try {
      await API.get(
        "riskmanagement",
        `/risk/getPreviousNextDayRisk/${teamId}/${previousDate}`
      ).then((response) => {
        console.log("response", response);
        let tempTeamDataMap = { ...teamData };
        for (let index = 0; index < response.length; index++) {
          let risk = response[index].riskIs;
          tempTeamDataMap[teamId].day = risk;
        }
        setTeamData(tempTeamDataMap);
        console.log("after set team data", tempTeamDataMap);
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  var showNextDayRisk = async (teamId) => {
    console.log("insidde nexr ffun");
    let tempRiskFor = { ...riskFor };
    console.log("tempriskffor next fun", tempRiskFor);

    let riskMap = tempRiskFor[teamId];
    let date = riskMap.currentDate;
    let nexDate = new Date(date);
    nexDate.setDate(nexDate.getDate() + 1);
    tempRiskFor[teamId].currentDate = nexDate;
    setRiskFor(tempRiskFor);
    console.log("nexDate", nexDate);
    let d = new Date(nexDate),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    let nextDate = [year, month, day].join("-");

    try {
      await API.get(
        "riskmanagement",
        `/risk/getPreviousNextDayRisk/${teamId}/${nextDate}`
      ).then((response) => {
        console.log("next fun response", response);
        let tempTeamDataMap = { ...teamData };
        for (let index = 0; index < response.length; index++) {
          let risk = response[index].riskIs;
          tempTeamDataMap[teamId].day = risk;
        }
        setTeamData(tempTeamDataMap);
        console.log("after set team data next fun", tempTeamDataMap);
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  async function showWeeklyRisk() {
    var weeklyComp = document.getElementById("weeklyRiskComp");
    var todayComp = document.getElementById("todayRiskComp");

    if (weeklyComp.style.display === "none") {
      weeklyComp.style.display = "block";
      todayComp.style.display = "none";
    } else {
      weeklyComp.style.display = "none";
      todayComp.style.display = "none";
    }
    try {
      await API.get("riskmanagement", "/risk/getWeeklyRisk").then(
        (response) => {
          setWeeklyRisk(response);
          let weeklyRiskKeys = Object.keys(weeklyRisk);
          let tempTeamDataMap = { ...teamData };
          for (let index = 0; index < weeklyRiskKeys.length; index++) {
            let id = weeklyRiskKeys[index];
            let risk = weeklyRisk[id].weekRisk;
            tempTeamDataMap[id].weekRisk = risk;
          }
          setTeamData(tempTeamDataMap);
        }
      );
    } catch (err) {
      console.error(err.message);
    }
  }

  // useEffect(() => {
  //   showWeeklyRisk();
  // }, []);

  var showPreviousWeekRisk = async (teamId) => {
    console.log("inside prev week fun");
    let tempRiskFor = { ...riskFor };
    console.log("copy of risk for", tempRiskFor);

    let riskMap = tempRiskFor[teamId];
    let startDate = riskMap.startDateOfWeek;
    console.log("startDate", startDate)

    let prevEndDate = new Date(startDate);
    prevEndDate.setDate(startDate.getDate() - 1);
    console.log("prevEndDate is", prevEndDate);

    let prevStartDate =  new Date(prevEndDate);
    prevStartDate.setDate(prevEndDate.getDate() - 6);
    console.log("prevStartDate is", prevStartDate);

    tempRiskFor[teamId].startDateOfWeek = prevStartDate;
    setRiskFor(tempRiskFor);

    let startD = new Date(prevStartDate),
      prevStartMonth = "" + (startD.getMonth() + 1),
      prevStartDay = "" + startD.getDate(),
      prevStartYear = startD.getFullYear();
    if (prevStartMonth.length < 2) prevStartMonth = "0" + prevStartMonth;
    if (prevStartDay.length < 2) prevStartDay = "0" + prevStartDay;

    let startDateOfWeek = [prevStartYear, prevStartMonth, prevStartDay].join(
      "-"
    );

    console.log("formatted startDateOfWeek", startDateOfWeek)

    let endD = new Date(prevEndDate),
      prevEndMonth = "" + (endD.getMonth() + 1),
      prevEndDay = "" + endD.getDate(),
      prevEndYear = endD.getFullYear();
    if (prevEndMonth.length < 2) prevEndMonth = "0" + prevEndMonth;
    if (prevEndDay.length < 2) prevEndDay = "0" + prevEndDay;

    let endDateOfWeek = [prevEndYear, prevEndMonth, prevEndDay].join("-");
  console.log("formatted endDateOfWeek", endDateOfWeek)

  try {
    await API.get(
      "riskmanagement",
      `/risk/getPreviousNextWeekRisk/${teamId}/${startDateOfWeek}/${endDateOfWeek}`
    ).then((response) => {
      console.log("prev week fun response", response);
      let tempTeamDataMap = { ...teamData };
      for (let index = 0; index < response.length; index++) {
        let risk = response[index].weekRisk;
        tempTeamDataMap[teamId].weekRisk = risk;
      }
      setTeamData(tempTeamDataMap);
      console.log("after set team data prev week fun", tempTeamDataMap);
    });
  } catch (err) {
    console.error(err.message);
  }

  };


  return (
    <React.Fragment>
      <div class="container">
        <div class="row">
          <div class="col">
            <h4 Style="margin-top:30px; margin-bottom:30px; ">All Teams </h4>
          </div>
          <div class="col">
            <AddLeave />
            <button
              Style="margin-top:30px; margin-bottom:30px; margin-right:10px;"
              className="btn btn-success float-right"
              onClick={showWeeklyRisk}
            >
              Weekly
            </button>
            <button
              Style="margin-top:30px; margin-bottom:30px; margin-right:10px;"
              className="btn btn-success float-right"
              onClick={showTodayRisk}
            >
              Today
            </button>
          </div>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>
              <p>Team Name</p>
            </th>
            <th>
              <p id="todayRiskComp" Style="display:none;">
                Today
              </p>
              <p id="weeklyRiskComp" Style="display:none;">
                Weekly
              </p>
            </th>
            <th Style="margin-right:300px">tessthead</th>
            <th>
              <p>View calendar</p>
            </th>
          </tr>
        </thead>
        <tbody>
          {teamDataKeys.map((team) => {
            return (
              <tr key={team}>
                <td>
                  <a
                    href={"/TeamDetails/" + teamData[team].teamId}
                    Style="color:black"
                  >
                    {teamData[team].teamName}
                    {}
                  </a>
                </td>
                <td>
                  <div
                  // id={​​​​​​​​"todayRiskDataComp" + team.teamId}​​​​​​​​
                  >
                    {teamData[team].day === true ? (
                      <div>
                        <FaIcons.FaChevronLeft
                          onClick={() => {
                            showPreviousDayRisk(teamData[team].teamId);
                          }}
                        />{" "}
                        <FaIcons.FaSquare size={20} style={{ fill: "red" }} />
                        <FaIcons.FaChevronRight />{" "}
                      </div>
                    ) : (
                      <div>
                        <FaIcons.FaChevronLeft
                          onClick={() => {
                            showPreviousDayRisk(teamData[team].teamId);
                          }}
                        />{" "}
                        <FaIcons.FaSquare size={20} style={{ fill: "green" }} />{" "}
                        <FaIcons.FaChevronRight
                          onClick={() => {
                            showNextDayRisk(teamData[team].teamId);
                          }}
                        />{" "}
                      </div>
                    )}
                    ​​​​​​​​
                  </div>
                </td>
                <td>
                <div>
                  <FaIcons.FaChevronLeft
                    onClick={() => {
                      showPreviousWeekRisk(teamData[team].teamId);
                    }}
                  />{" "}
                  
                    {teamData[team].weekRisk.map((weekrisk) => {
                      // eslint-disable-next-line no-lone-blocks
                      return (
                        <div className="float-left ">
                          {weekrisk === true ? (
                            <FaIcons.FaSquare
                              size={20}
                              style={{ fill: "red" }}
                            />
                          ) : (
                            <FaIcons.FaSquare
                              size={20}
                              style={{ fill: "green" }}
                            />
                          )}
                          ​​​​​​​​
                        </div>
                      );
                    })}
                    ​​​​​​​​
                  </div>
                </td>
                <td>
                  <button className="btn btn-primary">Calendar</button>
                </td>
              </tr>
            );
          })}
          ​​​​​​​​
        </tbody>
      </table>
    </React.Fragment>
  );
};

export default TeamsInfo;
