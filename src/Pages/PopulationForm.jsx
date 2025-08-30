// src/components/PopulationForm.jsx
import React from "react";
import { FormControl, InputLabel, Select, MenuItem, Button, Box } from "@mui/material";

function PopulationForm({
  countries,
  years,
  selectedCountry,
  selectedYear,
  setSelectedCountry,
  setSelectedYear,
  onSearch
}) {
  return (
    <>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Country</InputLabel>
        <Select
          value={selectedCountry}
          label="Country"
          onChange={(e) => setSelectedCountry(e.target.value)}
        >
          {countries.map((c) => (
            <MenuItem key={c.country} value={c.country}>
              {c.country}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Year</InputLabel>
        <Select
          value={selectedYear}
          label="Year"
          onChange={(e) => setSelectedYear(e.target.value)}
          disabled={!years.length}
        >
          {years
            .slice()
            .sort((a, b) => b - a)
            .map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <Box textAlign="center" sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onSearch}
          size="large"
          sx={{ mr: 2 }}
        >
          🔍 Search Population
        </Button>
      </Box>
    </>
  );
}

export default PopulationForm;
