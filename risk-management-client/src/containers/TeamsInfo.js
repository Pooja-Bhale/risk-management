import React, { useState, useEffect } from "react";
import API from "@aws-amplify/api";
import * as FaIcons from "react-icons/fa";
import AddLeave from "./AddLeave";
import "./TeamsInfo";
var TeamsInfo = () => {
  let currentDate = new Date();
  let date = new Date();
  let startDay = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
  let startDateOfWeek = new Date(date.setDate(startDay));

  let lastday = date.getDate() - (date.getDay() - 1) + 6;
  let endDateOfWeek = new Date(date.setDate(lastday));

  var [allTeams, setTeams] = useState([]);
  var [dayRisk, setDayRisk] = useState([]);
  var [teamData, setTeamData] = useState({});
  var [weeklyRisk, setWeeklyRisk] = useState([]);
  var [riskForDay, setRiskForDay] = useState(currentDate);
  var [riskForWeek, setRiskForWeek] = useState(startDateOfWeek);
  var [dailyDate, setDailyDate] = useState(new Date().toDateString());
  var [startDate, setStartDate] = useState(startDateOfWeek.toDateString());
  var [endDate, setEndDate] = useState(endDateOfWeek.toDateString());

  const getUpdatedTeamData = (allTeams, teamData = {}) => {
    console.log("getUpdatedTeamData input ", { allTeams, teamData });
    let newTeamData = { ...teamData };
    for (let i = 0; i < allTeams.length; i++) {
      let id = allTeams[i].teamId;
      console.log("getUpdatedTeamData id ", id);

      let name = allTeams[i].teamName;

      let hasId = newTeamData.hasOwnProperty(id);
      console.log("getUpdatedTeamData allTeam ", allTeams[i]);
      console.log("getUpdatedTeamData newTeamData ", newTeamData[id]);
      console.log("getUpdatedTeamData hasId ", hasId);
      if (!hasId) {
        newTeamData = {
          ...newTeamData,
          [id]: {
            teamId: id,
            teamName: name,
            day: null,
            weekRisk: [null, null, null, null, null, null, null]
          }
        };
      } else {
        newTeamData = {
          ...newTeamData,
          [id]: {
            ...allTeams[i],
            ...newTeamData[id]
          }
        };
      }
    }
    console.log("getUpdatedTeamData out ", newTeamData);
    return newTeamData;
  };

  useEffect(() => {
    console.log("teamData called ", teamData);
  }, [teamData]);

  useEffect(() => {
    const newTeamData = getUpdatedTeamData(allTeams, teamData);
    // setTeamData(newTeamData);
  }, [allTeams]);

  let teamDataKeys = teamData ? Object.keys(teamData) : [];

  var getTeams = async () => {
    //console.log("getTeams");
    try {
      let response = await API.get("riskmanagement", "/team/getTeamInfo");
      console.log("allTeams ", response);
      setTeams(response);
      return response;
    } catch (err) {
      console.error(err.message);
    }
  };

  var showTodayRisk = async (teamData) => {
    try {
      await API.get("riskmanagement", "/risk/getDayRisk").then((response) => {
        setDayRisk(response);
        //console.log("res fffor today", response);
        let tempTeamDataMap = { ...teamData };
        for (let index = 0; index < response.length; index++) {
          let id = response[index];
          let risk = response[index].riskIs;
          tempTeamDataMap[id].day = risk;
        }
        setTeamData(tempTeamDataMap);
        //console.log("teamData in today risk", teamData);
        return tempTeamDataMap;
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  var showTodayRiskWithoutState = async (teamData) => {
    try {
      const response = await API.get("riskmanagement", "/risk/getDayRisk");
      setDayRisk(response);
      let tempTeamDataMap = { ...teamData };
      for (let index = 0; index < response.length; index++) {
        let id = response[index].teamId;
        let risk = response[index].riskIs;
        tempTeamDataMap[id].day = risk;
      }
      return tempTeamDataMap;
    } catch (err) {
      console.error(err.message);
    }
  };

  var showPreviousDayRisk = async () => {
    //console.log("showPreviousDayRisk");
    let tempRiskFor = riskForDay;
    //console.log("tempRiskFor", tempRiskFor);
    let prevDate = new Date(riskForDay);
    //console.log("prevDate", prevDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setDailyDate(prevDate.toDateString());
    tempRiskFor = prevDate;
    //console.log("tempRiskFor with prev date", tempRiskFor);
    setRiskForDay(tempRiskFor);
    //console.log("riskForDay after set call", riskForDay);
    // let d = new Date(prevDate),
    //   month = "" + (d.getMonth() + 1),
    //   day = "" + d.getDate(),
    //   year = d.getFullYear();
    // if (month.length < 2) month = "0" + month;
    // if (day.length < 2) day = "0" + day;
    // let previousDate = [year, month, day].join("-");
    // console.log("formatted previousDate", previousDate)
    let previousDate = prevDate.toISOString();
    //console.log("previousDate", previousDate);
    try {
      await API.get("riskmanagement", `/risk/getPreviousNextDayRisk/${previousDate}`).then((response) => {
        //console.log("response for prev dday", response);
        let tempTeamDataMap = { ...teamData };
        for (let index = 0; index < response.length; index++) {
          let id = teamDataKeys[index];
          let risk = response[index].riskIs;
          tempTeamDataMap[id].day = risk;
        }
        setTeamData(tempTeamDataMap);
        //console.log("teamdaata after setting in prev fun", teamData);
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  var showNextDayRisk = async () => {
    //console.log("showPreviousDayRisk");
    let tempRiskFor = riskForDay;
    //console.log("tempRiskFor", tempRiskFor);
    let nextDateObject = new Date(riskForDay);
    //console.log("prevDate", nexDate);
    nextDateObject.setDate(nextDateObject.getDate() + 1);
    tempRiskFor = nextDateObject;
    //console.log("tempRiskFor with prev date", tempRiskFor);
    setRiskForDay(tempRiskFor);
    //console.log("riskForDay after set call", riskForDay);
    setDailyDate(nextDateObject.toDateString());
    let nextDateString = nextDateObject.toISOString();
    //console.log("previousDate", nextDate);
    try {
      await API.get("riskmanagement", `/risk/getPreviousNextDayRisk/${nextDateString}`).then((response) => {
        let tempTeamDataMap = { ...teamData };
        for (let index = 0; index < response.length; index++) {
          let id = teamDataKeys[index];
          let risk = response[index].riskIs;
          tempTeamDataMap[id].day = risk;
        }
        setTeamData(tempTeamDataMap);
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  async function showWeeklyRisk(teamData) {
    try {
      await API.get("riskmanagement", "/risk/getWeeklyRisk").then((response) => {
        setWeeklyRisk(response);
        let weeklyRiskKeys = Object.keys(response);
        let tempTeamDataMap = { ...teamData };
        for (let index = 0; index < weeklyRiskKeys.length; index++) {
          let id = weeklyRiskKeys[index];
          let risk = response[id].weekRisk;
          tempTeamDataMap[id].weekRisk = risk;
        }
        setTeamData(tempTeamDataMap);
        return tempTeamDataMap;
      });
    } catch (err) {
      console.error(err.message);
    }
  }

  async function showWeeklyRiskWithoutState(teamData) {
    try {
      const response = await API.get("riskmanagement", "/risk/getWeeklyRisk");
      setWeeklyRisk(response);
      let weeklyRiskKeys = Object.keys(response);
      let tempTeamDataMap = { ...teamData };
      for (let index = 0; index < weeklyRiskKeys.length; index++) {
        let id = parseInt(weeklyRiskKeys[index]);
        let risk = response[id].weekRisk;
        tempTeamDataMap[id].weekRisk = risk;
      }
      return tempTeamDataMap;
    } catch (err) {
      console.error(err.message);
    }
  }

  useEffect(() => {
    async function initalData() {
      const allTeamsData = await getTeams();
      console.log("allTeamsData 11 ", allTeamsData);
      let updatedTeamData = getUpdatedTeamData(allTeamsData, teamData);
      console.log("updatedTeamData 1", updatedTeamData);
      const updateDataWithDayRisk = await showTodayRiskWithoutState(updatedTeamData);
      console.log("updateDataWithDayRisk ", updateDataWithDayRisk);
      updatedTeamData = getUpdatedTeamData(allTeamsData, updateDataWithDayRisk);
      console.log("updatedTeamData 2", updatedTeamData);
      const updateDataWithWeeklyRisk = await showWeeklyRiskWithoutState(updatedTeamData);
      console.log("updateDataWithWeeklyRisk ", updateDataWithWeeklyRisk);
      updatedTeamData = getUpdatedTeamData(allTeamsData, updateDataWithWeeklyRisk);
      console.log("updatedTeamData 3 ", updatedTeamData);
      setTeamData(updatedTeamData);
    }
    initalData();
  }, []);

  var showPreviousWeekRisk = async () => {
    //console.log("showPreviousWeekRisk");
    let tempRiskFor = riskForWeek;
    //console.log("tempRiskFor", tempRiskFor);
    let startDate = tempRiskFor;
    let prevEndDate = new Date(startDate);
    prevEndDate.setDate(startDate.getDate() - 1);
    //console.log("prevEndDate", prevEndDate);

    let prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevEndDate.getDate() - 6);
    //console.log("prevStartDate", prevStartDate);

    tempRiskFor = prevStartDate;
    setRiskForWeek(tempRiskFor);
    let startDateOfWeek = prevStartDate.toISOString();
    let endDateOfWeek = prevEndDate.toISOString();

    setStartDate(prevStartDate.toDateString());
    setEndDate(prevEndDate.toDateString());
    //console.log("startDateOfWeek iso", startDateOfWeek);
    //console.log("endDateOfWeek iso", endDateOfWeek);

    try {
      await API.get("riskmanagement", `/risk/getPreviousNextWeekRisk/${startDateOfWeek}/${endDateOfWeek}`).then((response) => {
        //console.log("response", response);
        let responseKeys = Object.keys(response);
        //console.log("responseKeys", responseKeys);
        let tempTeamDataMap = { ...teamData };
        //console.log("tempTeamDataMap cloned", tempTeamDataMap);
        for (let index = 0; index < responseKeys.length; index++) {
          //console.log("index is", index);
          // //console.log("response[index].weekRisk", response[index].weekRisk)
          let id = responseKeys[index];
          //console.log("id", id);
          let risk = response[id].weekRisk;
          //console.log("risk", risk);
          tempTeamDataMap[id].weekRisk = risk;
        }
        setTeamData(tempTeamDataMap);
        //console.log("tempTeamDataMap after setting", tempTeamDataMap);
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  var showNextWeekRisk = async () => {
    //console.log("showNextWeekRisk");
    let tempRiskFor = riskForWeek;
    //console.log("tempRiskFor", tempRiskFor);

    let startDate = tempRiskFor;
    let nextStartDate = new Date(startDate);
    nextStartDate.setDate(startDate.getDate() + 7);
    //console.log("nextStartDate", nextStartDate);

    let nextEndDate = new Date(nextStartDate);
    nextEndDate.setDate(nextStartDate.getDate() + 6);
    //console.log("nextEndDate", nextEndDate);
    tempRiskFor = nextStartDate;
    setRiskForWeek(tempRiskFor);
    let startDateOfWeek = nextStartDate.toISOString();
    let endDateOfWeek = nextEndDate.toISOString();

    setStartDate(nextStartDate.toDateString());
    setEndDate(nextEndDate.toDateString());
    //console.log("startDateOfWeek", startDateOfWeek);
    //console.log("endDateOfWeek", endDateOfWeek);
    try {
      await API.get("riskmanagement", `/risk/getPreviousNextWeekRisk/${startDateOfWeek}/${endDateOfWeek}`).then((response) => {
        //console.log("response", response);
        let responseKeys = Object.keys(response);
        //console.log("responseKeys", responseKeys);
        let tempTeamDataMap = { ...teamData };
        //console.log("tempTeamDataMap cloned", tempTeamDataMap);
        for (let index = 0; index < responseKeys.length; index++) {
          //console.log("index is", index);
          let id = responseKeys[index];
          //console.log("id", id);
          let risk = response[id].weekRisk;
          //console.log("risk", risk);
          tempTeamDataMap[id].weekRisk = risk;
        }
        setTeamData(tempTeamDataMap);
        //console.log("tempTeamDataMap after setting", tempTeamDataMap);
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  console.log("teamData rendered  ", teamData);
  console.log("teamDataKeys rendered  ", teamDataKeys);
  return (
    <React.Fragment>
      <div class="container">
        <div class="row">
          <div class="col">
            <h4 Style="margin-top:30px; margin-bottom:30px; ">All Teams </h4>
          </div>
          <div class="col">
            <AddLeave />
            <a
              href={`/Calendar/${teamDataKeys[0]}`}
              className="btn btn-success float-right"
              Style="margin-top:30px; margin-bottom:30px; margin-right:10px;">
              Month
            </a>

            <button
              Style="margin-top:30px; margin-bottom:30px; margin-right:10px;"
              className="btn btn-success float-right"
              onClick={() => {
                showWeeklyRisk(teamData);
              }}>
              Week
            </button>
            <button
              Style="margin-top:30px; margin-bottom:30px; margin-right:10px;"
              className="btn btn-success float-right"
              onClick={() => {
                showTodayRisk(teamData);
              }}>
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
              <div className="float-left" Style="display: flex;">
                <FaIcons.FaChevronLeft
                  style={{ marginTop: "2px", paddingRight: "8px", fontSize: "larger" }}
                  // Style="margin-top: 2px;padding-right: 8px;font-size: larger;"
                  onClick={() => {
                    showPreviousDayRisk();
                  }}
                />
                <p id="todayRiskComp" Style="margin-top: 0px;">
                  {dailyDate}
                  {/* Today */}
                </p>
                <FaIcons.FaChevronRight
                  style={{ marginTop: "2px", paddingLeft: "8px", fontSize: "larger" }}
                  // Style="margin-top: 2px;padding-left: 8px;font-size: larger;"
                  onClick={() => {
                    showNextDayRisk();
                  }}
                />
              </div>
            </th>
            <th Style="display: flex;flex-direction: column;align-items: center;">
              <div Style="display: flex;">
                <FaIcons.FaChevronLeft
                  style={{ marginTop: "2px", paddingRight: "8px", fontSize: "larger" }}
                  onClick={() => {
                    showPreviousWeekRisk();
                  }}
                />
                <p id="weeklyRiskComp" Style="margin-top: 0px;">
                  week ({startDate} - {endDate})
                </p>
                <FaIcons.FaChevronRight
                  style={{ marginTop: "2px", paddingLeft: "8px", fontSize: "larger" }}
                  onClick={() => {
                    showNextWeekRisk();
                  }}
                />
              </div>
              <p>| M | T | W | T | F | S | S |</p>
            </th>
          </tr>
        </thead>
        <tbody>
          {teamDataKeys.map((team) => {
            return (
              <tr key={team}>
                <td Style="display: flex;align-items: center;">
                  <a href={"/TeamDetails/" + teamData[team].teamId} Style="color:black">
                    {teamData[team].teamName}
                  </a>
                </td>
                <td>
                  <div id="todayRiskDataComp">
                    {teamData[team].day === true ? (
                      <FaIcons.FaSquare size={20} style={{ fill: "red" }} />
                    ) : (
                      <FaIcons.FaSquare size={20} style={{ fill: "green" }} />
                    )}
                  </div>
                </td>
                <td>
                  <div Style="display: flex;justify-content: center;">
                    {teamData[team] &&
                      teamData[team].weekRisk &&
                      teamData[team].weekRisk.map((weekrisk) => {
                        // eslint-disable-next-line no-lone-blocks
                        return (
                          <div Style="display: inline-block;">
                            {weekrisk === true ? (
                              <FaIcons.FaSquare size={20} style={{ fill: "red" }} />
                            ) : (
                              <FaIcons.FaSquare size={20} style={{ fill: "green" }} />
                            )}
                          </div>
                        );
                      })}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </React.Fragment>
  );
};
export default TeamsInfo;
