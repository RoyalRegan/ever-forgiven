import React, { useState, useEffect } from "react";
import SearchTagBox from "../components/SearchTagBox";
import { useHistory } from "react-router-dom";
import {
  Switch,
  Grid,
  Slider,
  TextField,
  Typography,
  Select,
  MenuItem,
  Button,
  Paper,
  Tabs,
  Tab,
  Box,
  IconButton,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import PairTable from "../components/PairTable";
import VolumeTable from "../components/VolumeTable";
import update from "immutability-helper";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const CreateContainer = ({ location: { state } }) => {
  const history = useHistory();
  const [selectedTab, setSelectedTab] = useState(0);
  const [container, setContainer] = useState({
    envs: [{}],
    ports: [{}],
    volumes: [{}],
    dependentOn: [],
    healthCheck: { enabled: false },
    RAM: 1,
  });

  useEffect(() => {
    if (!Object.is(state, undefined)) {
      if (state.editContainer !== undefined) {
        setContainer(state.containers[state.editContainer]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const marks = [
    {
      value: 1,
      label: "1",
    },
    {
      value: 2,
      label: "2",
    },
    {
      value: 4,
      label: "4",
    },
    {
      value: 8,
      label: "8",
    },
    {
      value: 12,
      label: "12",
    },
    {
      value: 16,
      label: "16",
    },
  ];

  const handleChange = (formName, data) => {
    setContainer({
      ...container,
      [formName]: data,
    });
  };

  const containersNames = () => {
    if (!Object.is(state, undefined)) {
      return [
        <MenuItem key={-1} value={null}>
          None
        </MenuItem>,
        state.containers
          .filter((it) => it.name !== container.name)
          .map((it) => (
            <MenuItem key={it.name} value={it.name}>
              {it.name}
            </MenuItem>
          )),
      ];
    }
    return [];
  };

  const handleChangeMultiple = (event) => {
    if (!event.target.value.includes(null)) {
      setContainer(
        update(container, { dependentOn: { $set: event.target.value } })
      );
    } else {
      console.log(1);
      setContainer(
        update(container, {
          dependentOn: {
            $set: event.target.value.filter((value) => value === null),
          },
        })
      );
    }
  };

  const isContainerValid = () => {
    console.log(container);
    if (container.name && container.image && container.RAM) {
      return true;
    }
    return false;
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
            <IconButton
              style={{ marginLeft: "10px" }}
              onClick={() => {
                if (!state.editProject) {
                  history.push({
                    pathname: "/create-project",
                    state: {
                      projectName: state.projectName,
                      containers: state.containers,
                    },
                  });
                } else {
                  history.goBack();
                }
              }}
            >
              <ArrowBackIosIcon style={{ fill: "#15aaf4" }} />
            </IconButton>
          </Grid>
          <Grid item xs={2}>
            <Button
              style={{ marginLeft: "65px" }}
              variant="outlined"
              color="primary"
              onClick={() => {
                if (isContainerValid()) {
                  if (state.editContainer !== undefined) {
                    state.containers = update(state.containers, {
                      [state.editContainer]: { $set: container },
                    });
                  } else {
                    state.containers = update(state.containers, {
                      $push: [container],
                    });
                  }
                  history.push({
                    pathname: "/create-project",
                    state: {
                      projectName: state.projectName,
                      containers: state.containers,
                      editProject: state.editProject,
                    },
                  });
                } else {
                  //TODO: show pop-up
                }
              }}
            >
              Save container
            </Button>
          </Grid>
        </Grid>
      </Box>
      <div style={{ marginLeft: "10%", marginRight: "10%", marginTop: "50px" }}>
        <Paper>
          <Tabs
            value={selectedTab}
            onChange={(event, newValue) => setSelectedTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Basic" />
            <Tab label="Perfomance" />
            <Tab label="Environments" />
            <Tab label="Ports" />
            <Tab label="Volumes" />
            <Tab label="Health check" />
          </Tabs>
          <TabPanel value={selectedTab} index={0}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <TextField
                  id="container-name"
                  type="url"
                  label="Name"
                  placeholder="my-container"
                  variant="outlined"
                  fullWidth={true}
                  value={container.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  id="search-image-box"
                  type="url"
                  label="Image"
                  placeholder="library/docker or user/image"
                  variant="outlined"
                  fullWidth={true}
                  value={container.image}
                  onChange={(event) =>
                    handleChange("image", event.target.value)
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <SearchTagBox
                  key={container.image}
                  image={container.image}
                  value={container.tag}
                  handleChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth={true}
                  label="CMD (optional)"
                  variant="outlined"
                  value={container.CMD}
                  onChange={(event) => handleChange("CMD", event.target.value)}
                />
              </Grid>
              <Grid item xs={3}>
                <FormControl style={{ width: "150px" }}>
                  <InputLabel>Dependent on</InputLabel>
                  <Select
                    fullWidth={true}
                    multiple
                    value={container.dependentOn}
                    onChange={handleChangeMultiple}
                  >
                    {containersNames()}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="h6">RAM</Typography>
                <Slider
                  value={container.RAM !== undefined ? container.RAM : 1}
                  getAriaValueText={(value) => `${value} Gb`}
                  aria-labelledby="discrete-slider-custom"
                  step={0.5}
                  min={0.5}
                  max={16}
                  valueLabelDisplay="auto"
                  marks={marks}
                  onChange={(event, value) => handleChange("RAM", value)}
                />
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value={selectedTab} index={2}>
            <Grid container>
              <Grid item xs={12}>
                <PairTable
                  data={container.envs}
                  handleChange={handleChange}
                  changeName="envs"
                />
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value={selectedTab} index={3}>
            <Grid container>
              <Grid item xs={12}>
                <PairTable
                  data={container.ports}
                  handleChange={handleChange}
                  changeName="ports"
                />
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value={selectedTab} index={4}>
            <Grid container>
              <Grid item xs={12}>
                <VolumeTable
                  data={container.volumes}
                  handleChange={handleChange}
                />
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value={selectedTab} index={5}>
            <Grid container spacing={1}>
              <Grid item xs={1}>
                <Typography variant="h6">Enable</Typography>
              </Grid>
              <Grid item xs={9}>
                <Switch
                  checked={container.healthCheck.enabled}
                  color="primary"
                  onChange={(event) => {
                    handleChange(
                      "healthCheck",
                      update(container.healthCheck, {
                        enabled: { $set: event.target.checked },
                      })
                    );
                    if (!event.target.checked) {
                      handleChange("healthCheck", {});
                    }
                  }}
                />
              </Grid>
              {container.healthCheck.enabled && (
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth={true}
                      label="Health check"
                      variant="outlined"
                      value={
                        container.healthCheck.CMD
                          ? container.healthCheck.CMD
                          : ""
                      }
                      onChange={(event) =>
                        handleChange(
                          "healthCheck",
                          update(container.healthCheck, {
                            CMD: { $set: event.target.value },
                          })
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth={true}
                      label="interval"
                      variant="outlined"
                      placeholder="default: 15s"
                      value={container.healthCheck.interval}
                      onChange={(event) =>
                        handleChange(
                          "healthCheck",
                          update(container.healthCheck, {
                            interval: { $set: event.target.value },
                          })
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth={true}
                      label="retries"
                      variant="outlined"
                      placeholder="default: 15s"
                      value={container.healthCheck.retries}
                      onChange={(event) =>
                        handleChange(
                          "healthCheck",
                          update(container.healthCheck, {
                            retries: { $set: event.target.value },
                          })
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth={true}
                      label="timeout"
                      variant="outlined"
                      placeholder="default: 15s"
                      value={container.healthCheck.timeout}
                      onChange={(event) =>
                        handleChange(
                          "healthCheck",
                          update(container.healthCheck, {
                            timeout: { $set: event.target.value },
                          })
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth={true}
                      label="start period"
                      variant="outlined"
                      value={container.healthCheck.startPeriod}
                      placeholder="default: 15s"
                      onChange={(event) =>
                        handleChange(
                          "healthCheck",
                          update(container.healthCheck, {
                            startPeriod: { $set: event.target.value },
                          })
                        )
                      }
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>
          </TabPanel>
        </Paper>
      </div>
    </div>
  );
};

export default CreateContainer;
