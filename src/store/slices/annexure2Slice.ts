import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Annexure2 } from '../../types/networth';
import { annexure2Service } from '../../services/annexure2Service';

interface Annexure2State {
  data: Annexure2 | null;
  loading: boolean;
  error: string | null;
}

const initialState: Annexure2State = {
  data: null,
  loading: false,
  error: null,
};

export const fetchAnnexure2 = createAsyncThunk(
  'annexure2/fetch',
  async (certificateId: string) => annexure2Service.getAnnexure2(certificateId)
);

export const saveAnnexure2 = createAsyncThunk(
  'annexure2/saveAll',
  async ({ certificateId, data }: { certificateId: string; data: Partial<Annexure2> }) =>
    annexure2Service.saveAll(certificateId, data)
);

export const updateAnnexure2Section = createAsyncThunk(
  'annexure2/updateSection',
  async ({ certificateId, section, data }: { certificateId: string; section: string; data: unknown }) =>
    annexure2Service.updateSection(certificateId, section, data)
);

const annexure2Slice = createSlice({
  name: 'annexure2',
  initialState,
  reducers: {
    clearAnnexure2(state) {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnexure2.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAnnexure2.fulfilled, (state, action) => { state.loading = false; state.data = action.payload; })
      .addCase(fetchAnnexure2.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? 'Failed'; })
      .addCase(saveAnnexure2.pending, (state) => { state.loading = true; })
      .addCase(saveAnnexure2.fulfilled, (state, action) => { state.loading = false; state.data = action.payload; })
      .addCase(saveAnnexure2.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? 'Failed'; })
      .addCase(updateAnnexure2Section.fulfilled, (state, action) => { state.data = action.payload; });
  },
});

export const { clearAnnexure2 } = annexure2Slice.actions;
export default annexure2Slice.reducer;
