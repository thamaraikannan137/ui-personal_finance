import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Asset, AssetCreateInput, AssetUpdateInput } from '../../types';
import { assetService } from '../../services/assetService';

interface AssetState {
  items: Asset[];
  selectedAsset: Asset | null;
  loading: boolean;
  error: string | null;
}

const initialState: AssetState = {
  items: [],
  selectedAsset: null,
  loading: false,
  error: null,
};

export const fetchAssets = createAsyncThunk('assets/fetchAssets', async () => {
  const assets = await assetService.getAssets();
  return assets;
});

export const fetchAssetById = createAsyncThunk('assets/fetchAssetById', async (assetId: string) => {
  const asset = await assetService.getAssetById(assetId);
  return asset ?? null;
});

export const createAsset = createAsyncThunk('assets/createAsset', async (payload: AssetCreateInput) => {
  const asset = await assetService.createAsset(payload);
  return asset;
});

export const updateAsset = createAsyncThunk(
  'assets/updateAsset',
  async ({ id, changes }: { id: string; changes: AssetUpdateInput }) => {
    const asset = await assetService.updateAsset(id, changes);
    return asset;
  }
);

export const deleteAsset = createAsyncThunk('assets/deleteAsset', async (id: string) => {
  await assetService.deleteAsset(id);
  return id;
});

const assetSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    setAssets(state, action: PayloadAction<Asset[]>) {
      state.items = action.payload;
    },
    setSelectedAsset(state, action: PayloadAction<Asset | null>) {
      state.selectedAsset = action.payload;
    },
    clearAssetError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load assets';
      })
      .addCase(fetchAssetById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssetById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAsset = action.payload;
      })
      .addCase(fetchAssetById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load asset details';
      })
      .addCase(createAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to create asset';
      })
      .addCase(updateAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
        if (state.selectedAsset?.id === action.payload.id) {
          state.selectedAsset = action.payload;
        }
      })
      .addCase(updateAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to update asset';
      })
      .addCase(deleteAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedAsset?.id === action.payload) {
          state.selectedAsset = null;
        }
      })
      .addCase(deleteAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to delete asset';
      });
  },
});

export const { setAssets, setSelectedAsset, clearAssetError } = assetSlice.actions;

export default assetSlice.reducer;

