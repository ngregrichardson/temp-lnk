import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import theme from "./themes/theme";

ReactDOM.render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={"dark"} />
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

reportWebVitals();
