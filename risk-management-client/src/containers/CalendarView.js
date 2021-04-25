import React from "react";
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
      console.log(" response in getMonthlyRisk", response);
      this.setState({ monthlyRisk: response });
      console.log("monthlyRisk", this.state.monthlyRisk);
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
      // console.log("teams details", this.state.teamsDetails);
      return response;
    } catch (err) {
      console.error(err.message);
    }
  }
  async componentWillMount() {
    this.getMonthlyRisk();
    this.getTeamName();
    this.getTeams();
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

  componentWillUpdate(nextProps, nextState) {
    console.log("Component WILL UPDATE!");
    console.log("idddddd", nextState.id);
    console.log("this.id", this.state.id);
    if (this.state.id !== nextState.id) {
      this.getMonthlyRisk();
      this.getTeamName();
      this.getTeams();
    }
  }

  componentDidUpdate(prevProps) {
    console.log("id previouss", prevProps.id);

  }

  render() {
    if (this.state.isLoading === false) {
      return (
        <div>
          <h1>{this.state.teamDetails.teamName}</h1>
          <Select
            value={this.state.teamsDetails.lable}
            onChange={(option) => this.setState({ id: option.value })}
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
              dateClick={this.handleDateClick}
              showNonCurrentDates={false}
              fixedWeekCount={false}
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
              visibleRange={{
                start: "2021-04-01",
                end: "2021-04-29",
              }}
              dayCellDidMount={(e) => {
                let dateIs = new Date(e.date);
                let d = new Date(dateIs),
                  month = "" + (d.getMonth() + 1),
                  day = "" + d.getDate(),
                  year = d.getFullYear();

                if (month.length < 2) month = "0" + month;
                if (day.length < 2) day = "0" + day;

                var formattedDate = [year, month, day].join("-");
                console.log("formattedDate", formattedDate);
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
