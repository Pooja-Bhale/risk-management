import React, { Fragment, useState, useEffect } from "react";
import API from "@aws-amplify/api";
// import "./TeamsInfo.css";

var TeamsInfo = () => {
  var [allTeams, setTeams] = useState([]);

  var getTeams = async () => {
    try {
      var response = await API.get("riskmanagement", "/team/getTeamName");
      console.log("res", response);
      setTeams(response);
    } catch (err) {
      console.error(err.message);
    }
  };
  console.log("teams name", allTeams);

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
            <button Style="margin-top:30px; margin-bottom:30px;"  className="btn btn-success float-right"> + Add Leave</button>
          </div>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Team Name</th>
            <th>
              <button className="btn btn-primary">Today</button>
            </th>
            <th>
              <button className="btn btn-primary">Weekly</button>
            </th>
            <th>View calendar</th>
          </tr>
        </thead>
        <tbody>
          {allTeams.map((team) => (
            <tr key={team.teamId}>
              <td>{team.teamName}</td>
              <td></td>
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
