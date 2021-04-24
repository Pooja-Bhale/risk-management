import React, { useState, useEffect } from "react";
import API from "@aws-amplify/api";
import * as FaIcons from "react-icons/fa";
import AddLeave from "./AddLeave";
import "./TeamsInfo";
var TeamsInfo = () => {
  let currentDate = new Date();
  let date = new Date();
  let startDay =
    date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
  let startDateOfWeek = new Date(date.setDate(startDay));

  var [allTeams, setTeams] = useState([]);
  var [dayRisk, setDayRisk] = useState([]);
  var [teamData, setTeamData] = useState({});
  var [weeklyRisk, setWeeklyRisk] = useState([]);
  var [riskForDay, setRiskForDay] = useState(currentDate);
  var [riskForWeek, setRiskForWeek] = useState(startDateOfWeek);

  console.log("riskForDay", riskForDay);
  // console.log("riskForWeek", riskForWeek)

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
  let teamDataKeys = Object.keys(teamData);

  var getTeams = async () => {
    console.log("getTeams");
    try {
      let response = await API.get("riskmanagement", "/team/getTeamInfo");
      setTeams(response);
    } catch (err) {
      console.error(err.message);
    }
  };

  var showTodayRisk = async () => {
    try {
      await API.get("riskmanagement", "/risk/getDayRisk").then((response) => {
        setDayRisk(response);
        console.log("res fffor today", response);
        let tempTeamDataMap = { ...teamData };
        for (let index = 0; index < dayRisk.length; index++) {
          let id = teamDataKeys[index];
          let risk = dayRisk[index].riskIs;
          tempTeamDataMap[id].day = risk;
        }
        setTeamData(tempTeamDataMap);
        console.log("teamData in today risk", teamData);
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  var showPreviousDayRisk = async () => {
    console.log("showPreviousDayRisk");
    let tempRiskFor = riskForDay;
    console.log("tempRiskFor", tempRiskFor);
    let prevDate = new Date(riskForDay);
    console.log("prevDate", prevDate);
    prevDate.setDate(prevDate.getDate() - 1);
    tempRiskFor = prevDate;
    console.log("tempRiskFor with prev date", tempRiskFor);
    setRiskForDay(tempRiskFor);
    console.log("riskForDay after set call", riskForDay);
    // let d = new Date(prevDate),
    //   month = "" + (d.getMonth() + 1),
    //   day = "" + d.getDate(),
    //   year = d.getFullYear();
    // if (month.length < 2) month = "0" + month;
    // if (day.length < 2) day = "0" + day;
    // let previousDate = [year, month, day].join("-");
    // console.log("formatted previousDate", previousDate)
    let previousDate = prevDate.toISOString();
    console.log("previousDate", previousDate);
    try {
      await API.get(
        "riskmanagement",
        `/risk/getPreviousNextDayRisk/${previousDate}`
      ).then((response) => {
        console.log("response for prev dday", response);
        let tempTeamDataMap = { ...teamData };
        for (let index = 0; index < response.length; index++) {
          let id = teamDataKeys[index];
          let risk = response[index].riskIs;
          tempTeamDataMap[id].day = risk;
        }
        setTeamData(tempTeamDataMap);
        console.log("teamdaata after setting in prev fun", teamData);
      });
    } catch (err) {
      console.error(err.message);
    }
  };
  var showNextDayRisk = async () => {
    console.log("showPreviousDayRisk");
    let tempRiskFor = riskForDay;
    console.log("tempRiskFor", tempRiskFor);
    let nexDate = new Date(riskForDay);
    console.log("prevDate", nexDate);
    nexDate.setDate(nexDate.getDate() + 1);
    tempRiskFor = nexDate;
    console.log("tempRiskFor with prev date", tempRiskFor);
    setRiskForDay(tempRiskFor);
    console.log("riskForDay after set call", riskForDay);
    let nextDate = nexDate.toISOString();
    console.log("previousDate", nextDate);
    try {
      await API.get(
        "riskmanagement",
        `/risk/getPreviousNextDayRisk/${nextDate}`
      ).then((response) => {
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
    getTeams();
    showTodayRisk();
    showWeeklyRisk();
  }, []);

  var showPreviousWeekRisk = async () => {
    console.log("showPreviousWeekRisk");
    let tempRiskFor = riskForWeek;
    console.log("tempRiskFor", tempRiskFor);
    let startDate = tempRiskFor;
    let prevEndDate = new Date(startDate);
    prevEndDate.setDate(startDate.getDate() - 1);
    console.log("prevEndDate", prevEndDate);

    let prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevEndDate.getDate() - 6);
    console.log("prevStartDate", prevStartDate);

    tempRiskFor = prevStartDate;
    setRiskForWeek(tempRiskFor);
    let startDateOfWeek = prevStartDate.toISOString();
    let endDateOfWeek = prevEndDate.toISOString();
    console.log("startDateOfWeek iso", startDateOfWeek);
    console.log("endDateOfWeek iso", endDateOfWeek);

    try {
      await API.get(
        "riskmanagement",
        `/risk/getPreviousNextWeekRisk/${startDateOfWeek}/${endDateOfWeek}`
      ).then((response) => {
        console.log("response", response);
        let responseKeys = Object.keys(response);
        console.log("responseKeys", responseKeys);
        let tempTeamDataMap = { ...teamData };
        console.log("tempTeamDataMap cloned", tempTeamDataMap);
        for (let index = 0; index < responseKeys.length; index++) {
          console.log("index is", index);
          // console.log("response[index].weekRisk", response[index].weekRisk)
          let id = responseKeys[index];
          console.log("id", id);
          let risk = response[id].weekRisk;
          console.log("risk", risk);
          tempTeamDataMap[id].weekRisk = risk;
        }
        setTeamData(tempTeamDataMap);
        console.log("tempTeamDataMap after setting", tempTeamDataMap);
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  var showNextWeekRisk = async () => {
    console.log("showNextWeekRisk");
    let tempRiskFor = riskForWeek;
    console.log("tempRiskFor", tempRiskFor);

    let startDate = tempRiskFor;
    let nextStartDate = new Date(startDate);
    nextStartDate.setDate(startDate.getDate() + 7);
    console.log("nextStartDate", nextStartDate);

    let nextEndDate = new Date(nextStartDate);
    nextEndDate.setDate(nextStartDate.getDate() + 6);
    console.log("nextEndDate", nextEndDate);
    tempRiskFor = nextStartDate;
    setRiskForWeek(tempRiskFor);
    let startDateOfWeek = nextStartDate.toISOString();
    let endDateOfWeek = nextEndDate.toISOString();
    console.log("startDateOfWeek", startDateOfWeek);
    console.log("endDateOfWeek", endDateOfWeek);
    try {
      await API.get(
        "riskmanagement",
        `/risk/getPreviousNextWeekRisk/${startDateOfWeek}/${endDateOfWeek}`
      ).then((response) => {
        console.log("response", response);
        let responseKeys = Object.keys(response);
        console.log("responseKeys", responseKeys);
        let tempTeamDataMap = { ...teamData };
        console.log("tempTeamDataMap cloned", tempTeamDataMap);
        for (let index = 0; index < responseKeys.length; index++) {
          console.log("index is", index);
          let id = responseKeys[index];
          console.log("id", id);
          let risk = response[id].weekRisk;
          console.log("risk", risk);
          tempTeamDataMap[id].weekRisk = risk;
        }
        setTeamData(tempTeamDataMap);
        console.log("tempTeamDataMap after setting", tempTeamDataMap);
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
            <a href={`/Calendar/${teamDataKeys[0]}`} className="btn btn-success float-right" Style="margin-top:30px; margin-bottom:30px; margin-right:10px;">Month</a>

            <button
              Style="margin-top:30px; margin-bottom:30px; margin-right:10px;"
              className="btn btn-success float-right"
              onClick={showWeeklyRisk}
            >
              Week
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
              <div className="float-left" Style="display: inline-block;">
                <FaIcons.FaChevronLeft
                  onClick={() => {
                    showPreviousDayRisk();
                  }}
                />{" "}
                <p id="todayRiskComp">Today</p>
                <FaIcons.FaChevronRight
                  onClick={() => {
                    showNextDayRisk();
                  }}
                />{" "}
              </div>
              <p Style="color: white;">no text</p>
            </th>
            <th>
              <FaIcons.FaChevronLeft
                onClick={() => {
                  showPreviousWeekRisk();
                }}
              />
              <p id="weeklyRiskComp" Style="margin-left: 50px;">
                {" "}
                week
              </p>
              <FaIcons.FaChevronRight
                onClick={() => {
                  showNextWeekRisk();
                }}
              />
              <p>| M | T | W | T | F | S | S |</p>
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
                    {teamData[team].day === true ? (
                      <FaIcons.FaSquare size={20} style={{ fill: "red" }} />
                    ) : (
                      <FaIcons.FaSquare size={20} style={{ fill: "green" }} />
                    )}
                  </div>
                </td>
                <td>
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
