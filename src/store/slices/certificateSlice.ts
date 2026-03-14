import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { NetWorthCertificate, NetWorthSummary } from '../../types/networth';
import { certificateService } from '../../services/certificateService';

interface CertificateState {
  items: NetWorthCertificate[];
  selectedCertificate: NetWorthCertificate | null;
  summary: NetWorthSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: CertificateState = {
  items: [],
  selectedCertificate: null,
  summary: null,
  loading: false,
  error: null,
};

export const fetchCertificatesByClient = createAsyncThunk(
  'certificates/fetchByClient',
  async ({ clientId, status }: { clientId: string; status?: string }) =>
    certificateService.getCertificatesByClient(clientId, status)
);

export const fetchCertificateById = createAsyncThunk(
  'certificates/fetchById',
  async (id: string) => certificateService.getCertificateById(id)
);

export const createCertificate = createAsyncThunk(
  'certificates/create',
  async (data: { clientId: string; financialYear: string; asOnDate: string }, { rejectWithValue }) => {
    try {
      return await certificateService.createCertificate(data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = axiosErr?.response?.data?.message ?? axiosErr?.message ?? 'Failed to create certificate';
      return rejectWithValue(msg);
    }
  }
);

export const fetchCertificateSummary = createAsyncThunk(
  'certificates/fetchSummary',
  async (id: string) => certificateService.getSummary(id)
);

export const finalizeCertificate = createAsyncThunk(
  'certificates/finalize',
  async (id: string) => certificateService.finalizeCertificate(id)
);

export const reopenCertificate = createAsyncThunk(
  'certificates/reopen',
  async (id: string) => certificateService.reopenCertificate(id)
);

export const deleteCertificate = createAsyncThunk(
  'certificates/delete',
  async (id: string) => {
    await certificateService.deleteCertificate(id);
    return id;
  }
);

const certificateSlice = createSlice({
  name: 'certificates',
  initialState,
  reducers: {
    setSelectedCertificate(state, action: PayloadAction<NetWorthCertificate | null>) {
      state.selectedCertificate = action.payload;
    },
    clearCertificateError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCertificatesByClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCertificatesByClient.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCertificatesByClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load certificates';
      })
      .addCase(fetchCertificateById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCertificateById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCertificate = action.payload;
      })
      .addCase(fetchCertificateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load certificate';
      })
      .addCase(createCertificate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCertificate.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.selectedCertificate = action.payload;
      })
      .addCase(createCertificate.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? action.error.message ?? 'Failed to create certificate';
      })
      .addCase(fetchCertificateSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(finalizeCertificate.fulfilled, (state, action) => {
        state.selectedCertificate = action.payload;
        state.items = state.items.map((c) => (c.id === action.payload.id ? action.payload : c));
      })
      .addCase(reopenCertificate.fulfilled, (state, action) => {
        state.selectedCertificate = action.payload;
        state.items = state.items.map((c) => (c.id === action.payload.id ? action.payload : c));
      })
      .addCase(deleteCertificate.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
        if (state.selectedCertificate?.id === action.payload) {
          state.selectedCertificate = null;
        }
      });
  },
});

export const { setSelectedCertificate, clearCertificateError } = certificateSlice.actions;
export default certificateSlice.reducer;
