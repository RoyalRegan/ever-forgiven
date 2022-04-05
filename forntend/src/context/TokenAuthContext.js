import React, { createContext, useState, useContext, useEffect } from "react";

const TokenContext = createContext({});

const TokenAuthProvider = (props) => {
  const [userToken, setUserToken] = useState(null);

  //TODO: use '/api/whoami'
  const isLogin = () => userToken != null;

  useEffect(() => {
    if (window.localStorage.getItem("accessToken")) {
      setUserToken({
        accessToken: window.localStorage.getItem("accessToken"),
        refreshToken: window.localStorage.getItem("refreshToken"),
      });
    }
  }, []);

  const login = async (username, password) => {
    let response = await fetch("http://localhost:8080/login", {
      method: "POST",
      body: JSON.stringify({ username: username, password: password }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    let data = await response.json();
    const refreshToken = data.token;
    response = await fetch("http://localhost:8080/token/access", {
      method: "POST",
      body: JSON.stringify({ refreshToken: refreshToken }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    data = await response.json();
    const accessToken = data.token;
    let tokens = { accessToken: accessToken, refreshToken: refreshToken };
    setUserToken(tokens);
    window.localStorage.setItem("accessToken", tokens.accessToken);
    window.localStorage.setItem("refreshToken", tokens.refreshToken);
  };

  const logout = () => {
    setUserToken(null);
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
  };

  const updateAccess = async () => {
    let response = await fetch("http://localhost:8080/token/access", {
      method: "POST",
      body: JSON.stringify({ refreshToken: userToken.refreshToken }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    let data = await response.json();
    const accessToken = data.token;
    setUserToken({
      accessToken: accessToken,
      refreshToken: userToken.refreshToken,
    });
  };

  //TODO: userToken.accessToken return false ? why
  const accessToken = () => window.localStorage.getItem("accessToken");

  const authContextValue = {
    isLogin,
    login,
    logout,
    updateAccess,
    accessToken,
  };

  return <TokenContext.Provider value={authContextValue} {...props} />;
};

const useTokenAuth = () => useContext(TokenContext);

export { useTokenAuth, TokenAuthProvider };
