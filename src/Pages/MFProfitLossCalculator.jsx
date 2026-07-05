import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Divider,
  Grid,
  Button,
  IconButton,
  MenuItem,
  CircularProgress,
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
 */
const InfoTooltip = ({ title }) => (
  <InputAdornment position="end">
    <Tooltip
      arrow
      title={title}
      enterTouchDelay={0}
      leaveTouchDelay={3000}
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

// Pre-defined list of your 12 Schema Codes
const SCHEMA_CODES = [
  "120821", "120833", "120828", "120546", "120847", "120823",
  "125307", "119732", "150518", "125354", "148457", "142641"
];

/**
 * NEW: Helper function to convert messy API strings into clean Title Case.
 * It handles spaces, hyphens, and completely overrides chaotic uppercase strings.
 */
const formatSchemaName = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(/([\s\-]+)/) // Split by spaces or hyphens but retain them to keep structural formatting
    .map((word) => {
      if (word.trim().length === 0 || word === "-") return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");
};

export default function MFProfitLossCalculator() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  const [schemaCode, setSchemaCode] = useState("");
  const [schemaName, setSchemaName] = useState("");
  const [fundList, setFundList] = useState([]);
  const [isLoadingFunds, setIsLoadingFunds] = useState(true);

  const [purchaseDetails, setPurchaseDetails] = useState([
    { purchaseNav: "", units: "", purchaseDate: null },
  ]);
  
  const [currentNav, setCurrentNav] = useState("");
  const [currentDate] = useState(new Date());
  const [results, setResults] = useState(null);
  const [withTaxResults, setWithTaxResults] = useState(null);
  const [errors, setErrors] = useState([]);

  const navInputRef = useRef(null);

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================
  
  
  useEffect(() => {
    if (navInputRef.current) navInputRef.current.focus();
  }, []);

  // Fetch all 12 funds on mount
  useEffect(() => {
    const fetchAllFunds = async () => {
      setIsLoadingFunds(true);
      try {
        const promises = SCHEMA_CODES.map((code) =>
          fetch(`https://api.mfapi.in/mf/${code}/latest`).then((res) => res.json())
        );
        
        const results = await Promise.all(promises);
        
        const formattedFunds = results.map((data) => {
          if (data && data.meta && data.data && data.data.length > 0) {
            return {
              code: data.meta.scheme_code,
              // MODIFIED: Formatting the raw API scheme name to look clean and uniform
              name: formatSchemaName(data.meta.scheme_name),
              nav: data.data[0].nav,
            };
          }
          return null;
        }).filter(Boolean);

        setFundList(formattedFunds);
      } catch (error) {
        console.error("Error fetching mutual funds list:", error);
        alert("Failed to load mutual fund names. Please refresh the page.");
      } finally {
        setIsLoadingFunds(false);
      }
    };

    fetchAllFunds();
  }, []);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  const handleFundSelection = (e) => {
    const selectedCode = e.target.value;
    setSchemaCode(selectedCode);
    
    const selectedFund = fundList.find((fund) => String(fund.code) === String(selectedCode));
    
    if (selectedFund) {
      setSchemaName(selectedFund.name);
      setCurrentNav(selectedFund.nav); 
      
      setPurchaseDetails([{ purchaseNav: "", units: "", purchaseDate: null }]); 
      setResults(null); 
      setWithTaxResults(null); 
      setErrors([]); 
    }
  };

  const handlePurchaseChange = (index, field, value) => {
    const updated = [...purchaseDetails];
    updated[index][field] = value;
    setPurchaseDetails(updated);
  };

  const handleAddInvestment = () => {
    setPurchaseDetails((prev) => [
      ...prev,
      { purchaseNav: "", units: "", purchaseDate: null },
    ]);
  };

  const handleRemoveMfSet = (index) => {
    if (purchaseDetails.length === 1) return;
    const updated = purchaseDetails.filter((_, i) => i !== index);
    setPurchaseDetails(updated);
  };

  // ==========================================
  // CALCULATION & VALIDATION LOGIC
  // ==========================================

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

  const calculateCoreMetrics = () => {
    let totalInvestment = 0;
    let totalUnits = 0;

    purchaseDetails.forEach((d) => {
      if (d.purchaseNav && d.units) {
        totalInvestment += Number(d.purchaseNav) * Number(d.units);
        totalUnits += Number(d.units);
      }
    });

    if (totalUnits === 0 || totalInvestment === 0 || !purchaseDetails[0].purchaseDate) {
      return null;
    }

    const currentValue = Number(currentNav) * totalUnits;
    const gainLoss = currentValue - totalInvestment;

    const oldestPurchase = purchaseDetails.reduce((oldest, current) =>
      current.purchaseDate < oldest.purchaseDate ? current : oldest
    );

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

  const handleCalculate = () => {
    if (!validateInputs()) return;

    const metrics = calculateCoreMetrics();
    if (!metrics) return;

    const gainLossPercent = ((metrics.gainLoss / metrics.totalInvestment) * 100).toFixed(2);

    setResults({
      investment: metrics.totalInvestment.toFixed(2),
      currentValue: metrics.currentValue.toFixed(2),
      gainLoss: metrics.gainLoss.toFixed(2),
      gainLossPercent,
      holdingPeriod: metrics.holdingPeriod,
    });
    
    setWithTaxResults(null);
  };

  const handleCalculateWithTax = () => {
    if (!validateInputs()) return;

    const metrics = calculateCoreMetrics();
    if (!metrics) return;

    const months = differenceInMonths(currentDate, metrics.oldestDate);
    const taxRate = months < 12 ? 20 : 12.5;

    let taxAmount = 0;
    let finalGain = metrics.gainLoss;

    if (metrics.gainLoss > 0) {
      taxAmount = (metrics.gainLoss * taxRate) / 100;
      finalGain = metrics.gainLoss - taxAmount;
    }

    setWithTaxResults({
      taxRate,
      investment: metrics.totalInvestment.toFixed(2),
      currentValue: metrics.currentValue.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      finalGain: finalGain.toFixed(2),
      holdingPeriod: metrics.holdingPeriod,
    });
    
    setResults(null);
  };

  const handleReset = () => {
    setSchemaCode("");     
    setSchemaName("");     
    setPurchaseDetails([{ purchaseNav: "", units: "", purchaseDate: null }]);
    setCurrentNav("");
    setResults(null);
    setWithTaxResults(null);
    setErrors([]);
    if (navInputRef.current) navInputRef.current.focus();
  };

  // ==========================================
  // RENDER (JSX)
  // ==========================================
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ background: "linear-gradient(135deg,#063970,#16b7c8)", p: 2, pb: 6 }}
      >
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

          {/* Dropdown Menu displaying actual Fund Names */}
          <Box sx={{ mb: 3 }}>
            <TextField
              select
              label="Select Mutual Fund"
              value={schemaCode}
              onChange={handleFundSelection}
              fullWidth
              disabled={isLoadingFunds}
              InputProps={{
                startAdornment: isLoadingFunds ? (
                  <CircularProgress size={20} sx={{ mr: 2 }} />
                ) : null,
              }}
              helperText={isLoadingFunds ? "Loading mutual funds..." : ""}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: { maxWidth: "90vw" }
                  }
                }
              }}
            >
              {fundList.map((fund) => (
                <MenuItem 
                  key={fund.code} 
                  value={fund.code}
                  sx={{ 
                    whiteSpace: "normal", 
                    wordBreak: "break-word",
                    py: 1.5,
                    fontSize: { xs: "14px", sm: "15px" },
                    lineHeight: 1.3
                  }}
                >
                  {fund.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* DYNAMIC MF INPUT ROWS */}
          {purchaseDetails.map((detail, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" }, 
                alignItems: { xs: "stretch", sm: "center" },
                gap: 2,
                mb: 2,
                width: "100%",
              }}
            >
              <TextField
                sx={{ flex: 1 }}
                label={`Purchased NAV (${index + 1})`}
                type="number"
                value={detail.purchaseNav}
                error={errors.includes(`${index}-nav`)}
                helperText={errors.includes(`${index}-nav`) ? "NAV is required" : ""}
                onChange={(e) => handlePurchaseChange(index, "purchaseNav", e.target.value)}
                inputRef={index === 0 ? navInputRef : null}
                InputProps={{
                  endAdornment: (
                    <InfoTooltip title="Enter the NAV (Net Asset Value) at which you purchased the mutual fund units." />
                  ),
                }}
              />

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
                    <InfoTooltip title="Enter the total number of mutual fund units alloted." />
                  ),
                }}
              />

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
                  disabled={purchaseDetails.length === 1}
                  sx={{ flexShrink: 0 }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
          ))}

          {/* Add Investment Button */}
          <Button 
            variant="outlined" 
            onClick={handleAddInvestment} 
            sx={{ mb: 3 }}
          >
            + Add Investment
          </Button>

          {/* CURRENT VALUE BLOCK */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Current NAV (Fetched Automatically)"
                type="number"
                value={currentNav}
                error={errors.includes("current-nav")}
                helperText={errors.includes("current-nav") ? "Select a scheme to get current NAV" : ""}
                fullWidth
                disabled
                InputProps={{
                  endAdornment: (
                    <InfoTooltip title="The latest NAV automatically fetched from the mutual fund API." />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
          {results && (
            <Box mt={4} p={3} textAlign="center" borderRadius="12px" border="1px solid #e0e0e0">
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                Results
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography><strong>Investment:</strong> ₹{results.investment}</Typography>
              <Typography><strong>Current Value:</strong> ₹{results.currentValue}</Typography>
              <Typography sx={{ fontWeight: "bold", color: Number(results.gainLoss) >= 0 ? "green" : "red" }}>
                {Number(results.gainLoss) >= 0 ? "Profit" : "Loss"}: ₹{results.gainLoss} ({results.gainLossPercent}%)
              </Typography>
              {results.holdingPeriod && (
                <Typography variant="caption" color="text.secondary">Holding Period: {results.holdingPeriod}</Typography>
              )}
            </Box>
          )}

          {/* TAX RESULTS UI */}
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