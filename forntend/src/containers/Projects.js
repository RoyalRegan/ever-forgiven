import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CardActions,
  CardContent,
  Fab,
  Grid,
  Paper,
  Typography,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { useTokenAuth } from "../context/TokenAuthContext";
import Card from "@material-ui/core/Card";
import AddIcon from "@material-ui/icons/Add";
import { colors } from "../App";

const Projects = () => {
  const history = useHistory();
  const [projects, setProjects] = useState([]);
  const { accessToken } = useTokenAuth();

  useEffect(() => {
    let fetchData = async () => {
      let response = await fetch("http://localhost:8080/api/projects", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken()}`,
        },
      });
      let data = await response.json();
      setProjects(data);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Box
        fullWidth={true}
        style={{
          background: "#f9f9f9",
          height: "60px",
          marginBottom: "10px",
          textAlign: "center",
        }}
      ></Box>
      <Grid container direction="column" alignContent="center" spacing={1}>
        <Grid item xs={12}></Grid>
        {projects.map((value, index) => (
          <Grid key={index} item xs={8}>
            <Card>
              <CardContent style={{ width: "250px", height: "150px" }}>
                <Typography variant="h4" color="textSecondary" gutterBottom>
                  {value.name}
                </Typography>
                <Typography
                  style={{ marginTop: "80px" }}
                  color="textSecondary"
                  gutterBottom
                >
                  containers: {value.containersCount}
                </Typography>
              </CardContent>
              <CardActions style={{ background: "#e6f4fe" }}>
                <Button
                  variant="text"
                  style={{ color: "#15aaf4" }}
                  onClick={() => {
                    history.push({
                      pathname: `/project/${value.name}`,
                    });
                  }}
                >
                  Containers detail
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Paper
            style={{
              marginTop: "50%",
              marginLeft: "15%",
              width: "200px",
              height: "200px",
              background: "#f2fbfe",
            }}
          >
            <Fab
              color="primary"
              onClick={() => history.push("/create-project")}
              style={{ padding: "25%", marginLeft: "25%", marginTop: "25px" }}
            >
              <AddIcon
                style={{ height: "70px", width: "70px" }}
                color="secondary"
              ></AddIcon>
            </Fab>
            <Typography
              variant="h6"
              style={{
                marginLeft: "18%",
                marginTop: "30px",
                color: "#15aaf4",
              }}
            >
              Create project
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Projects;
