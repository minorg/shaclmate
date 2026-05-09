import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";

/**
 * Customize form so each control has more space
 */
const theme = createTheme({
  components: {
    MuiFormControl: {
      styleOverrides: {
        root: {
          margin: "0.8em 0",
        },
      },
    },
  },
});

const rootEl = document.getElementById("root");

if (!rootEl) throw new Error("Failed to find the root element");

createRoot(rootEl).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
