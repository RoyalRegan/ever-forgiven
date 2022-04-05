import "./App.css";
import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Projects from "./containers/Projects";
import Project from "./containers/Project";
import CreateProject from "./containers/CreateProject";
import CreateContainer from "./containers/CreateContainer";
import ContainerDetails from "./containers/ContainerDetails";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";

export const colors = {
  textPrimary: "#ffffff",
  textSecondary: "#e6f4fe",
};

const theme = createMuiTheme({
  overrides: {
    MuiButton: {
      containedPrimary: {
        "& > .MuiButton-label": {
          color: "white",
        },
      },
    },
  },
  palette: {
    primary: {
      main: "#15aaf4",
    },
    secondary: {
      main: "#e8f7fe",
    },
  },
});

function App() {
  return (
    <div>
      <ThemeProvider theme={theme}>
        <Router>
          <NavBar />
          <Switch>
            <Route path="/projects" component={Projects} />
            <Route path="/create-project" component={CreateProject} />
            <Route path="/create-container" component={CreateContainer} />
            <Route
              path="/project/:name/container/:containerName/details"
              component={ContainerDetails}
            />
            <Route path="/project/:name/edit" component={CreateProject} />
            <Route path="/project/:name" component={Project} />
          </Switch>
        </Router>
      </ThemeProvider>
    </div>
  );
}

export default App;
