import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import API from "@aws-amplify/api";

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
    };
  }

  handleClose = () => {
    window.location = "/teamsInfo";
  };

  componentDidMount() {
    console.log(this.state.monthCount);
  }

  async componentWillMount() {
    try {
      console.log("inside try catch");
      console.log("idd in mount fun", this.state.id)
      let response = await API.get(
        "riskmanagement",
        "/team/getMonthlyRisk/" + this.state.id
      );
      console.log("response is", response);
      this.setState({ monthlyRisk: response });
      this.setState({ isLoading: false });
      console.log("isLoading beore setting state in cdm", this.state.isLoading);
      console.log("state is", this.state.monthlyRisk);
      console.log(
        "this.state.monthlyRisk",
        this.state.monthlyRisk[parseInt(this.state.id)]
      );
    } catch (err) {
      console.error(err.message);
    }
  }

   onNext = async (event) => {
    let currentDate = new Date();
    let tempMonthCount = this.state.monthCount + 1;
    console.log("tempMonthCount", tempMonthCount);
    this.setState({ monthCount: tempMonthCount });
    currentDate.setMonth(tempMonthCount);
    console.log("nextMonthDate", currentDate);
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
    console.log("nextMonthStartDay", nextMonthStartDay)
    console.log("nextMonthEndDay", nextMonthEndDay)

    let monthStartDay = nextMonthStartDay.toISOString();
    let monthEndDay = nextMonthEndDay.toISOString();

    console.log("monthStartDay iso", monthStartDay)
    console.log("monthEndDay iso", monthEndDay)


    try {

        console.log("inside try catch of next");
        // console.log("id in next ffun", this.state.id)
        // this.setState({ isLoading: true });
        // console.log("isloading is seted to true in next", this.state.isLoading)

        let response = await API.get(
          "riskmanagement",
          "/team/getPrevNextMonthlyRisk/" + this.state.id + "/" + monthStartDay +"/"+ monthEndDay
        );
        console.log("response is", response);
        this.setState({ monthlyRisk: response });
        // this.setState({ isLoading: false });
        // console.log("isLoading beore setting state in next", this.state.isLoading);
        console.log("onnext state is", this.state.monthlyRisk);
        // console.log(
        //   "this.state.monthlyRisk",
        //   this.state.monthlyRisk[parseInt(this.state.id)]
        // );
      } catch (err) {
        console.error(err.message);
      }

    this.calendar.current._calendarApi.next();

  };

  onPrev = async (event) => {
    let currentDate = new Date();
    let tempMonthCount = this.state.monthCount - 1;
    console.log("tempMonthCount", tempMonthCount);
    this.setState({ monthCount: tempMonthCount });
    currentDate.setMonth(tempMonthCount);
    console.log("nextMonthDate", currentDate);
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
    console.log("prevMonthStartDay", prevMonthStartDay)
    console.log("prevMonthEndDay", prevMonthEndDay)

    let monthStartDay = prevMonthStartDay.toISOString();
    let monthEndDay = prevMonthEndDay.toISOString();

    console.log("monthStartDay iso", monthStartDay)
    console.log("monthEndDay iso", monthEndDay)


    try {

        console.log("inside try catch of prev");
        // console.log("id in prev ffun", this.state.id)
        this.setState({ isLoading: true });
        console.log("isloading is seted to true in prev", this.state.isLoading)

        let response = await API.get(
          "riskmanagement",
          "/team/getPrevNextMonthlyRisk/" + this.state.id + "/" + monthStartDay +"/"+ monthEndDay
        );
        console.log("response is", response);
        this.setState({ monthlyRisk: response });
        this.setState({ isLoading: false });
        console.log("isLoading beore setting state in prev", this.state.isLoading);
        console.log("onprev state is", this.state.monthlyRisk);
        // console.log(
        //   "this.state.monthlyRisk",
        //   this.state.monthlyRisk[parseInt(this.state.id)]
        // );
      } catch (err) {
        console.error(err.message);
      }

    this.calendar.current._calendarApi.prev();
   
  };


//   onPrev = (event) => {
//     console.log("onPrev Event ", event);
//     this.calendar.current._calendarApi.prev();
//   };

  handleDateClick = (info) => {
    // bind with an arrow function
    var date = info.dateStr;
    alert("The current date of the calendar is " + date);
    console.log(info);
    info.dayEl.style.backgroundColor = "red";
  };


  render() {
    // console.log("inssides next fun", this.state.monthCount);

    // if (Object.keys(this.state.monthlyRisk).length !== 0) {
    if (this.state.isLoading === false) {
      return (
        <div>
          <button className="btn btn-secondary" onClick={this.handleClose}>
            Close{" "}
          </button>
          <FullCalendar
            ref={this.calendar}
            plugins={[dayGridPlugin, interactionPlugin]}
            dateClick={this.handleDateClick}
            customButtons={{
              // overwrite default btn functions
              // key is btn name used in header toolbar
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
