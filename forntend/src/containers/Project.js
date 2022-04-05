import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { useTokenAuth } from "../context/TokenAuthContext";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

const Project = ({ match }) => {
  const history = useHistory();
  const [project, setProject] = useState({ configs: [] });
  const [containers, setContainers] = useState([]);
  const { accessToken } = useTokenAuth();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const closeDialog = () => {
    setDialogOpen(false);
  };

  let projectName = match.params.name;

  let fetchProjectData = async () => {
    let response = await fetch(
      `http://localhost:8080/api/projects/${projectName}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken()}`,
        },
      }
    );
    let data = await response.json();
    setProject(data);
  };

  let fetchContainerData = async () => {
    let response = await fetch(
      `http://localhost:8080/api/projects/${projectName}/containers`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken()}`,
        },
      }
    );
    let data = await response.json();
    setContainers(data);
  };

  useEffect(() => {
    fetchProjectData();
    fetchContainerData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => fetchContainerData(), 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => clearInterval(timer);
  }, [containers]);

  const deleteProject = () => {
    fetch(`http://localhost:8080/api/projects/${projectName}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken()}`,
        "Content-Type": "application/json",
      },
    });
  };

  const changeContainerState = (container, state) => {
    fetch(
      `http://localhost:8080/api/project/${projectName}/${container.name}?state=${state}`,
      {
        method: "PUT",
        body: null,
        headers: {
          Authorization: `Bearer ${accessToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
  };

  const formatConfig = (containers) => {
    return containers.map((c) => {
      let e = [{}];
      if (c.envs != null) {
        Object.keys(c.envs).forEach((key) =>
          e.push({ key: key, value: c.envs[key] })
        );
      }
      let p = [{}];
      if (c.ports != null) {
        Object.keys(c.ports).forEach((key) =>
          p.push({ key: key, value: c.ports[key] })
        );
      }
      let v = [{}];
      if (c.volumes) {
        Object.keys(c.volumes).forEach((key) =>
          v.push({ key: key, value: c.volumes[key] })
        );
      }
      return {
        name: c.name,
        image: c.image,
        tag: c.tag,
        CMD: c.CMD,
        RAM: c.RAM.substring(0, c.RAM.length - 2),
        volumes: v,
        envs: e,
        ports: p,
        dependentOn: c.dependentOn,
        healthCheck: c.healthCheck
          ? { ...c.healthCheck, enabled: true }
          : { enabled: false },
      };
    });
  };

  const renderButton = (container) => {
    if (container.status === "running") {
      return (
        <Button
          variant="text"
          style={{ color: "#15aaf4" }}
          onClick={() => {
            changeContainerState(container, "STOP");
          }}
        >
          Stop
        </Button>
      );
    } else if (
      container.status === "exited" ||
      container.status === "created"
    ) {
      return (
        <Button
          variant="text"
          style={{ color: "#15aaf4" }}
          onClick={() => {
            changeContainerState(container, "START");
          }}
        >
          Start
        </Button>
      );
    } else if (container.status === null) {
      return (
        <Button variant="text" style={{ color: "#15aaf4" }}>
          Delpoy
        </Button>
      );
    }
  };

  const calcBackground = (status) => {
    if (status === "running") {
      return "#dcefd0";
    } else if (status === "exited") {
      return "#ffab91";
    } else if (status === "created") {
      return "#ffcc80";
    }
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
          <Grid item xs={8}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <IconButton
                style={{ marginLeft: "10px" }}
                onClick={() =>
                  history.push({
                    pathname: "/projects",
                  })
                }
              >
                <ArrowBackIosIcon style={{ fill: "#15aaf4" }} />
              </IconButton>
              <Typography>{match.params.name}</Typography>
            </div>
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setDialogOpen(true);
              }}
            >
              Show version
            </Button>
            <Dialog open={dialogOpen} onClose={closeDialog}>
              <DialogContent>
                {project.configs.map((value, index) => {
                  return (
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        <Typography>
                          version {index + 1}
                          {index === project.configs.length - 1
                            ? " [current]"
                            : ""}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>
                          {JSON.stringify(value, null, 2)}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </DialogContent>
            </Dialog>
            <Button
              variant="outlined"
              color="primary"
              style={{ marginLeft: "4px" }}
              onClick={() => {
                deleteProject();
                history.push({ pathname: "/projects" });
              }}
            >
              Delete project
            </Button>
            <Button
              variant="outlined"
              color="primary"
              style={{ marginLeft: "4px" }}
              onClick={() => {
                history.push({
                  pathname: `/project/${projectName}/edit`,
                  state: {
                    projectName: projectName,
                    containers: formatConfig(
                      project.configs[project.configs.length - 1].containers
                    ),
                    editProject: true,
                  },
                });
              }}
            >
              Edite project
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Grid
        container
        direction="column"
        alignContent="center"
        spacing={1}
        style={{ marginTop: "50px" }}
      >
        <Grid item xs={5}></Grid>
        {containers.map((value, index) => (
          <div style={{ display: "flex" }}>
            <Card style={{ marginBottom: "10px" }}>
              <CardContent style={{ height: "50px" }}>
                <Typography variant="h4" color="textSecondary">
                  {value.name}
                </Typography>
              </CardContent>
              <CardActions style={{ background: "#e6f4fe" }}>
                {renderButton(value)}
                <Button
                  variant="text"
                  style={{ color: "#15aaf4" }}
                  onClick={() => {
                    changeContainerState(value, "RESTART");
                  }}
                >
                  Restart
                </Button>
                <Button
                  variant="text"
                  style={{ color: "#15aaf4" }}
                  onClick={() => {
                    history.push({
                      pathname: `/project/${projectName}/container/${value.name}/details`,
                    });
                  }}
                >
                  More info
                </Button>
              </CardActions>
            </Card>
            <Paper
              style={{
                marginLeft: "10px",
                height: "134px",
                width: "100px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: calcBackground(value.status),
              }}
            >
              <Typography color="textSecondary">
                {value.status ? value.status : "not deployed"}
              </Typography>
            </Paper>
          </div>
        ))}
      </Grid>
    </div>
  );
};

export default Project;
