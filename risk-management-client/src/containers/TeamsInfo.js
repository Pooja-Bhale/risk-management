import React, { useState, useEffect } from "react";
import API from "@aws-amplify/api";
import * as FaIcons from "react-icons/fa";
import AddLeave from "./AddLeave";

// import TeamDetails from "./TeamDetails";

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

  // let riskFor = new Map();
  let today = new Date();
  let date = new Date();

  let teamDataKeys = Object.keys(teamData);

  let startDay =
    date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
  let startDateOfWeek = new Date(date.setDate(startDay));

  let lastday = date.getDate() - (date.getDay() - 1) + 6;
  let endDateOfWeek = new Date(date.setDate(lastday));

  for (var i = 0; i < allTeams.length; i++) {
    let id = allTeams[i].teamId;
    let value = {
      teamId: id,
      daycount: 0,
      weekCount: 0,
      currentDate: today,
      startDateOfWeek: startDateOfWeek,
      endDateOfWeek: endDateOfWeek,
    };

    riskFor.set(id, value);
  }

  var getTeams = async () => {
    try {
      let response = await API.get("riskmanagement", "/team/getTeamInfo");
      setTeams(response);
    } catch (err) {
      console.error(err.message);
    }
  };

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
    try {
      await API.get("riskmanagement", "/risk/getDayRisk").then((response) => {
        setDayRisk(response);
        for (let index = 0; index < dayRisk.length; index++) {
          let id = teamDataKeys[index];
          let risk = dayRisk[index].riskIs;
          teamData[id].day = risk;
          setTeamData(teamData);
          console.log(teamData)
        }
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  var showPreviousDayRisk = async (teamId) => {
    let riskMap = riskFor.get(teamId);
    let dayCount = riskMap.daycount - 1;
    riskFor.get(teamId).daycount = dayCount;
    setRiskFor(riskFor);
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

          for (let index = 0; index < weeklyRiskKeys.length; index++) {
            let id = weeklyRiskKeys[index];
            let risk = weeklyRisk[id].weekRisk;
            teamData[id].weekRisk = risk;
            setTeamData(teamData);
          }
        }
      );
    } catch (err) {
      console.error(err.message);
    }
  }

  useEffect(() => {
    getTeams();
  }, []);

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
                        <FaIcons.FaChevronRight />{" "}
                      </div>
                    )}
                    ​​​​​​​​
                  </div>
                </td>
                <td>
                  <div Style="margin-right:300px">
                    {teamData[team].weekRisk.map((weekrisk) => {
                      // eslint-disable-next-line no-lone-blocks
                      return (
                        <div className="float-right">
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
