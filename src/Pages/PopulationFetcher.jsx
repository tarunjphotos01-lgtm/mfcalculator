import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Alert
} from "@mui/material";
import PopulationForm from "./PopulationForm";
import axios from "axios";

function PopulationFetcher() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [population, setPopulation] = useState(null);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get(
          "https://countriesnow.space/api/v0.1/countries/population"
        );
        const data = res.data;
        if (!data.error && data.data) {
          setCountries(data.data);
        } else {
          setError("Failed to fetch countries");
        }
      } catch (err) {
        setError("Network error fetching countries");
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!selectedCountry) {
      setYears([]);
      setSelectedYear("");
      return;
    }
    const countryData = countries.find((c) => c.country === selectedCountry);
    if (countryData?.populationCounts) {
      setYears(countryData.populationCounts.map((item) => item.year));
    } else {
      setYears([]);
    }
  }, [selectedCountry, countries]);

  const handleSearch = () => {
    if (!selectedCountry || !selectedYear) {
      setPopulation(null);
      return;
    }
    const countryData = countries.find((c) => c.country === selectedCountry);
    const entry = countryData?.populationCounts.find(
      (item) => item.year === selectedYear
    );
    setPopulation(entry ? entry.value : "N/A");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #74ebd5, #ACB6E5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            p: 2,
            boxShadow: 8,
            borderRadius: 4,
            backdropFilter: "blur(8px)",
            background: "rgba(255, 255, 255, 0.9)"
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              gutterBottom
              align="center"
              sx={{ fontWeight: "bold" }}
            >
              🌍 Country Population Viewer
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <PopulationForm
              countries={countries}
              years={years}
              selectedCountry={selectedCountry}
              selectedYear={selectedYear}
              setSelectedCountry={setSelectedCountry}
              setSelectedYear={setSelectedYear}
              onSearch={handleSearch}
            />

            {population !== null && (
              <Box sx={{ mt: 3, textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Population in {selectedYear}:{" "}
                  <span style={{ color: "#1976d2" }}>
                    {population.toLocaleString()}
                  </span>
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default PopulationFetcher;
