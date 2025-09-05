import React, { useContext } from "react";
import { Button } from "@mui/material";
import { ColorModeContext } from "./ThemeContext";
import { useTheme } from "@mui/material/styles";

function ThemePage() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  return (
    <div>
      <h2>Theme Page</h2>
      <Button variant="contained" onClick={colorMode.toggleColorMode}>
        Switch to {theme.palette.mode === "light" ? "Dark" : "Light"} Mode
      </Button>
    </div>
  );
}

export default ThemePage;
