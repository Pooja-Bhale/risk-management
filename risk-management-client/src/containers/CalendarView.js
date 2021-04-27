import React from "react";
import { Redirect } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import API from "@aws-amplify/api";
import AddLeave from "./AddLeave";
import Select from "react-select";

export default class calendar extends React.Component {
  constructor(props) {
    super(props);
    var today = new Date();
    this.calendar = React.createRef();
    this.state = {
      isLoading: true,
      monthCount: today.getMonth(),
      id: props.match.params.teamId,
      monthlyRisk: {},
      teamDetails: {},
      teamsList: [],
      teamsDetails: {},
      redirect: { redirect: false, to: "" },
      selectedTeam: {},
      data: {},
      startDate: "",
      endDate: "",
    };
  }

  handleClose = () => {
    window.location = "/teamsInfo";
  };

  async getMonthlyRisk() {
    try {
      let response = await API.get(
        "riskmanagement",
        "/team/getMonthlyRisk/" + this.state.id
      );
      this.setState({ monthlyRisk: response });
      this.setState({ isLoading: false });
    } catch (err) {
      console.error(err.message);
    }
  }

  async getTeamName() {
    try {
      let response = await API.get(
        "riskmanagement",
        "/team/getTeamName/" + this.state.id
      );
      this.setState({ teamDetails: response });
    } catch (err) {
      console.error(err.message);
    }
  }

  async getTeams() {
    try {
      let response = await API.get("riskmanagement", "/team/getTeamInfo");
      this.setState({ teamsList: response });
      const teamsDetail = response.map((d) => ({
        value: d.teamId,
        label: d.teamName,
      }));
      this.setState({ teamsDetails: teamsDetail });
      return response;
    } catch (err) {
      console.error(err.message);
    }
  }

  fetchEvents(start, end) {
    this.setState({
      startDate: start,
      endDate: end,
    });

    this.getEmployeeList();
  }

  getEmployeeList = async () => {
    try {
      let response = await API.get(
        "riskmanagement",
        `/leave/getLeaveDetailsOfTeam/${this.state.id}/${this.state.startDate}/${this.state.endDate}`
      );
      this.setState({ data: response });
      return response;
    } catch (err) {
      console.error(err.message);
    }
  };

  async componentWillMount() {
    await this.getMonthlyRisk();
    await this.getTeamName();
    await this.getTeams();
  }

  onNext = async (event) => {
    let currentDate = new Date();
    let tempMonthCount = this.state.monthCount + 1;
    this.setState({ monthCount: tempMonthCount });
    currentDate.setMonth(tempMonthCount);
    let nextMonthStartDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    let nextMonthEndDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    let monthStartDay = nextMonthStartDay.toISOString();
    let monthEndDay = nextMonthEndDay.toISOString();
    try {
      let response = await API.get(
        "riskmanagement",
        "/team/getPrevNextMonthlyRisk/" +
          this.state.id +
          "/" +
          monthStartDay +
          "/" +
          monthEndDay
      );
      var jsonData = JSON.stringify(response);
      console.log("response is", jsonData);
      const monthlyRisk = this.setMontlyRisk(response);
      this.setState({ monthlyRisk: monthlyRisk });
    } catch (err) {
      console.error(err.message);
    }

    this.calendar.current._calendarApi.next();
  };

  onPrev = async (event) => {
    let currentDate = new Date();
    let tempMonthCount = this.state.monthCount - 1;
    this.setState({ monthCount: tempMonthCount });
    currentDate.setMonth(tempMonthCount);
    let prevMonthStartDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    let prevMonthEndDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    let monthStartDay = prevMonthStartDay.toISOString();
    let monthEndDay = prevMonthEndDay.toISOString();
    try {
      let response = await API.get(
        "riskmanagement",
        "/team/getPrevNextMonthlyRisk/" +
          this.state.id +
          "/" +
          monthStartDay +
          "/" +
          monthEndDay
      );

      const monthlyRisk = this.setMontlyRisk(response);
      this.setState({ monthlyRisk: monthlyRisk });
    } catch (err) {
      console.error(err.message);
    }

    this.calendar.current._calendarApi.prev();
  };

