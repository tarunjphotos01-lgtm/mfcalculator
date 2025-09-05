import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchCountries = createAsyncThunk(
  'population/fetchCountries',
  async () => {
    const response = await axios.get(
      'https://countriesnow.space/api/v0.1/countries/population'
    );
    return response.data.data;
  }
);

const populationSlice = createSlice({
  name: 'population',
  initialState: {
    countries: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = action.payload;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const selectCountries = (state) => state.population.countries;
export const selectLoading = (state) => state.population.loading;
export const selectError = (state) => state.population.error;

export default populationSlice.reducer;