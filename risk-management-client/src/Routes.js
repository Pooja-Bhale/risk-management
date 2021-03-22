import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./containers/Home";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import TeamsInfo from "./containers/TeamsInfo";
import NotFound from "./containers/NotFound";
import TeamDetails from "./containers/TeamDetails";

export default function Routes() {
  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route exact path="/login">
        <Login />
      </Route>
      <Route exact path="/signup">
        <Signup />
      </Route>
      <Route exact path="/signup">
        <Signup />
      </Route>
      <Route exact path="/teamsInfo">
        <TeamsInfo />
      </Route>
      <Route exact path="/TeamDetails/:teamId" component={TeamDetails}/>
        
      {/* Finally, catch all unmatched routes */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}
