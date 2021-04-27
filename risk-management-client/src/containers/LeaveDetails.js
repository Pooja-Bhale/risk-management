import React, { Fragment, useState, useEffect } from "react";
import API from "@aws-amplify/api";
import { useParams } from "react-router";
import Button from "react-bootstrap/Button";
import "./LeaveDetails.css";



var LeaveDetails = () => {
  let { teamId, date } = useParams();

    var [employeeLeaveDetail, setEmployeeLeaveDetail] = useState([]);
    const handleClose = () => {
      window.history.back();
    };

    var getLeaveDetails = async () => {
      try {
        let response = await API.get("riskmanagement", `/leave/getLeaveDetails/${teamId}/${date}`);
        setEmployeeLeaveDetail(response);
      } catch (err) {
        console.error(err.message);
      }
    };
   console.log("leaveDetail", employeeLeaveDetail)
    

    useEffect(() => {
      getLeaveDetails();
    }, []);
  return (
    <Fragment>
      <h2>Leave Details</h2>
      <hr />
      <div className="leaveDetails">
        <dl>
          <dt>Date</dt>
          <dd>{date}</dd>
          <dt>Employee on Leave</dt>
          {employeeLeaveDetail.map((employee) => (
          <dd key={employee.employeeId}>{employee.firstName} {employee.lastName}</dd>
          ))}
         
        </dl>
        <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
      </div>
    </Fragment>
  );
};

export default LeaveDetails;
