import { useColorMode, useTheme } from "@chakra-ui/react";
import { useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ThemeToggle from "./components/themeToggle";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

const App = () => {
  const { colorMode } = useColorMode();
  const theme = useTheme();

  useEffect(() => {
    document.body.style.backgroundColor =
      colorMode === "light"
        ? theme.colors.white["500"]
        : theme.colors.black["500"];
  }, [colorMode]);

  return (
    <Router>
      <Switch>
        <Route path={"/"} exact>
          <Home />
        </Route>
        <Route path={"*"}>
          <NotFound />
        </Route>
      </Switch>
      <ThemeToggle />
    </Router>
  );
};

export default App;
