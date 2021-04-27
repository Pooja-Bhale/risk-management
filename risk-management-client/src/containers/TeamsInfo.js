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
    let newTeamData = { ...teamData };
    for (let i = 0; i < allTeams.length; i++) {
      let id = allTeams[i].teamId;
      let name = allTeams[i].teamName;

      let hasId = newTeamData.hasOwnProperty(id);
      if (!hasId) {
        newTeamData = {
          ...newTeamData,
          [id]: {
            teamId: id,
            teamName: name,
            day: null,
            weekRisk: [null, null, null, null, null, null, null],
          },
        };
      } else {
        newTeamData = {
          ...newTeamData,
          [id]: {
            ...allTeams[i],
            ...newTeamData[id],
          },
        };
      }
    }
    return newTeamData;
  };

  useEffect(() => {
  }, [teamData]);

  useEffect(() => {
    const newTeamData = getUpdatedTeamData(allTeams, teamData);
  }, [allTeams]);

  let teamDataKeys = teamData ? Object.keys(teamData) : [];

  var getTeams = async () => {
    try {
      let response = await API.get("riskmanagement", "/team/getTeamInfo");
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
        let tempTeamDataMap = { ...teamData };
        for (let index = 0; index < dayRisk.length; index++) {
          let id = teamDataKeys[index];
          let risk = dayRisk[index].riskIs;
          tempTeamDataMap[id].day = risk;
        }
        setTeamData(tempTeamDataMap);
        let date = new Date()
        setDailyDate(date.toDateString());
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
    let tempRiskFor = riskForDay;
    let prevDate = new Date(riskForDay);
    prevDate.setDate(prevDate.getDate() - 1);
    setDailyDate(prevDate.toDateString());
    tempRiskFor = prevDate;
    setRiskForDay(tempRiskFor);
    let previousDate = prevDate.toISOString();
    try {
      await API.get(
        "riskmanagement",
        `/risk/getPreviousNextDayRisk/${previousDate}`
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

  var showNextDayRisk = async () => {
    let tempRiskFor = riskForDay;
    let nextDateObject = new Date(riskForDay);
    nextDateObject.setDate(nextDateObject.getDate() + 1);
    tempRiskFor = nextDateObject;
    setRiskForDay(tempRiskFor);
    setDailyDate(nextDateObject.toDateString());
    let nextDateString = nextDateObject.toISOString();
    try {
      await API.get(
        "riskmanagement",
        `/risk/getPreviousNextDayRisk/${nextDateString}`
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

  async function showWeeklyRisk(teamData) {
    try {
      await API.get("riskmanagement", "/risk/getWeeklyRisk").then(
        (response) => {
          setWeeklyRisk(response);
          let weeklyRiskKeys = Object.keys(response);
          let tempTeamDataMap = { ...teamData };
          for (let index = 0; index < weeklyRiskKeys.length; index++) {
            let id = weeklyRiskKeys[index];
            let risk = response[id].weekRisk;
            tempTeamDataMap[id].weekRisk = risk;
          }
          setTeamData(tempTeamDataMap);
          let startDay =
            date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
          let startDateOfWeek = new Date(date.setDate(startDay));

          let lastday = date.getDate() - (date.getDay() - 1) + 6;
          let endDateOfWeek = new Date(date.setDate(lastday));
          setStartDate(startDateOfWeek.toDateString());
          setEndDate(endDateOfWeek.toDateString());
          return tempTeamDataMap;
        }
      );
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
      let updatedTeamData = getUpdatedTeamData(allTeamsData, teamData);
      const updateDataWithDayRisk = await showTodayRiskWithoutState(
        updatedTeamData
      );
      updatedTeamData = getUpdatedTeamData(allTeamsData, updateDataWithDayRisk);
      const updateDataWithWeeklyRisk = await showWeeklyRiskWithoutState(
        updatedTeamData
      );
      updatedTeamData = getUpdatedTeamData(
        allTeamsData,
        updateDataWithWeeklyRisk
      );
      setTeamData(updatedTeamData);
    }
    initalData();
  }, []);

  var showPreviousWeekRisk = async () => {
    let tempRiskFor = riskForWeek;
    let startDate = tempRiskFor;
    let prevEndDate = new Date(startDate);
    prevEndDate.setDate(startDate.getDate() - 1);

    let prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevEndDate.getDate() - 6);

    tempRiskFor = prevStartDate;
    setRiskForWeek(tempRiskFor);

    let startDateOfWeek = prevStartDate.toISOString();
    let endDateOfWeek = prevEndDate.toISOString();

    setStartDate(prevStartDate.toDateString());
    setEndDate(prevEndDate.toDateString());

    try {
      await API.get(
        "riskmanagement",
        `/risk/getPreviousNextWeekRisk/${startDateOfWeek}/${endDateOfWeek}`
      ).then((response) => {
        let responseKeys = Object.keys(response);
        let tempTeamDataMap = { ...teamData };
        for (let index = 0; index < responseKeys.length; index++) {
          let id = responseKeys[index];
          let risk = response[id].weekRisk;
          tempTeamDataMap[id].weekRisk = risk;
        }
        setTeamData(tempTeamDataMap);
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  var showNextWeekRisk = async () => {
    let tempRiskFor = riskForWeek;
    let startDate = tempRiskFor;
    let nextStartDate = new Date(startDate);
    nextStartDate.setDate(startDate.getDate() + 7);

    let nextEndDate = new Date(nextStartDate);
    nextEndDate.setDate(nextStartDate.getDate() + 6);

    tempRiskFor = nextStartDate;
    setRiskForWeek(tempRiskFor);

    let startDateOfWeek = nextStartDate.toISOString();
    let endDateOfWeek = nextEndDate.toISOString();

    setStartDate(nextStartDate.toDateString());
    setEndDate(nextEndDate.toDateString());
    try {
      await API.get(
        "riskmanagement",
        `/risk/getPreviousNextWeekRisk/${startDateOfWeek}/${endDateOfWeek}`
      ).then((response) => {
        let responseKeys = Object.keys(response);
        let tempTeamDataMap = { ...teamData };
        for (let index = 0; index < responseKeys.length; index++) {
          let id = responseKeys[index];
          let risk = response[id].weekRisk;
          tempTeamDataMap[id].weekRisk = risk;
        }
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
            <a
              href={`/Calendar/${teamDataKeys[0]}`}
              className="btn btn-success float-right"
              Style="margin-top:30px; margin-bottom:30px; margin-right:10px;"
            >
              Month
            </a>

            <button
              Style="margin-top:30px; margin-bottom:30px; margin-right:10px;"
              className="btn btn-success float-right"
              onClick={() => {
                showWeeklyRisk(teamData);
              }}
            >
              Week
            </button>
            <button
              Style="margin-top:30px; margin-bottom:30px; margin-right:10px;"
              className="btn btn-success float-right"
              onClick={() => {
                showTodayRisk(teamData);
              }}
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
              <div className="float-left" Style="display: flex;">
                <FaIcons.FaChevronLeft
                  style={{
                    marginTop: "2px",
                    paddingRight: "8px",
                    fontSize: "larger",
                  }}
                  onClick={() => {
                    showPreviousDayRisk();
                  }}
                />
                <p id="todayRiskComp" Style="margin-top: 0px;">
                  {dailyDate}
                </p>
                <FaIcons.FaChevronRight
                  style={{
                    marginTop: "2px",
                    paddingLeft: "8px",
                    fontSize: "larger",
                  }}
                  onClick={() => {
                    showNextDayRisk();
                  }}
                />
              </div>
            </th>
            <th Style="display: flex;flex-direction: column;align-items: center;">
              <div Style="display: flex;">
                <FaIcons.FaChevronLeft
                  style={{
                    marginTop: "2px",
                    paddingRight: "8px",
                    fontSize: "larger",
                  }}
                  onClick={() => {
                    showPreviousWeekRisk();
                  }}
                />
                <p id="weeklyRiskComp" Style="margin-top: 0px;">
                  week ({startDate} - {endDate})
                </p>
                <FaIcons.FaChevronRight
                  style={{
                    marginTop: "2px",
                    paddingLeft: "8px",
                    fontSize: "larger",
                  }}
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
                  <a
                    href={"/TeamDetails/" + teamData[team].teamId}
                    Style="color:black"
                  >
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
