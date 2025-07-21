import React from "react";
import DvbMonitorWrapper from "./components/DvbMonitorWrapper";
import {ThemeProvider} from "@mui/material/styles"
import theme from "./theme/theme.js"

function App() {
  return (
    <ThemeProvider theme={theme}>
      <DvbMonitorWrapper />
    </ThemeProvider>
  );
}

export default App;
