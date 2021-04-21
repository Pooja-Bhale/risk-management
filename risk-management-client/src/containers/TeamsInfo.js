import React, { useState, useEffect } from "react";
import API from "@aws-amplify/api";
import * as FaIcons from "react-icons/fa";
import AddLeave from "./AddLeave";
import "./TeamsInfo";

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
        [id]: {
          teamId: 0,
          teamName: "",
          day: null,
          weekRisk: [null, null, null, null, null, null, null],
        },
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
      });
    } catch (err) {
      console.error(err.message);
    }
  };
  useEffect(() => {
    showTodayRisk();
  }, []);

  var showPreviousDayRisk = async (teamId) => {
    let tempRiskFor = { ...riskFor };
    let riskMap = tempRiskFor[teamId];
    let date = riskMap.currentDate;
    let prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    tempRiskFor[teamId].currentDate = prevDate;
    setRiskFor(tempRiskFor);
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
        let tempTeamDataMap = { ...teamData };
        for (let index = 0; index < response.length; index++) {
          let risk = response[index].riskIs;
          tempTeamDataMap[teamId].day = risk;
        }
        setTeamData(tempTeamDataMap);
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  var showNextDayRisk = async (teamId) => {
    let tempRiskFor = { ...riskFor };
    let riskMap = tempRiskFor[teamId];
    let date = riskMap.currentDate;
    let nexDate = new Date(date);
    nexDate.setDate(nexDate.getDate() + 1);
    tempRiskFor[teamId].currentDate = nexDate;
    setRiskFor(tempRiskFor);
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
        let tempTeamDataMap = { ...teamData };
        for (let index = 0; index < response.length; index++) {
          let risk = response[index].riskIs;
          tempTeamDataMap[teamId].day = risk;
        }
        setTeamData(tempTeamDataMap);
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  async function showWeeklyRisk() {
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

  useEffect(() => {
    showWeeklyRisk();
  }, []);

  var showPreviousWeekRisk = async (teamId) => {
    let tempRiskFor = { ...riskFor };
    let riskMap = tempRiskFor[teamId];
    let startDate = riskMap.startDateOfWeek;

    let prevEndDate = new Date(startDate);
    prevEndDate.setDate(startDate.getDate() - 1);

    let prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevEndDate.getDate() - 6);

    tempRiskFor[teamId].startDateOfWeek = prevStartDate;
    setRiskFor(tempRiskFor);

    let startDateOfWeek = prevStartDate.toISOString();
    let endDateOfWeek = prevEndDate.toISOString();

    try {
      await API.get(
        "riskmanagement",
        `/risk/getPreviousNextWeekRisk/${teamId}/${startDateOfWeek}/${endDateOfWeek}`
      ).then((response) => {
        let tempTeamDataMap = { ...teamData };
        let risk = response[teamId].weekRisk;
        tempTeamDataMap[teamId].weekRisk = risk;
        setTeamData(tempTeamDataMap);
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  var showNextWeekRisk = async (teamId) => {
    let tempRiskFor = { ...riskFor };
    let riskMap = tempRiskFor[teamId];
    let startDate = riskMap.startDateOfWeek;

    let nextStartDate = new Date(startDate);
    nextStartDate.setDate(startDate.getDate() + 7);

    let nextEndDate = new Date(nextStartDate);
    nextEndDate.setDate(nextStartDate.getDate() + 6);

    tempRiskFor[teamId].startDateOfWeek = nextStartDate;
    setRiskFor(tempRiskFor);

    let startDateOfWeek = nextStartDate.toISOString();
    let endDateOfWeek = nextEndDate.toISOString();

    try {
      await API.get(
        "riskmanagement",
        `/risk/getPreviousNextWeekRisk/${teamId}/${startDateOfWeek}/${endDateOfWeek}`
      ).then((response) => {
        let tempTeamDataMap = { ...teamData };
        let risk = response[teamId].weekRisk;
        tempTeamDataMap[teamId].weekRisk = risk;
        setTeamData(tempTeamDataMap);
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
              This week
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
              <p Style="color: white;">no text</p>
            </th>
            <th>
              <p id="todayRiskComp">Today</p>
              <p Style="color: white;">no text</p>
            </th>
            <th>
              <p id="weeklyRiskComp" Style="margin-left: 50px;">This week</p>
              <p>| M | T | W | T | F | S | S |</p>
            </th>
            <th>
              <p>View calendar</p>
              <p Style="color: white;">no text</p>
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
                  <div id="todayRiskDataComp">
                    <FaIcons.FaChevronLeft
                      onClick={() => {
                        showPreviousDayRisk(teamData[team].teamId);
                      }}
                    />{" "}
                    {teamData[team].day === true ? (
                      <FaIcons.FaSquare size={20} style={{ fill: "red" }} />
                    ) : (
                      <FaIcons.FaSquare size={20} style={{ fill: "green" }} />
                    )}
                    <FaIcons.FaChevronRight
                      onClick={() => {
                        showNextDayRisk(teamData[team].teamId);
                      }}
                    />{" "}
                  </div>
                </td>
                <td>
                  <div>
                    <div Style="display: inline-block;">
                    <FaIcons.FaChevronLeft
                      onClick={() => {
                        showPreviousWeekRisk(teamData[team].teamId);
                      }}
                    />
                    </div>
                    <div Style="display: inline-block;">
                      {teamData[team].weekRisk.map((weekrisk) => {
                        // eslint-disable-next-line no-lone-blocks
                        return (
                          <div Style="display: inline-block;">
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
                          </div>
                        );
                      })}
                    </div>
                    <div Style="display: inline-block;">
                    <FaIcons.FaChevronRight
                      onClick={() => {
                        showNextWeekRisk(teamData[team].teamId);
                      }}
                    />
                    </div>
                  </div>
                </td>
                <td>
                  <a href={`/Calendar/${teamData[team].teamId}`} className="btn btn-primary">Calendar</a>
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