import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Divider,
  Grid,
  Button,
  MenuItem,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { intervalToDuration, differenceInMonths } from "date-fns";

export default function MFProfitLossCalculator() {
  const [mfSetCount, setMfSetCount] = useState(1);
  const [purchaseDetails, setPurchaseDetails] = useState([
    { purchaseNav: "", units: "", purchaseDate: null },
  ]);
  const [currentNav, setCurrentNav] = useState("");
  const [currentDate] = useState(new Date());
  const [results, setResults] = useState(null);
  const [withTaxResults, setWithTaxResults] = useState(null);

  const navInputRef = useRef(null);

  useEffect(() => {
    if (navInputRef.current) navInputRef.current.focus();
  }, []);

  // Handle MF input changes
  const handlePurchaseChange = (index, field, value) => {
    const updated = [...purchaseDetails];
    updated[index][field] = value;
    setPurchaseDetails(updated);
  };

  // MF set dropdown
  const handleMfSetChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setMfSetCount(count);

    let updated = [...purchaseDetails];
    while (updated.length < count) {
      updated.push({ purchaseNav: "", units: "", purchaseDate: null });
    }
    setPurchaseDetails(updated.slice(0, count));
  };

  // Remove MF set
  const handleRemoveMfSet = (index) => {
    if (purchaseDetails.length === 1) return;

    const updated = purchaseDetails.filter((_, i) => i !== index);
    setPurchaseDetails(updated);
    setMfSetCount(updated.length);
  };

  // Calculate (no tax)
  const handleCalculate = () => {
    let totalInvestment = 0;
    let totalUnits = 0;

    purchaseDetails.forEach((d) => {
      if (d.purchaseNav && d.units) {
        totalInvestment += Number(d.purchaseNav) * Number(d.units);
        totalUnits += Number(d.units);
      }
    });

    if (!currentNav || totalUnits === 0 || totalInvestment === 0) return;

    const currentValue = Number(currentNav) * totalUnits;
    const gainLoss = currentValue - totalInvestment;
    const gainLossPercent = (
      (gainLoss / totalInvestment) *
      100
    ).toFixed(2);

    let holdingPeriod = null;
    if (purchaseDetails[0].purchaseDate) {
      const { years = 0, months = 0, days = 0 } = intervalToDuration({
        start: purchaseDetails[0].purchaseDate,
        end: currentDate,
      });
      holdingPeriod = `${years} year(s) ${months} month(s) ${days} day(s)`;
    }

    setResults({
      investment: totalInvestment.toFixed(2),
      currentValue: currentValue.toFixed(2),
      gainLoss: gainLoss.toFixed(2),
      gainLossPercent,
      holdingPeriod,
    });
    setWithTaxResults(null);
  };

  // Calculate with tax
  const handleCalculateWithTax = () => {
    let totalInvestment = 0;
    let totalUnits = 0;

    purchaseDetails.forEach((d) => {
      if (d.purchaseNav && d.units) {
        totalInvestment += Number(d.purchaseNav) * Number(d.units);
        totalUnits += Number(d.units);
      }
    });

    if (!currentNav || totalUnits === 0 || totalInvestment === 0) return;
    if (!purchaseDetails[0].purchaseDate) return;

    const currentValue = Number(currentNav) * totalUnits;
    const gainLoss = currentValue - totalInvestment;

    const months = differenceInMonths(
      currentDate,
      purchaseDetails[0].purchaseDate
    );
    const taxRate = months < 12 ? 20 : 12.5;

    let taxAmount = 0;
    let finalGain = gainLoss;

    if (gainLoss > 0) {
      taxAmount = (gainLoss * taxRate) / 100;
      finalGain = gainLoss - taxAmount;
    }

    setWithTaxResults({
      taxRate,
      taxAmount: taxAmount.toFixed(2),
      finalGain: finalGain.toFixed(2),
    });
  };

  // Reset
  const handleReset = () => {
    setMfSetCount(1);
    setPurchaseDetails([{ purchaseNav: "", units: "", purchaseDate: null }]);
    setCurrentNav("");
    setResults(null);
    setWithTaxResults(null);
    if (navInputRef.current) navInputRef.current.focus();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ background: "linear-gradient(135deg,#6dd5ed,#2193b0)", p: 2 }}
      >
        <Paper sx={{ p: 4, width: 850, borderRadius: 4 }}>
          <Typography variant="h5" align="center" fontWeight="bold">
            Mutual Fund Profit & Loss Calculator
          </Typography>

          <Divider sx={{ my: 3 }} />

          <TextField
            select
            label="Select MF Set"
            value={mfSetCount}
            onChange={handleMfSetChange}
            fullWidth
            sx={{ mb: 3 }}
          >
            {[...Array(20)].map((_, i) => (
              <MenuItem key={i + 1} value={i + 1}>
                MF Set {i + 1}
              </MenuItem>
            ))}
          </TextField>

          {purchaseDetails.map((detail, index) => (
            <Grid
              container
              spacing={2}
              alignItems="center"
              key={index}
              sx={{ mb: 2 }}
            >
              <Grid item xs={3}>
                <TextField
                  label={`Purchase NAV (${index + 1})`}
                  type="number"
                  value={detail.purchaseNav}
                  onChange={(e) =>
                    handlePurchaseChange(index, "purchaseNav", e.target.value)
                  }
                  fullWidth
                  inputRef={index === 0 ? navInputRef : null}
                />
              </Grid>

              <Grid item xs={3}>
                <TextField
                  label="Units"
                  type="number"
                  value={detail.units}
                  onChange={(e) =>
                    handlePurchaseChange(index, "units", e.target.value)
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={4}>
                <DatePicker
                  label="Purchase Date"
                  value={detail.purchaseDate}
                  onChange={(date) =>
                    handlePurchaseChange(index, "purchaseDate", date)
                  }
                  renderInput={(params) => (
                    <TextField {...params} fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={1}>
                <IconButton
                  color="error"
                  onClick={() => handleRemoveMfSet(index)}
                  disabled={purchaseDetails.length === 1}
                >
                  <CloseIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <TextField
                label="Current NAV"
                type="number"
                value={currentNav}
                onChange={(e) => setCurrentNav(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <DatePicker
                label="Current Date"
                value={currentDate}
                disabled
                renderInput={(params) => (
                  <TextField {...params} fullWidth disabled />
                )}
              />
            </Grid>
          </Grid>

          <Box textAlign="center" mt={3}>
            <Button variant="contained" onClick={handleCalculate} sx={{ mx: 1 }}>
              Calculate
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCalculateWithTax}
              sx={{ mx: 1 }}
            >
              Calculate with Tax
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleReset}
              sx={{ mx: 1 }}
            >
              Reset
            </Button>
          </Box>

          {/* Results */}
          {results && (
            <Box
              mt={4}
              p={3}
              textAlign="center"
              borderRadius="12px"
              border="1px solid #e0e0e0"
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#1976d2" }}
              >
                Results
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography>
                <strong>Investment:</strong> ₹{results.investment}
              </Typography>
              <Typography>
                <strong>Current Value:</strong> ₹{results.currentValue}
              </Typography>
              <Typography
                sx={{
                  fontWeight: "bold",
                  color:
                    Number(results.gainLoss) >= 0 ? "green" : "red",
                }}
              >
                {Number(results.gainLoss) >= 0 ? "Profit" : "Loss"}: ₹
                {results.gainLoss} ({results.gainLossPercent}%)
              </Typography>
              {results.holdingPeriod && (
                <Typography variant="caption" color="text.secondary">
                  Holding Period: {results.holdingPeriod}
                </Typography>
              )}
            </Box>
          )}

          {/* With Tax Results */}
          {withTaxResults && (
            <Box
              mt={3}
              p={3}
              textAlign="center"
              borderRadius="12px"
              border="1px solid #e0e0e0"
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#d32f2f" }}
              >
                With Tax Results
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography>
                Tax Rate: {withTaxResults.taxRate}%
              </Typography>
              <Typography>
                Tax Amount: ₹{withTaxResults.taxAmount}
              </Typography>
              <Typography
                sx={{
                  fontWeight: "bold",
                  color:
                    Number(withTaxResults.finalGain) >= 0
                      ? "green"
                      : "red",
                }}
              >
                Final{" "}
                {Number(withTaxResults.finalGain) >= 0
                  ? "Profit"
                  : "Loss"}
                : ₹{withTaxResults.finalGain}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}
