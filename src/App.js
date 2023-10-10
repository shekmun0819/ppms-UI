import { React, useState, useEffect } from "react";
import { createBrowserHistory } from "history";
import { Router, Route, Switch } from "react-router-dom";
import Pages from "./views/Pages/Pages";
import routes from "./routes";
import { LoginLayout } from "./layouts";
import Login from "./views/Login";
import { Redirect } from "react-router-dom";
import { useCookies } from "react-cookie";
import jwt_decode from "jwt-decode";

function App() {
  const [token, setToken] = useCookies();
  const [userRoles, setUserRoles] = useState("");
  const [filteredRoutes, setFilteredRoutes] = useState([]);

  useEffect(() => {
    if(token['Token']) {
      const decoded = jwt_decode(token['Token']);
      setUserRoles(decoded.userInfo.roles);
    }
    else {
      setUserRoles("");
    }
  }, [token]);

  useEffect(() => {
    if(userRoles !== "") {
      let filtered = routes.filter((route) => {
        let routeRoles = route.roles.split(",");
        if(routeRoles.some(role => userRoles.includes(role))) {
          return true;
        }
      })
      setFilteredRoutes(filtered);
    }
  }, [userRoles]);

  return (
    <div>
      <Router
        basename={process.env.REACT_APP_BASENAME || ""}
        history={browserHistory}
      >
        <Switch>
          <Route path={"/"} exact={true} component={(props) => {
              return (
                <LoginLayout {...props}>
                  <Redirect to="/login" />
                </LoginLayout>
              )
            }} 
          />
          <Route path={"/login"} component={(props) => {
              return (
                <LoginLayout {...props}>
                  <Login />
                </LoginLayout>
              )
            }} 
          />
          { 
            filteredRoutes.length > 0 && filteredRoutes.map((route, index) => {
              return (
                <Route
                  key={index}
                  path={route.path}
                  exact={route.exact}
                  component={(props) => {
                    return (
                      <route.layout {...props}>
                        <route.component {...props} />
                      </route.layout>
                    );
                  }}
                />
              );
            })
          }
          {/* <Route Redirect to="/PageNotFound" exact component={Pages} /> */}
        </Switch>
      </Router>
    </div>
  );
}

export default App;
const browserHistory = createBrowserHistory();
