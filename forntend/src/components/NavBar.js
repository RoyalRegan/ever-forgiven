import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  AppBar,
  Button,
  Toolbar,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  Menu,
  MenuItem,
  Box,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { useTokenAuth } from "../context/TokenAuthContext";
import { AccountCircle } from "@material-ui/icons";
import LoginForm from "../containers/LoginForm";
import RegisterForm from "../containers/RegisterForm";
import { colors } from "../App";

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
    color: colors.textPrimary,
  },
}));

const NavBar = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [registerDialog, setRegisterDialog] = React.useState(false);
  const { logout, isLogin } = useTokenAuth();
  const classes = useStyles();
  const history = useHistory();

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const renderButtons = () => {
    return !isLogin() ? (
      <div>
        <Button
          color="secondary"
          variant="outlined"
          onClick={() => setDialogOpen(true)}
        >
          Login
        </Button>
        <Dialog open={dialogOpen} onClose={closeDialog} anchorEl={anchorEl}>
          <DialogContent style={{ padding: "30px" }}>
            {!registerDialog ? (
              <LoginForm
                changeDialog={() => setRegisterDialog(true)}
                closeDialog={closeDialog}
              />
            ) : (
              <RegisterForm
                changeDialog={() => setRegisterDialog(false)}
                closeDialog={closeDialog}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    ) : (
      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography className={classes.title}>jaju2251</Typography>
        <IconButton
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          color="secondary"
          onClick={(event) => {
            setMenuOpen(true);
            setAnchorEl(event.currentTarget);
          }}
        >
          <AccountCircle style={{ height: "30px", width: "30px" }} />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          open={menuOpen}
          onClose={() => {
            setMenuOpen(false);
            setAnchorEl(null);
          }}
        >
          <MenuItem onClick={() => console.log("")}>My profile</MenuItem>
          <MenuItem onClick={() => console.log("")}>Settings</MenuItem>
          <MenuItem
            onClick={() => {
              logout();
              setMenuOpen(false);
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </div>
    );
  };

  return (
    <AppBar position="static" className={classes.root}>
      <Toolbar>
        <Box>
          <svg
            enable-background="new 0 0 24 24"
            height="40"
            viewBox="0 0 24 24"
            width="40"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: "10px", fill: "white" }}
          >
            <path d="m5.5 5.177-4.947 1.349c-.326.089-.553.386-.553.724v10.5c0 .338.227.635.553.724l4.947 1.349z" />
            <path d="m23.316 6.503-16.316-1.44v14.874l16.316-1.44c.387-.034.684-.358.684-.747v-10.5c0-.389-.297-.713-.684-.747zm-12.816 9.747c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-7.5c0-.414.336-.75.75-.75s.75.336.75.75zm4-.5c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-6.5c0-.414.336-.75.75-.75s.75.336.75.75zm4-.5c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-5.5c0-.414.336-.75.75-.75s.75.336.75.75zm3.5-.25c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-4.75c0-.414.336-.75.75-.75s.75.336.75.75z" />
          </svg>
        </Box>
        <Typography variant="h6" className={classes.title}>
          Ever Forgiven
        </Typography>
        {renderButtons()}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
