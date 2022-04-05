import React, { useState } from "react";
import { TextField, Button, Grid } from "@material-ui/core";

const RegisterForm = ({ changeDialog, closeDialog }) => {
  const [userCred, setUserCred] = useState({ password: "" });
  const [passwordConfirmed, setPasswordConfirmed] = useState(false);

  const onChange = (event, name) => {
    setUserCred({
      ...userCred,
      [name]: event.target.value,
    });
  };

  const register = async () => {
    let response = await fetch("http://localhost:8080/register", {
      method: "POST",
      body: JSON.stringify(userCred),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status !== 200) {
      console.log("oops");
    }
  };

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item xs={12}>
        <TextField
          type="login"
          label="Username"
          placeholder="my-username"
          variant="outlined"
          fullWidth={true}
          onChange={(event) => onChange(event, "username")}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          type="email"
          label="Email"
          placeholder="email@yandex.ru"
          variant="outlined"
          fullWidth={true}
          onChange={(event) => onChange(event, "email")}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          type="password"
          label="Password"
          placeholder="*****"
          variant="outlined"
          fullWidth={true}
          onChange={(event) => onChange(event, "password")}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          key={userCred.password}
          error={!(passwordConfirmed || userCred.password === "")}
          type="password"
          label="Confirm password"
          variant="outlined"
          placeholder="*****"
          fullWidth={true}
          onChange={(event) =>
            setPasswordConfirmed(userCred.password === event.target.value)
          }
          helperText={
            passwordConfirmed || userCred.password === ""
              ? ""
              : "Password not equals"
          }
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          fullWidth={true}
          style={{ marginTop: "5px" }}
          onClick={async () => {
            await register();
            closeDialog();
          }}
        >
          Register
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          onClick={changeDialog}
          fullWidth={true}
        >
          Already have account
        </Button>
      </Grid>
    </Grid>
  );
};

export default RegisterForm;
