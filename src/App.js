import React from "react"
import { BrowserRouter, Route, Switch } from "react-router-dom";
import LoginApp from "./page/LoginApp"
import Chatroom from "../src/chatroom/Chatroom"
function App() {
  return (
    <BrowserRouter>
    <Switch>
    <Route  path="/login" component={LoginApp}></Route>
    <Route exact path="/chatroom" component={Chatroom}></Route>
    <Route  component={LoginApp}></Route>
    </Switch>
  
</BrowserRouter>
  
  );
}

export default App;
