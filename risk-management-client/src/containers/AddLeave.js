import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useFormFields } from "../libs/hooksLib";
import Form from "react-bootstrap/Form";
import API from "@aws-amplify/api";
import LoaderButton from "../components/LoaderButton";
import Select from "react-select";

const AddLeave = () => {
  var [show, setShow] = useState(false);
  var [isLoading, setIsLoading] = useState(false);
  var [teamMember, setTeamMember] = useState([]);
  var [fields, handleFieldChange] = useFormFields({
    startDate: "",
    endDate: "",
  });

  var [employeeId, setEmployeeId] = useState()
  var handleClose = () => setShow(false);
  var handleShow = () => setShow(true);

  useEffect(() => {
    var getTeamMember = async () => {
      try {
        let response = await API.get("riskmanagement", "/team/getTeamMember");
        setTeamMember(response);
      } catch (err) {
        console.error(err.message);
      }
    };

    if (show) {
      getTeamMember();
    }
  }, [show]);

  var handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const body = {
        employeeId: employeeId,
        startDate: fields.startDate,
        endDate: fields.endDate === "" ? fields.startDate : fields.endDate,
      };
      let response = await API.post("riskmanagement", "/leave/addLeave", {
        body: body,
      });
      console.log(response);
      window.location = "/teamsInfo";
    } catch (err) {
      console.error(err.message);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        onClick={handleShow}
        Style="margin-top:30px; margin-bottom:30px;"
        className="btn btn-success float-right"
      >
        + Add Leave
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="employeeId" size="lg">
              <Form.Label>Employee Name *</Form.Label>
              <Select
                value={teamMember.label}
                onChange={(option) => setEmployeeId(option.value) }
                options={teamMember}
              />
            </Form.Group>

            <Form.Group controlId="startDate" size="lg">
              <Form.Label>Start Date *</Form.Label>
              <Form.Control
                type="date"
                value={fields.startDate}
                onChange={handleFieldChange}
              />
            </Form.Group>
            <Form.Group controlId="endDate" size="lg">
              <Form.Label>End Date </Form.Label>
              <Form.Control
                type="date"
                value={fields.endDate}
                onChange={handleFieldChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <LoaderButton
            type="submit"
            isLoading={isLoading}
            onClick={(e) => handleSubmit(e)}
          >
            Save
          </LoaderButton>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default AddLeave;
