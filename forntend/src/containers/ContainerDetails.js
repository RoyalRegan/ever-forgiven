import {
  Box,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { useTokenAuth } from "../context/TokenAuthContext";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import RefreshIcon from "@material-ui/icons/Refresh";

function getPastDay() {
  let curr = new Date();
  curr.setDate(curr.getDate() - 1);
  return curr;
}

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
const ContainerDetails = ({ match }) => {
  const history = useHistory();
  const [selectedTab, setSelectedTab] = useState(0);
  const [logs, setLogs] = useState();
  const [statistics, setStatistics] = useState({});
  const [logsInput, setLogsInput] = useState({
    to: new Date().toISOString().slice(0, -8),
    from: getPastDay().toISOString().slice(0, -8),
    tail: 100,
  });
  const { accessToken } = useTokenAuth();

  let projectName = match.params.name;
  let containerName = match.params.containerName;

  const fetchLogs = async () => {
    let response = await fetch(
      `http://localhost:8080/api/project/${projectName}/${containerName}/logs?tail=${logsInput.tail}&since=${logsInput.from}&until=${logsInput.to}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken()}`,
        },
      }
    );
    let l = await response.text();
    setLogs(l);
  };

  const units = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  function niceBytes(x) {
    let l = 0,
      n = parseInt(x, 10) || 0;

    while (n >= 1024 && ++l) {
      n = n / 1024;
    }

    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + " " + units[l];
  }
  const fetchStatistics = async () => {
    let response = await fetch(
      `http://localhost:8080/api/project/${projectName}/${containerName}/stats`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken()}`,
        },
      }
    );
    let data = await response.json();
    var cpuDelta =
      data.cpu_stats.cpu_usage.total_usage -
      data.precpu_stats.cpu_usage.total_usage;
    var systemDelta =
      data.cpu_stats.system_cpu_usage - data.precpu_stats.system_cpu_usage;
    var RESULT_CPU_USAGE = (cpuDelta / systemDelta) * 100;
    let stat = {
      ramLoad:
        niceBytes(data.memory_stats.usage) +
        "/" +
        niceBytes(data.memory_stats.limit),
      network: niceBytes(
        Object.keys(data.networks)
          .map((key) => data.networks[key].rx_bytes)
          .reduce((a, b) => a + b, 0)
      ),
      cpuUsage: RESULT_CPU_USAGE.toFixed(2),
      io: niceBytes(
        data.blkio_stats.io_service_bytes_recursive.filter(
          (value) => value.op === "Total"
        )[0].value
      ),
    };
    setStatistics(stat);
  };

  useEffect(() => {
    fetchStatistics();
    fetchLogs();
  }, []);

  useEffect(() => {
    let timer;
    if (selectedTab === 0) {
      timer = setInterval(() => {
        fetchStatistics();
      }, 3000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => clearInterval(timer);
  }, [statistics, selectedTab]);

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
            <div style={{ display: "flex", alignItems: "center" }}>
              <IconButton
                style={{ marginLeft: "10px" }}
                onClick={() => history.goBack()}
              >
                <ArrowBackIosIcon style={{ fill: "#15aaf4" }} />
              </IconButton>
              <Typography>{match.params.containerName}</Typography>
            </div>
          </Grid>
        </Grid>
      </Box>
      <Paper
        style={{ marginLeft: "10%", marginRight: "10%", marginTop: "10px" }}
      >
        <Tabs
          value={selectedTab}
          onChange={(event, newValue) => setSelectedTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Statistics" />
          <Tab label="Logs" />
          <Tab label="Console" />
        </Tabs>
        <TabPanel value={selectedTab} index={0}>
          <Grid container spacing={5}>
            <Grid item xs={6} style={{ paddingLeft: "30%" }}>
              <Typography>CPU usage</Typography>
              <Typography>{statistics.cpuUsage}%</Typography>
            </Grid>
            <Grid item xs={6} style={{ paddingLeft: "10%" }}>
              <Typography>RAM usage</Typography>
              <Typography>{statistics.ramLoad}</Typography>
            </Grid>
            <Grid item xs={6} style={{ paddingLeft: "30%" }}>
              <Typography>Network usage</Typography>
              <Typography>{statistics.network}</Typography>
            </Grid>
            <Grid item xs={6} style={{ paddingLeft: "10%" }}>
              <Typography>I/O usage</Typography>
              <Typography>{statistics.io}</Typography>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={selectedTab} index={1}>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={3}>
              <TextField
                label="From"
                type="datetime-local"
                defaultValue={logsInput.from}
                onChange={(event) =>
                  setLogsInput({ ...logsInput, from: event.target.value })
                }
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="To"
                type="datetime-local"
                defaultValue={logsInput.to}
                onChange={(event) =>
                  setLogsInput({ ...logsInput, to: event.target.value })
                }
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                type="number"
                label="Number of lines"
                defaultValue={logsInput.tail}
                onChange={(event) =>
                  setLogsInput({ ...logsInput, tail: event.target.value })
                }
              />
            </Grid>
            <Grid item xs={3}>
              <IconButton onClick={fetchLogs}>
                <RefreshIcon style={{ fill: "#15aaf4" }} />
              </IconButton>
            </Grid>
          </Grid>
          <Grid item xs={12} style={{ marginTop: "20px" }}>
            <Paper style={{ background: "#192635" }}>
              <Typography color="secondary">
                {
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      borderRadius: "3px",
                      padding: "10px 10px",
                      fontSize: ".875rem",
                      fontFamily: "monospace,monospace",
                    }}
                  >
                    {logs}
                  </pre>
                }
              </Typography>
            </Paper>
          </Grid>
        </TabPanel>
        <TabPanel value={selectedTab} index={2}></TabPanel>
      </Paper>
    </div>
  );
};

export default ContainerDetails;
