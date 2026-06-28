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

export default function MFProfitLossCalculator() {
  const [mfSetCount, setMfSetCount] = useState(1);
  const [purchaseDetails, setPurchaseDetails] = useState([
    { purchaseNav: "", units: "", purchaseDate: null },
  ]);
  const [currentNav, setCurrentNav] = useState("");
  const [currentDate] = useState(new Date());
  const [results, setResults] = useState(null);
  const [withTaxResults, setWithTaxResults] = useState(null);
  const [errors, setErrors] = useState([]);

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
     let validationErrors = [];

    purchaseDetails.forEach((d, index) => {

      if (!d.purchaseNav) {
        validationErrors.push(`${index}-nav`);
      }

      if (!d.units) {
        validationErrors.push(`${index}-units`);
      }

      if (!d.purchaseDate) {
        validationErrors.push(`${index}-date`);
      }
    });

       if(!currentNav){
         validationErrors.push("current-nav");
        }

    if(validationErrors.length > 0){
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
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
    const oldestPurchase = purchaseDetails.reduce((oldest, current) => {
          return current.purchaseDate < oldest.purchaseDate ? current : oldest;
     });
      const { years = 0, months = 0, days = 0 } = intervalToDuration({
        start: oldestPurchase.purchaseDate,
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
 let holdingPeriod = null;
    if (purchaseDetails[0].purchaseDate) {
    const oldestPurchase = purchaseDetails.reduce((oldest, current) => {
          return current.purchaseDate < oldest.purchaseDate ? current : oldest;
     });
      const { years = 0, months = 0, days = 0 } = intervalToDuration({
        start: oldestPurchase.purchaseDate,
        end: currentDate,
      });
      holdingPeriod = `${years} year(s) ${months} month(s) ${days} day(s)`;
    }
    setWithTaxResults({
      taxRate,
      investment: totalInvestment.toFixed(2),
      currentValue: currentValue.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      finalGain: finalGain.toFixed(2),
      holdingPeriod,
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
        sx={{ background: "linear-gradient(135deg,#063970,#16b7c8)", p: 2 }}
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
            {[...Array(2)].map((_, i) => (
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
  label={`Purchased NAV (${index + 1})`}
  type="number"
  value={detail.purchaseNav}
  error={errors.includes(`${index}-nav`)}
  helperText={
    errors.includes(`${index}-nav`)
      ? "NAV is required"
      : ""
  }
  onChange={(e) =>
    handlePurchaseChange(index, "purchaseNav", e.target.value)
  }
  fullWidth
  inputRef={index === 0 ? navInputRef : null}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <Tooltip
          arrow
          title="Enter the NAV (Net Asset Value) at which you purchased the mutual fund units. You can find it in your mutual fund statement or transaction history."
        
          slotProps={{
    tooltip: {
      sx: {
        bgcolor: "#000000",
        color: "#ffffff",
        fontSize: "13px",
        padding: "10px",
        borderRadius: "8px",
      },
    },
    arrow: {
      sx: {
        color: "#000000",
      },
    },
  }}
        >
          <InfoOutlinedIcon
            fontSize="small"
            sx={{
              color: "#1976d2",
              cursor: "pointer"
            }}
          />
        </Tooltip>
      </InputAdornment>
    )
  }}
/>
              </Grid>

              <Grid item xs={3}>
               <TextField
  label="Alloted Units"
  type="number"
  value={detail.units}
  error={errors.includes(`${index}-units`)}
  helperText={
    errors.includes(`${index}-units`)
      ? "Units are required"
      : ""
  }
  onChange={(e) =>
    handlePurchaseChange(index, "units", e.target.value)
  }
  fullWidth
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <Tooltip
          arrow
          title="Enter the total number of mutual fund units alloted. You can find this in your mutual fund statement."
          slotProps={{
    tooltip: {
      sx: {
        bgcolor: "#000000",
        color: "#ffffff",
        fontSize: "13px",
        padding: "10px",
        borderRadius: "8px",
      },
    },
    arrow: {
      sx: {
        color: "#000000",
      },
    },
  }}
        >
          <InfoOutlinedIcon
            fontSize="small"
            sx={{
              color: "#1976d2",
              cursor: "pointer"
            }}
          />
        </Tooltip>
      </InputAdornment>
    )
  }}
/>
              </Grid>

              <Grid item xs={4}>
                <DatePicker
                  label="Purchase Date"
                  value={detail.purchaseDate}
                  onChange={(date) =>
                    handlePurchaseChange(index, "purchaseDate", date)
                  }
                   slotProps={{ textField:{fullWidth:true,
                              error: errors.includes(`${index}-date`),helperText:
                              errors.includes(`${index}-date`)? "Date is required": ""}
                             }}
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
  error={errors.includes("current-nav")}
  helperText={
    errors.includes("current-nav")
      ? "Current NAV is required"
      : ""
  }
  onChange={(e) => {
    setCurrentNav(e.target.value);

    if (e.target.value) {
      setErrors(errors.filter((err) => err !== "current-nav"));
    }
  }}
  fullWidth
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <Tooltip
  arrow
  title="Enter the latest NAV (Net Asset Value) of your mutual fund to calculate current investment value."
  slotProps={{
    tooltip: {
      sx: {
        bgcolor: "#000000",
        color: "#ffffff",
        fontSize: "13px",
        padding: "10px",
        borderRadius: "8px",
      },
    },
    arrow: {
      sx: {
        color: "#000000",
      },
    },
  }}
>
          <InfoOutlinedIcon
            fontSize="small"
            sx={{
              color: "#1976d2",
              cursor: "pointer"
            }}
          />
        </Tooltip>
      </InputAdornment>
    )
  }}
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
                <strong>Investment:</strong> ₹{withTaxResults.investment}
              </Typography>
              <Typography>
                <strong>Current Value:</strong> ₹{withTaxResults.currentValue}
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
                {withTaxResults.holdingPeriod && (
                <Typography variant="caption" color="text.secondary">
                  Holding Period: {withTaxResults.holdingPeriod}
                </Typography>
              )}
            </Box>
          )}
                </Paper>

        <Box
  position="fixed"
  bottom={0}
  left='9px'
  width="99%"
  textAlign="center"
  sx={{
    backgroundColor: "black",
    color: "white",
    fontSize: "13px",
    padding: "8px 0",
    borderTop: "2px solid black"
  }}
>
          © {new Date().getFullYear()} Mutual Fund Profit & Loss Calculator. All Rights Reserved.
        </Box>
      </Box>
    </LocalizationProvider>
  );
}