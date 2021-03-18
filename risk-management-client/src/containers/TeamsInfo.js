import React, { Fragment, useState, useEffect } from "react";
import API from "@aws-amplify/api";
// import "./TeamsInfo.css";

var TeamsInfo = () => {
  var [allTeams, setTeams] = useState([]);
  var [dayRisk, setDayRisk] = useState([]);


  var getTeams = async () => {
    try {
      let response = await API.get("riskmanagement", "/team/getTeamInfo");
      setTeams(response);
    } catch (err) {
      console.error(err.message);
    }
    console.log(allTeams)
  };

   var showTodayRisk = async ()=> {
    var todayComp = document.getElementById("todayRiskComp");
    var weeklyComp = document.getElementById("weeklyRiskComp");

    if (todayComp.style.display === "none") {
      todayComp.style.display = "block";
      weeklyComp.style.display = "none";
    } else {
      todayComp.style.display = "none";
      weeklyComp.style.display = "none";
    }
    try {
      let response = await API.get("riskmanagement", "/risk/getDayRisk");
      setDayRisk(response);
    } catch (err) {
      console.error(err.message);
    }
    console.log(dayRisk)

  }

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
            <button
              Style="margin-top:30px; margin-bottom:30px;"
              className="btn btn-success float-right"
            >
              + Add Leave
            </button>

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
              <td>{team.teamName}</td>
              <td></td>
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
