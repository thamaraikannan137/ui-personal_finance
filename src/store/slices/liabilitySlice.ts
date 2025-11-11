import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Liability, LiabilityCreateInput, LiabilityUpdateInput } from '../../types';
import { liabilityService } from '../../services/liabilityService';

interface LiabilityState {
  items: Liability[];
  selectedLiability: Liability | null;
  loading: boolean;
  error: string | null;
}

const initialState: LiabilityState = {
  items: [],
  selectedLiability: null,
  loading: false,
  error: null,
};

export const fetchLiabilities = createAsyncThunk('liabilities/fetchLiabilities', async () => {
  const liabilities = await liabilityService.getLiabilities();
  return liabilities;
});

export const fetchLiabilityById = createAsyncThunk('liabilities/fetchLiabilityById', async (liabilityId: string) => {
  const liability = await liabilityService.getLiabilityById(liabilityId);
  return liability ?? null;
});

export const createLiability = createAsyncThunk(
  'liabilities/createLiability',
  async (payload: LiabilityCreateInput) => {
    const liability = await liabilityService.createLiability(payload);
    return liability;
  }
);

export const updateLiability = createAsyncThunk(
  'liabilities/updateLiability',
  async ({ id, changes }: { id: string; changes: LiabilityUpdateInput }) => {
    const liability = await liabilityService.updateLiability(id, changes);
    return liability;
  }
);

export const deleteLiability = createAsyncThunk('liabilities/deleteLiability', async (id: string) => {
  await liabilityService.deleteLiability(id);
  return id;
});

const liabilitySlice = createSlice({
  name: 'liabilities',
  initialState,
  reducers: {
    setLiabilities(state, action: PayloadAction<Liability[]>) {
      state.items = action.payload;
    },
    setSelectedLiability(state, action: PayloadAction<Liability | null>) {
      state.selectedLiability = action.payload;
    },
    clearLiabilityError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLiabilities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLiabilities.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLiabilities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load liabilities';
      })
      .addCase(fetchLiabilityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLiabilityById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedLiability = action.payload;
      })
      .addCase(fetchLiabilityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load liability details';
      })
      .addCase(createLiability.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateLiability.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
        if (state.selectedLiability?.id === action.payload.id) {
          state.selectedLiability = action.payload;
        }
      })
      .addCase(deleteLiability.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedLiability?.id === action.payload) {
          state.selectedLiability = null;
        }
      })
      .addCase(createLiability.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to create liability';
      })
      .addCase(updateLiability.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to update liability';
      })
      .addCase(deleteLiability.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to delete liability';
      });
  },
});

export const { setLiabilities, setSelectedLiability, clearLiabilityError } = liabilitySlice.actions;

export default liabilitySlice.reducer;

