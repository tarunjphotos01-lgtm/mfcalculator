
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
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PublicIcon from "@mui/icons-material/Public";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import LogoutIcon from "@mui/icons-material/Logout";
import PopulationFetcher from "./PopulationFetcher";
import ThemePage from "./ThemePage";
import { ColorModeContext } from "./ThemeContext";

function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePage, setActivePage] = useState(null);

  const colorMode = useContext(ColorModeContext); // 🌙 Dark/Light toggle

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
      <AppBar position="sticky" sx={{ top: 0, zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={toggleDrawer(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Menu
          </Typography>

          {/* Dark/Light Mode Button */}
          <IconButton color="inherit" onClick={colorMode.toggleColorMode} sx={{ mr: 1 }}>
            <Brightness4Icon />
          </IconButton>

          {/* Logout Button */}
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250, bgcolor: "#f9f9f9", height: "100%" }}>
          <Box sx={{ p: 2, bgcolor: "#1976d2", color: "white" }}>
            <Typography variant="h6" fontWeight="bold">
              📊 Data Menu
            </Typography>
          </Box>
          <Divider />
          <List>
            {[
              { text: "Population Viewer", icon: <PublicIcon color="primary" />, page: "population" },
              { text: "Theme Switcher", icon: <Brightness4Icon color="primary" />, page: "theme" },
            ].map(({ text, icon, page }) => (
              <ListItem button key={page} onClick={() => handleMenuClick(page)} sx={{ "&:hover": { bgcolor: "#e3f2fd" } }}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
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




