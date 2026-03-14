import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Annexure1, PropertyRow } from '../../types/networth';
import { annexure1Service } from '../../services/annexure1Service';

interface Annexure1State {
  data: Annexure1 | null;
  loading: boolean;
  error: string | null;
}

const initialState: Annexure1State = {
  data: null,
  loading: false,
  error: null,
};

export const fetchAnnexure1 = createAsyncThunk(
  'annexure1/fetch',
  async (certificateId: string) => annexure1Service.getAnnexure1(certificateId)
);

export const saveAnnexure1 = createAsyncThunk(
  'annexure1/saveAll',
  async ({ certificateId, data }: { certificateId: string; data: { bySelf?: PropertyRow[]; bySharing?: PropertyRow[] } }) =>
    annexure1Service.saveAll(certificateId, data)
);

export const addAnnexure1Row = createAsyncThunk(
  'annexure1/addRow',
  async ({ certificateId, section, row }: { certificateId: string; section: 'bySelf' | 'bySharing'; row: PropertyRow }) =>
    annexure1Service.addRow(certificateId, section, row)
);

export const updateAnnexure1Row = createAsyncThunk(
  'annexure1/updateRow',
  async ({ certificateId, section, rowId, data }: { certificateId: string; section: 'bySelf' | 'bySharing'; rowId: string; data: Partial<PropertyRow> }) =>
    annexure1Service.updateRow(certificateId, section, rowId, data)
);

export const deleteAnnexure1Row = createAsyncThunk(
  'annexure1/deleteRow',
  async ({ certificateId, section, rowId }: { certificateId: string; section: 'bySelf' | 'bySharing'; rowId: string }) =>
    annexure1Service.deleteRow(certificateId, section, rowId)
);

const annexure1Slice = createSlice({
  name: 'annexure1',
  initialState,
  reducers: {
    clearAnnexure1(state) {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: Annexure1State) => { state.loading = true; state.error = null; };
    const setData = (state: Annexure1State, action: { payload: Annexure1 }) => {
      state.loading = false;
      state.data = action.payload;
    };
    const setError = (state: Annexure1State, action: { error: { message?: string } }) => {
      state.loading = false;
      state.error = action.error.message ?? 'An error occurred';
    };

    builder
      .addCase(fetchAnnexure1.pending, setLoading)
      .addCase(fetchAnnexure1.fulfilled, setData)
      .addCase(fetchAnnexure1.rejected, setError)
      .addCase(saveAnnexure1.pending, setLoading)
      .addCase(saveAnnexure1.fulfilled, setData)
      .addCase(saveAnnexure1.rejected, setError)
      .addCase(addAnnexure1Row.fulfilled, setData)
      .addCase(updateAnnexure1Row.fulfilled, setData)
      .addCase(deleteAnnexure1Row.fulfilled, setData);
  },
});

export const { clearAnnexure1 } = annexure1Slice.actions;
export default annexure1Slice.reducer;
