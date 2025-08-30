import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Container,
  Toolbar,
  AppBar,
  Typography,
  Divider,
  Box,
  Button
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PublicIcon from "@mui/icons-material/Public";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import LogoutIcon from "@mui/icons-material/Logout";

import PopulationFetcher from "./PopulationFetcher";
import ThemePage from "./ThemePage"; // <-- Theme Context UI Page

function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePage, setActivePage] = useState(null); // null, "population", "theme"

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleMenuClick = (page) => {
    setActivePage(page);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    // Clear session data
    localStorage.clear();
    sessionStorage.clear();

    // Navigate to login or landing page
    window.location.href = "/"; // Change path if needed
  };

  return (
    <>
      {/* Top AppBar */}
      <AppBar position="sticky" sx={{ top: 0, zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {/* Menu Button */}
          <IconButton
            edge="start"
            color="inherit"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Title */}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Menu
          </Typography>

          {/* Logout Button */}
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Left Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250, bgcolor: "#f9f9f9", height: "100%" }}>
          {/* Drawer Header */}
          <Box sx={{ p: 2, bgcolor: "#1976d2", color: "white" }}>
            <Typography variant="h6" fontWeight="bold">
              📊 Data Menu
            </Typography>
          </Box>

          <Divider />
          <List>
            {/* Population Viewer Menu Item */}
            <ListItem
              button
              onClick={() => handleMenuClick("population")}
              sx={{
                "&:hover": { bgcolor: "#e3f2fd" },
              }}
            >
              <ListItemIcon>
                <PublicIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Population Viewer" />
            </ListItem>

            {/* Theme Switcher Menu Item */}
            <ListItem
              button
              onClick={() => handleMenuClick("theme")}
              sx={{
                "&:hover": { bgcolor: "#e3f2fd" },
              }}
            >
              <ListItemIcon>
                <Brightness4Icon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Theme Switcher" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Page Content */}
      <Container sx={{ mt: 4 }}>
        {activePage === "population" && <PopulationFetcher />}
        {activePage === "theme" && <ThemePage />}
      </Container>
    </>
  );
}

export default Home;
