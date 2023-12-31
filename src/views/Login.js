import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useHistory } from "react-router-dom";
import Image from "../assets/images/login-bg.jpg";
import { useState, useEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import jwt_decode from "jwt-decode";
import { API_URL } from "../config";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="http://www.usm.my/">
        Universiti Sains Malaysia
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const theme = createTheme();

function Login() {
  let history = useHistory();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useCookies(["Token"]);

  const [message, setMessage] = useState({
    status: "info",
    statusText: "",
  });

  const [openSB, setOpenSB] = useState(false);
  const [openConfirmBox, setOpenConfirmBox] = useState(false);
  const handleOpenConfirmBox = () => {
    setOpenConfirmBox(true);
  };
  const handleCloseConfirmBox = () => {
    setOpenConfirmBox(false);
  };
  const handleCloseSB = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSB(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = {
      email: email,
      password: password,
    };
    await axios
      .post( API_URL + "/api/v1/auth/authenticate", data, {
        headers: {
          Accept: "application/json",
        },
      })
      .then((response) => {
        setToken("Token", response.data.token);
        history.push("/hostingplacement/projects");
        // window.location.reload();
      })
      .catch((error) => {
        console.log(error);
        setMessage({
          status: "error",
          statusText: "Invalid login credentials or Your account is deactivated.",
        });
      });
  };

  useEffect(() => {
    if (token["Token"]) {
      const decoded = jwt_decode(token["Token"]);
      if (decoded.exp > Math.round(Date.now() / 1000)) {
        history.push("/hostingplacement/projects");
      }
    }
  }, [token]);

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${Image})`,
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                onChange={(e) => {
                  setEmail(e.target.value);
                  setMessage({
                    status: "info",
                    statusText: "",
                  });
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setMessage({
                    status: "info",
                    statusText: "",
                  });
                }}
              />
              {/* <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              /> */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              {message.status === "error" && (
                <Typography
                  sx={{ fontSize: 14, textAlign: "center", color: "red" }}
                >
                  {message.statusText}
                </Typography>
              )}
              {/* <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid> */}
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default Login;
