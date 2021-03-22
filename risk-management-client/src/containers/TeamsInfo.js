import React, { Fragment, useState, useEffect } from "react";
import API from "@aws-amplify/api";
import * as FaIcons from "react-icons/fa";
import AddLeave from "./AddLeave"

// import TeamDetails from "./TeamDetails";

var TeamsInfo = () => {
  var [allTeams, setTeams] = useState([]);
  var [dayRisk, setDayRisk] = useState([]);
  // var [weeklyRisk, setWeeklyRisk] = useState([]);
  // var [teamDetail, setTeamDetail] = useState([]);

  console.log("initial allTeams", allTeams)

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
      let response = await API.get("riskmanagement", "/risk/getDayRisk");
      setDayRisk(response);

      let teamsDataWithRisk = new Map();
      for (let index = 0; index < allTeams.length; index++) {
        let dayCount = { dayCount: 0 };
        let allTeamsDayRisk = Object.assign(allTeams[index], dayRisk[index], dayCount);
        teamsDataWithRisk.set(allTeams[index].teamId, allTeamsDayRisk);
      }
      console.log("after today allTeams", allTeams)

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
    // try {
    //   // let response = await API.get("riskmanagement", "/risk/getWeeklyRisk");
    //   // setWeeklyRisk(response);

    //   // let teamsDataWithRisk = new Map();
    //   // for (let index = 0; index < allTeams.length; index++) {
    //   //   let dayCount = { dayCount: 0 };
    //   //   let allTeamsWeeklyRisk = Object.assign(allTeams[index], weeklyRisk.weeklyRisk[index], dayCount);
    //   //   teamsDataWithRisk.set(allTeams[index].teamId, allTeamsWeeklyRisk);
    //   // }
    //   // console.log("after weekly allTeams", allTeams)

    // } catch (err) {
    //   console.error(err.message);
    // }
  }

  useEffect(() => {
    getTeams();
  }, []);

  return (
    <Fragment>
      <div class="container">
        <div class="row">
          <div class="col">
            <h4 Style="margin-top:30px; margin-bottom:30px; ">All Teams </h4>
          </div>
          <div class="col">
            <AddLeave />
            {/* <button
              Style="margin-top:30px; margin-bottom:30px;"
              className="btn btn-success float-right"
            >
              + Add Leave
            </button> */}

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
            <th>
              <p>View calendar</p>
            </th>
          </tr>
        </thead>
        <tbody>
          {allTeams.map((team) => (
            <tr key={team.teamId}>
              <td >
                <a href={'/TeamDetails/'+team.teamId} Style="color:black">{team.teamName}</a>
              </td>
              <td>
                <div
                  // id={"todayRiskDataComp" + team.teamId}
                  // Style="display:none;"
                >
                  {team.riskIs ? (
                    <FaIcons.FaSquare size={20} style={{ fill: "red" }} />
                  ) : (
                    <FaIcons.FaSquare size={20} style={{ fill: "green" }} />
                  )}
                </div>
              </td>
              <td>
                <button className="btn btn-primary">Calendar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Fragment>
  );
};

export default TeamsInfo;
