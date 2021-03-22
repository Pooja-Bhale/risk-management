import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useFormFields } from "../libs/hooksLib";
import Form from "react-bootstrap/Form";
import API from "@aws-amplify/api";
import LoaderButton from "../components/LoaderButton";

const AddLeave = () => {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fields, handleFieldChange] = useFormFields({
    employeeId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const body = {
        employeeId: fields.employeeId,
        startDate: fields.startDate,
        endDate: fields.endDate,
        reason: fields.reason,
      };
      const response = await API.post("riskmanagement", "/leave/addLeave", {
        // headers: { "Content-Type": "application/json" },
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
              <Form.Label>EmployeeId *</Form.Label>
              <Form.Control
                autoFocus
                type="text"
                placeholder="Enter employeeId"
                value={fields.employeeId}
                onChange={handleFieldChange}
              />
            </Form.Group>
            <Form.Group controlId="startDate" size="lg">
              <Form.Label>Start Date *</Form.Label>
              <Form.Control
                type="date"
                // placeholder="Enter your last name"
                value={fields.startDate}
                onChange={handleFieldChange}
              />
            </Form.Group>
            <Form.Group controlId="endDate" size="lg">
              <Form.Label>End Date *</Form.Label>
              <Form.Control
                type="date"
                // placeholder="Enter your email address"
                value={fields.endDate}
                onChange={handleFieldChange}
              />
            </Form.Group>
            <Form.Group controlId="reason" size="lg">
              <Form.Label>Reason </Form.Label>
              <Form.Control
                type="text"
                // placeholder="Enter your password"
                value={fields.reason}
                onChange={handleFieldChange}
              />
            </Form.Group>
            
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <LoaderButton  type="submit" isLoading={isLoading} onClick={(e) => handleSubmit(e)}>
              Save
            </LoaderButton>
          {/* <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button> */}
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default AddLeave;
