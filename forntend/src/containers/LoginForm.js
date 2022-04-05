import React, { useState } from "react";
import { TextField, Button, Grid } from "@material-ui/core";
import { useTokenAuth } from "../context/TokenAuthContext";

const LoginForm = ({ changeDialog, closeDialog }) => {
  const { login } = useTokenAuth();
  const [userCred, setUserCred] = useState({});

  const onChange = (event, name) => {
    setUserCred({
      ...userCred,
      [name]: event.target.value,
    });
  };

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item xs={12}>
        <TextField
          type="login"
          label="Username"
          placeholder="my-username"
          variant="outlined"
          onChange={(event) => onChange(event, "username")}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          type="password"
          label="Password"
          placeholder="*****"
          variant="outlined"
          onChange={(event) => onChange(event, "password")}
        />
      </Grid>
      <Grid item xs={12} style={{ marginTop: "5px" }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth={true}
          onClick={async () => {
            await login(userCred.username, userCred.password);
            closeDialog();
          }}
        >
          Login
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          onClick={changeDialog}
          fullWidth={true}
        >
          Dont have account
        </Button>
      </Grid>
    </Grid>
  );
};

export default LoginForm;
