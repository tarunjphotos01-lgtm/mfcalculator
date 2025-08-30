import React, { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../Redux/AuthSlice";

function LoginPage() {
  const [formUserId, setFormUserId] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { isLoggedIn, error } = useSelector((state) => state.auth);

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(login({ userId: formUserId, password: formPassword }));
  };

  // Redirect if login successful
  if (isLoggedIn) {
    navigate("/Home");
  }

  return (
    <Box
      className="login-bg"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #4f46e5, #9333ea)", // gradient background
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: "16px",
            textAlign: "center",
            backdropFilter: "blur(6px)",
            background: "rgba(255, 255, 255, 0.9)",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#4f46e5" }}
          >
            Login
          </Typography>

          {/* Show popup/error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              margin="normal"
              value={formUserId}
              onChange={(e) => setFormUserId(e.target.value)}
              sx={{ borderRadius: "8px" }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              margin="normal"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              sx={{ borderRadius: "8px" }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                py: 1.5,
                fontSize: "16px",
                fontWeight: "bold",
                borderRadius: "12px",
                textTransform: "none",
                background: "linear-gradient(90deg, #4f46e5, #9333ea)",
                "&:hover": {
                  background: "linear-gradient(90deg, #4338ca, #7e22ce)",
                  boxShadow: "0 8px 20px rgba(147, 51, 234, 0.4)",
                },
              }}
            >
              🚀 Login
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;