  setMontlyRisk = (response) => {
    const currentRisks = this.convertToRiskObject(this.state.monthlyRisk);
    const newRisk = this.convertToRiskObject(response);
    const mergedRisks = { ...currentRisks, ...newRisk };
    const date = Object.keys(mergedRisks);
    const monthRisk = Object.values(mergedRisks);
    return { [this.state.id]: { date, monthRisk } };
  };
  convertToRiskObject = (response) => {
    const dates = response[this.state.id].date;
    const monthlyRisks = response[this.state.id].monthRisk;
    let riskObj = {};
    if (dates.length === monthlyRisks.length) {
      dates.forEach((date, i) => {
        riskObj = { ...riskObj, [date]: monthlyRisks[i] };
      });
    }
    return riskObj;
  };

  handleDateClick = (info) => {
    var date = info.dateStr;
    console.log("date", date);
    window.location = `/leaveDetails/${this.state.id}/${date}`;
  };

  async componentDidUpdate(param, prevState) {
    if (
      this.state.redirect.redirect === false &&
      this.state.id !== prevState.id
    ) {
      this.setState({
        ...this.state,
        redirect: { redirect: true, to: `/Calendar/${this.state.id}` },
      });
    }
    if (this.state.redirect.redirect) {
      await this.getMonthlyRisk();
      await this.getTeamName();
      await this.getTeams();
      this.setState({ ...this.state, redirect: { redirect: false, to: "" } });
    }
  }

  render() {
    if (this.state.redirect.redirect) {
      return (
        <Redirect
          push
          to={{
            pathname: this.state.redirect.to,
          }}
        />
      );
    }
    if (this.state.isLoading === false) {
      return (
        <div>
          <h1>{this.state.teamDetails.teamName}</h1>
          <Select
            placeholder="Select team..."
            value={this.state.selectedTeam}
            onChange={(option) =>
              this.setState({ id: option.value, selectedTeam: option })
            }
            options={this.state.teamsDetails}
          />
          <div>
            <div>
              <AddLeave />
            </div>
            <button
              className="btn btn-secondary"
              Style="margin-top:30px; margin-bottom:30px;"
              onClick={this.handleClose}
            >
              Close{" "}
            </button>
          </div>
          <div>
            <FullCalendar
              ref={this.calendar}
              plugins={[dayGridPlugin, interactionPlugin]}
              // dateClick={this.handleDateClick}
              showNonCurrentDates={false}
              fixedWeekCount={false}
              datesSet={(arg) => {
                console.log("datesSet prop");
                setTimeout(() => {
                  this.fetchEvents(
                    arg.start.toISOString(),
                    arg.end.toISOString()
                  );
                }, 3000);
              }}
              events={this.state.data}
              customButtons={{
                next: {
                  text: "Next",
                  click: this.onNext,
                },
                prev: {
                  text: "Previous",
                  click: this.onPrev,
                },
              }}
              views
              initialView="dayGridMonth"
              dayCellDidMount={(e) => {
                let dateIs = new Date(e.date);
                let d = new Date(dateIs),
                  month = "" + (d.getMonth() + 1),
                  day = "" + d.getDate(),
                  year = d.getFullYear();

                if (month.length < 2) month = "0" + month;
                if (day.length < 2) day = "0" + day;

                var formattedDate = [year, month, day].join("-");
                for (
                  let index = 0;
                  index <
                  this.state.monthlyRisk[parseInt(this.state.id)].date.length;
                  index++
                ) {
                  if (
                    formattedDate ===
                      this.state.monthlyRisk[parseInt(this.state.id)].date[
                        index
                      ] &&
                    this.state.monthlyRisk[parseInt(this.state.id)].monthRisk[
                      index
                    ] === true
                  ) {
                    e.el.style.backgroundColor = "#FA6D4F";
                  }
                }
              }}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <p>please wait!</p>
        </div>
      );
    }
  }
}
