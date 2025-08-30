import React, { useContext } from "react";
import { ThemeContext, ThemeProvider } from "./ThemeContext";
import { Button, Box, Typography } from "@mui/material";

const PageContent = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const isLight = theme === "light";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: isLight ? "#f5f5f5" : "#1e1e1e",
        color: isLight ? "black" : "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
      }}
    >
      <Typography variant="h4" gutterBottom>
        {isLight ? "☀ Light Mode" : "🌙 Dark Mode"}
      </Typography>
      <Button variant="contained" onClick={toggleTheme}>
        Toggle Theme
      </Button>
    </Box>
  );
};

export function ThemePage() {
  return (
    <ThemeProvider>
      <PageContent />
    </ThemeProvider>
  );
};

export default ThemePage;
