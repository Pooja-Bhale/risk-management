import React, { Fragment, useState, useEffect } from "react";
import API from "@aws-amplify/api";
import { useParams } from "react-router";
import Button from "react-bootstrap/Button";
import "./TeamDetails.css";

var TeamDetails = () => {
  let { teamId } = useParams();
  var [teamDetail, setTeamDetail] = useState([]);
  const handleClose = () => {
    window.location = "/teamsInfo";
  };

  var getTeamDetails = async () => {
    try {
      let response = await API.get(
        "riskmanagement",
        `/team/getTeamDetails/${teamId}`
      );
      setTeamDetail(response);
    } catch (err) {
      console.error(err.message);
    }
  };
  let teamName = teamDetail.map(function (teamId) {
    return teamId["teamName"];
  });
  let teamThreshold = teamDetail.map(function (teamId) {
    return teamId["threshold"];
  });

  useEffect(() => {
    getTeamDetails();
  }, []);
  return (
    <Fragment>
      <h2>Team Details</h2>
      <hr />
      <div>
        <dl>
          <dt>Team Name</dt>
          <dd>{teamName[0]}</dd>
          <dt>Threshold</dt>
          <dd>{teamThreshold[0]}</dd>
          <dt>Team Member</dt>
          {teamDetail.map((team) => (
            <dd key={team.employeeId}>
              {team.firstName} {team.lastName}
            </dd>
          ))}
        </dl>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </div>
    </Fragment>
  );
};

export default TeamDetails;
