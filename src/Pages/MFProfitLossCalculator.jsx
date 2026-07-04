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
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";

/**
 * Reusable Tooltip Component
 * Keeps the main JSX clean by abstracting the complex tooltip styling.
 * Used to show helpful information icons inside input fields.
 */
const InfoTooltip = ({ title }) => (
  <InputAdornment position="end">
    <Tooltip
      arrow
      title={title}
      enterTouchDelay={0} // Shows instantly on touch devices
      leaveTouchDelay={3000} // Stays visible for a moment after touch
      slotProps={{
        tooltip: {
          sx: { bgcolor: "#000", color: "#fff", fontSize: "13px", p: 1, borderRadius: "8px" },
        },
        arrow: { sx: { color: "#000" } },
      }}
    >
      <InfoOutlinedIcon fontSize="medium" sx={{ color: "#1976d2", cursor: "pointer" }} />
    </Tooltip>
  </InputAdornment>
);

export default function MFProfitLossCalculator() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  // Tracks how many sets of mutual fund inputs are currently active (Dropdown value)
  const [mfSetCount, setMfSetCount] = useState(1);
  
  // Array of objects holding the data for each mutual fund purchase row
  const [purchaseDetails, setPurchaseDetails] = useState([
    { purchaseNav: "", units: "", purchaseDate: null },
  ]);
  
  // Stores the latest NAV value to calculate current worth
  const [currentNav, setCurrentNav] = useState("");
  
  // Static state for today's date, used to calculate holding periods and taxes
  const [currentDate] = useState(new Date());
  
  // Stores the results for the standard Calculate button
  const [results, setResults] = useState(null);
  
  // Stores the results for the Calculate with Tax button
  const [withTaxResults, setWithTaxResults] = useState(null);
  
  // Array of string keys representing which fields currently have validation errors
  const [errors, setErrors] = useState([]);

  // Reference to the very first NAV input field so we can auto-focus it
  const navInputRef = useRef(null);

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================
  
  // Runs once when the component first loads to focus the user's cursor on the first input
  useEffect(() => {
    if (navInputRef.current) navInputRef.current.focus();
  }, []);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  /**
   * Updates a specific field (NAV, Units, or Date) in a specific row.
   * @param {number} index - The row number being edited.
   * @param {string} field - The name of the property being changed.
   * @param {any} value - The new value typed/selected by the user.
   */
  const handlePurchaseChange = (index, field, value) => {
    const updated = [...purchaseDetails];
    updated[index][field] = value;
    setPurchaseDetails(updated);
  };

  /**
   * Handles changing the total number of MF Sets from the dropdown menu.
   * Adds empty rows if the number increases, or removes rows if it decreases.
   */
  const handleMfSetChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setMfSetCount(count);

    setPurchaseDetails((prev) => {
      const updated = [...prev];
      // If the user selected a higher number, push new empty objects
      while (updated.length < count) {
        updated.push({ purchaseNav: "", units: "", purchaseDate: null });
      }
      // Return exactly the amount requested (slices off extras if they selected a lower number)
      return updated.slice(0, count);
    });
  };

  /**
   * Removes a specific mutual fund input row when the user clicks the delete (X) icon.
   * @param {number} index - The index of the row to remove.
   */
  const handleRemoveMfSet = (index) => {
    if (purchaseDetails.length === 1) return; // Prevent deleting the very last row
    
    // Filter out the row that matches the clicked index
    const updated = purchaseDetails.filter((_, i) => i !== index);
    setPurchaseDetails(updated);
    setMfSetCount(updated.length); // Keep the dropdown sync'd with the row count
  };

  // ==========================================
  // CALCULATION & VALIDATION LOGIC
  // ==========================================

  /**
   * Checks all fields to ensure they are not empty before calculating.
   * Updates the `errors` state array with specific IDs so the UI turns red.
   * @returns {boolean} True if all inputs are valid, False otherwise.
   */
  const validateInputs = () => {
    const validationErrors = [];
    purchaseDetails.forEach((d, index) => {
      if (!d.purchaseNav) validationErrors.push(`${index}-nav`);
      if (!d.units) validationErrors.push(`${index}-units`);
      if (!d.purchaseDate) validationErrors.push(`${index}-date`);
    });
    if (!currentNav) validationErrors.push("current-nav");

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  /**
   * Shared helper function that calculates the base financial metrics
   * (Total Investment, Current Value, Gain/Loss, Holding Period).
   * Used by both standard and tax calculations.
   */
  const calculateCoreMetrics = () => {
    let totalInvestment = 0;
    let totalUnits = 0;

    // Sum up the total money invested and the total units accumulated
    purchaseDetails.forEach((d) => {
      if (d.purchaseNav && d.units) {
        totalInvestment += Number(d.purchaseNav) * Number(d.units);
        totalUnits += Number(d.units);
      }
    });

    // Guard clause: stop if inputs are zero/invalid
    if (totalUnits === 0 || totalInvestment === 0 || !purchaseDetails[0].purchaseDate) {
      return null;
    }

    const currentValue = Number(currentNav) * totalUnits;
    const gainLoss = currentValue - totalInvestment;

    // Find the oldest purchase date to calculate total holding period
    const oldestPurchase = purchaseDetails.reduce((oldest, current) =>
      current.purchaseDate < oldest.purchaseDate ? current : oldest
    );

    // Calculate exact years, months, and days from the oldest purchase to today
    const { years = 0, months = 0, days = 0 } = intervalToDuration({
      start: oldestPurchase.purchaseDate,
      end: currentDate,
    });

    return {
      totalInvestment,
      currentValue,
      gainLoss,
      oldestDate: oldestPurchase.purchaseDate,
      holdingPeriod: `${years} year(s) ${months} month(s) ${days} day(s)`,
    };
  };

  /**
   * Triggered by the "Calculate" button.
   * Generates standard Profit/Loss results without tax implications.
   */
  const handleCalculate = () => {
    if (!validateInputs()) return;

    const metrics = calculateCoreMetrics();
    if (!metrics) return;

    // Calculate the percentage of gain or loss
    const gainLossPercent = ((metrics.gainLoss / metrics.totalInvestment) * 100).toFixed(2);

    // Save to state to render the Standard Results block
    setResults({
      investment: metrics.totalInvestment.toFixed(2),
      currentValue: metrics.currentValue.toFixed(2),
      gainLoss: metrics.gainLoss.toFixed(2),
      gainLossPercent,
      holdingPeriod: metrics.holdingPeriod,
    });
    
    // Clear out the tax results if they were previously calculated
    setWithTaxResults(null);
  };

  /**
   * Triggered by the "Calculate with Tax" button.
   * Applies tax rules (e.g., Short Term vs Long Term Capital Gains) based on holding period.
   */
  const handleCalculateWithTax = () => {
    if (!validateInputs()) return;

    const metrics = calculateCoreMetrics();
    if (!metrics) return;

    // Determine tax rate based on holding months (e.g., < 12 months = STCG, > 12 = LTCG)
    const months = differenceInMonths(currentDate, metrics.oldestDate);
    const taxRate = months < 12 ? 20 : 12.5;

    let taxAmount = 0;
    let finalGain = metrics.gainLoss;

    // Only apply taxes if there is actually a profit
    if (metrics.gainLoss > 0) {
      taxAmount = (metrics.gainLoss * taxRate) / 100;
      finalGain = metrics.gainLoss - taxAmount;
    }

    // Save to state to render the Tax Results block
    setWithTaxResults({
      taxRate,
      investment: metrics.totalInvestment.toFixed(2),
      currentValue: metrics.currentValue.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      finalGain: finalGain.toFixed(2),
      holdingPeriod: metrics.holdingPeriod,
    });
    
    // Clear out the standard results if they were previously calculated
    setResults(null);
  };

  /**
   * Resets the entire form back to its default, empty state.
   */
  const handleReset = () => {
    setMfSetCount(1);
    setPurchaseDetails([{ purchaseNav: "", units: "", purchaseDate: null }]);
    setCurrentNav("");
    setResults(null);
    setWithTaxResults(null);
    setErrors([]);
    // Put the user's cursor back on the first input
    if (navInputRef.current) navInputRef.current.focus();
  };

  // ==========================================
  // RENDER (JSX)
  // ==========================================
  return (
    // LocalizationProvider is required for MUI DatePickers to format dates properly
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {/* Outer wrapper: Full height background with a gradient */}
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ background: "linear-gradient(135deg,#063970,#16b7c8)", p: 2, pb: 6 }}
      >
        {/* Main white card container */}
        <Paper
          sx={{
            p: { xs: 2, sm: 4 },
            width: "100%",
            maxWidth: 850,
            borderRadius: 4,
            boxSizing: "border-box",
          }}
        >
          <Typography variant="h5" align="center" fontWeight="bold">
            Mutual Fund Profit & Loss Calculator
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Dropdown to select how many MF rows to show */}
          <TextField
            select
            label="Select MF Set"
            value={mfSetCount}
            onChange={handleMfSetChange}
            fullWidth
            sx={{ mb: 3 }}
          >
            {[...Array(5)].map((_, i) => (
              <MenuItem key={i + 1} value={i + 1}>
                MF Set {i + 1}
              </MenuItem>
            ))}
          </TextField>

          {/* DYNAMIC MF INPUT ROWS */}
          {/* Loops through the purchaseDetails array and renders a row for each object */}
          {purchaseDetails.map((detail, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" }, // Stack vertically on mobile, horizontally on tablet+
                alignItems: { xs: "stretch", sm: "center" },
                gap: 2,
                mb: 2,
                width: "100%",
              }}
            >
              {/* Field 1: Purchased NAV */}
              <TextField
                sx={{ flex: 1 }}
                label={`Purchased NAV (${index + 1})`}
                type="number"
                value={detail.purchaseNav}
                error={errors.includes(`${index}-nav`)} // Turns red if this ID is in the error array
                helperText={errors.includes(`${index}-nav`) ? "NAV is required" : ""}
                onChange={(e) => handlePurchaseChange(index, "purchaseNav", e.target.value)}
                inputRef={index === 0 ? navInputRef : null} // Only attach the ref to the very first row
                InputProps={{
                  endAdornment: (
                    <InfoTooltip title="Enter the NAV (Net Asset Value) at which you purchased the mutual fund units. You can find it in your mutual fund statement or transaction history." />
                  ),
                }}
              />

              {/* Field 2: Alloted Units */}
              <TextField
                sx={{ flex: 1 }}
                label="Alloted Units"
                type="number"
                value={detail.units}
                error={errors.includes(`${index}-units`)}
                helperText={errors.includes(`${index}-units`) ? "Units are required" : ""}
                onChange={(e) => handlePurchaseChange(index, "units", e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InfoTooltip title="Enter the total number of mutual fund units alloted. You can find this in your mutual fund statement." />
                  ),
                }}
              />

              {/* Field 3: Date Picker & Delete Button Grouped */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                <DatePicker
                  sx={{ flexGrow: 1 }}
                  label="Purchase Date"
                  value={detail.purchaseDate}
                  onChange={(date) => handlePurchaseChange(index, "purchaseDate", date)}
                  slotProps={{
                    textField: {
                      error: errors.includes(`${index}-date`),
                      helperText: errors.includes(`${index}-date`) ? "Date is required" : "",
                    },
                  }}
                />
                <IconButton
                  color="error"
                  onClick={() => handleRemoveMfSet(index)}
                  disabled={purchaseDetails.length === 1} // Can't delete if it's the only row left
                  sx={{ flexShrink: 0 }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
          ))}

          {/* CURRENT VALUE BLOCK */}
          {/* Inputs for Current NAV and Current Date */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Current NAV"
                type="number"
                value={currentNav}
                error={errors.includes("current-nav")}
                helperText={errors.includes("current-nav") ? "Current NAV is required" : ""}
                onChange={(e) => {
                  setCurrentNav(e.target.value);
                  // Instantly clear the error state for this field as soon as they start typing
                  if (e.target.value) {
                    setErrors((prev) => prev.filter((err) => err !== "current-nav"));
                  }
                }}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InfoTooltip title="Enter the latest NAV (Net Asset Value) of your mutual fund to calculate current investment value." />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              {/* This date picker is disabled because it strictly shows "Today" */}
              <DatePicker
                label="Current Date"
                value={currentDate}
                disabled
                renderInput={(params) => <TextField {...params} fullWidth disabled />}
              />
            </Grid>
          </Grid>

          {/* ACTION BUTTONS */}
          <Box mt={4} display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="center" gap={2}>
            <Button variant="contained" onClick={handleCalculate}>
              Calculate
            </Button>
            <Button variant="contained" color="secondary" onClick={handleCalculateWithTax}>
              Calculate with Tax
            </Button>
            <Button variant="outlined" color="error" onClick={handleReset}>
              Reset
            </Button>
          </Box>

          {/* STANDARD RESULTS UI */}
          {/* Only renders if the 'results' state is populated */}
          {results && (
            <Box mt={4} p={3} textAlign="center" borderRadius="12px" border="1px solid #e0e0e0">
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                Results
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography><strong>Investment:</strong> ₹{results.investment}</Typography>
              <Typography><strong>Current Value:</strong> ₹{results.currentValue}</Typography>
              {/* Color the text green if profit, red if loss */}
              <Typography sx={{ fontWeight: "bold", color: Number(results.gainLoss) >= 0 ? "green" : "red" }}>
                {Number(results.gainLoss) >= 0 ? "Profit" : "Loss"}: ₹{results.gainLoss} ({results.gainLossPercent}%)
              </Typography>
              {results.holdingPeriod && (
                <Typography variant="caption" color="text.secondary">Holding Period: {results.holdingPeriod}</Typography>
              )}
            </Box>
          )}

          {/* TAX RESULTS UI */}
          {/* Only renders if the 'withTaxResults' state is populated */}
          {withTaxResults && (
            <Box mt={4} p={3} textAlign="center" borderRadius="12px" border="1px solid #e0e0e0">
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#d32f2f" }}>
                With Tax Results
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography>Tax Rate: {withTaxResults.taxRate}%</Typography>
              <Typography><strong>Investment:</strong> ₹{withTaxResults.investment}</Typography>
              <Typography><strong>Current Value:</strong> ₹{withTaxResults.currentValue}</Typography>
              <Typography>Tax Amount: ₹{withTaxResults.taxAmount}</Typography>
              {/* Color the text green if profit, red if loss */}
              <Typography sx={{ fontWeight: "bold", color: Number(withTaxResults.finalGain) >= 0 ? "green" : "red" }}>
                Final {Number(withTaxResults.finalGain) >= 0 ? "Profit" : "Loss"}: ₹{withTaxResults.finalGain}
              </Typography>
              {withTaxResults.holdingPeriod && (
                <Typography variant="caption" color="text.secondary">Holding Period: {withTaxResults.holdingPeriod}</Typography>
              )}
            </Box>
          )}
        </Paper>

        {/* STICKY FOOTER */}
        <Box
          position="fixed"
          bottom={0}
          left={0}
          width="100%"
          textAlign="center"
          sx={{
            backgroundColor: "black",
            color: "white",
            fontSize: "13px",
            padding: "8px 0",
            borderTop: "2px solid #222",
            zIndex: 10,
          }}
        >
          © {new Date().getFullYear()} Mutual Fund Profit & Loss Calculator. All Rights Reserved.
        </Box>
      </Box>
    </LocalizationProvider>
  );
}