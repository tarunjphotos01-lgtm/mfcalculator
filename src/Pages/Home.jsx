import React, { useState, useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Box,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import PublicIcon from "@mui/icons-material/Public";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import LogoutIcon from "@mui/icons-material/Logout";
import CalculateIcon from "@mui/icons-material/Calculate";

import PopulationFetcher from "./PopulationFetcher";
import ThemePage from "./ThemePage";
import  MFProfitLossCalculator  from "./MFProfitLossCalculator";
import { ColorModeContext } from "./ThemeContext";

function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePage, setActivePage] = useState(null);

  const colorMode = useContext(ColorModeContext);

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const handleMenuClick = (page) => {
    setActivePage(page);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  return (
    <>
      {/* AppBar */}
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>

          <IconButton color="inherit" onClick={colorMode.toggleColorMode}>
            <Brightness4Icon />
          </IconButton>

          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 260 }}>
          <Box sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
            <Typography variant="h6">📊 Data Menu</Typography>
          </Box>

          <Divider />

          <List>
            <ListItemButton onClick={() => handleMenuClick("population")}>
              <ListItemIcon>
                <PublicIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Population Viewer" />
            </ListItemButton>

            <ListItemButton onClick={() => handleMenuClick("MFCalculator")}>
              <ListItemIcon>
                <CalculateIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="MF Profit / Loss Calculator" />
            </ListItemButton>

            <ListItemButton onClick={() => handleMenuClick("theme")}>
              <ListItemIcon>
                <Brightness4Icon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Theme Switcher" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      {/* Page Content */}
      <Container sx={{ mt: 4 }}>
        {activePage === "population" && <PopulationFetcher />}
        {activePage === "MFCalculator" && <MFProfitLossCalculator />}
        {activePage === "theme" && <ThemePage />}
      </Container>
    </>
  );
}

export default Home;
