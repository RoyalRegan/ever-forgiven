import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Box,
  IconButton,
  Card,
  CardContent,
  Typography,
  CardActions,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import update from "immutability-helper";
import { useTokenAuth } from "../context/TokenAuthContext";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import CloseIcon from "@material-ui/icons/Close";

const CreateProject = ({ location: { state } }) => {
  const history = useHistory();
  const [containers, setContainers] = useState([]);
  const { accessToken } = useTokenAuth();

  let projectName = Object.is(state, undefined) ? "" : state.projectName;

  useEffect(() => {
    setContainers(Object.is(state, undefined) ? [] : state.containers);
    //console.log(state.containers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatContainer = (c) => {
    let e = {};
    c.envs
      .filter((value) => value.key !== undefined)
      .forEach((value) => {
        e[value.key] = value.value;
      });
    let p = {};
    c.ports
      .filter((value) => value.key !== undefined)
      .forEach((value) => {
        p[value.key] = value.value;
      });
    let v = {};
    c.volumes
      .filter((value) => value.key !== undefined)
      .forEach((value) => {
        v[value.key] = `${value.value}`;
      });
    return {
      name: c.name,
      image: c.image,
      tag: c.tag,
      CMD: c.CMD,
      RAM: `${c.RAM}gb`,
      volumes: Object.entries(v).length === 0 ? null : v,
      envs: Object.entries(e).length === 0 ? null : e,
      ports: Object.entries(p).length === 0 ? null : p,
      dependentOn: c.dependentOn,
      healthCheck:
        Object.entries(c.healthCheck).length === 1 ? null : c.healthCheck,
    };
  };

  const saveProject = async () => {
    let response = await fetch("http://localhost:8080/api/projects", {
      method: "POST",
      body: JSON.stringify({
        name: projectName,
        containers: containers.map((value) => formatContainer(value)),
      }),
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json",
      },
    });
  };

  const startProject = async (projectName) => {
    let response = await fetch(
      `http://localhost:8080/api/projects/${projectName}/start`,
      {
        method: "POST",
        body: null,
        headers: {
          Authorization: `Bearer ${accessToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
  };

  const updateProject = async (projectName) => {
    await fetch(`http://localhost:8080/api/projects/${projectName}`, {
      method: "PUT",
      body: JSON.stringify({
        name: projectName,
        containers: containers.map((value) => formatContainer(value)),
      }),
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json",
      },
    });
  };

  const renderContainers = () => {
    return containers.map((value, index) => (
      <Grid key={index} item style={{ marginBottom: "10px" }}>
        <Grid container>
          <Card style={{ width: 500 }}>
            <CardContent>
              <Typography variant="h4" color="textSecondary">
                {value.name}
              </Typography>
              <Typography color="textSecondary" style={{ marginTop: "10px" }}>
                {value.image}:{value.tag ? value.tag : "latest"}
              </Typography>
            </CardContent>
            <CardActions style={{ background: "#e6f4fe" }}>
              <Button
                variant="text"
                color="primary"
                onClick={() => {
                  history.push({
                    pathname: "/create-container",
                    state: {
                      projectName: projectName,
                      containers: containers,
                      editContainer: index,
                      editProject: state.editProject,
                    },
                  });
                }}
              >
                Edit
              </Button>
              <Button
                variant="text"
                color="primary"
                onClick={() => {
                  setContainers(update(containers, { $splice: [[index, 1]] }));
                }}
              >
                Delete
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    ));
  };

  return (
    <div>
      <Box
        fullWidth={true}
        style={{
          background: "#f9f9f9",
          height: "60px",
          marginBottom: "10px",
        }}
      >
        <Grid container spacing={1} style={{ paddingTop: "6px" }}>
          <Grid item xs={10}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <IconButton
                onClick={() => history.goBack()}
                style={{ marginLeft: "10px" }}
              >
                <ArrowBackIosIcon style={{ fill: "#15aaf4" }} />
              </IconButton>
              <TextField
                style={{ marginLeft: "48.2%" }}
                type="text"
                label="Project name"
                placeholder="my-project"
                defaultValue={projectName}
                onChange={(event) => (projectName = event.target.value)}
              ></TextField>
            </div>
          </Grid>
          <Grid item xs={2}>
            <Button
              style={{ marginLeft: "65px" }}
              variant="outlined"
              color="primary"
              onClick={async () => {
                if (projectName && containers.length > 0) {
                  if (state.projectName !== null) {
                    if (!state.editProject) {
                      await saveProject();
                      await startProject(projectName);
                    } else {
                      await updateProject(projectName);
                    }
                    history.push({ pathname: "/projects" });
                  }
                }
              }}
            >
              {state != null
                ? state.editProject
                  ? "Edit project"
                  : "Save project"
                : "Save project"}
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Grid
        container
        direction="column"
        alignItems="center"
        spacing={1}
        style={{ marginTop: "50px" }}
      >
        {renderContainers()}
        <Grid item xs={12} style={{ marginTop: "10px" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              history.push({
                pathname: "/create-container",
                state: {
                  projectName: projectName,
                  containers: containers,
                  editProject: state ? state.editProject : false,
                },
              })
            }
          >
            Add container
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default CreateProject;
