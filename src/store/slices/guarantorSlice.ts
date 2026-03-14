import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { GuarantorDetail, GuarantorItem } from '../../types/networth';
import { guarantorService } from '../../services/guarantorService';

interface GuarantorState {
  data: GuarantorDetail | null;
  loading: boolean;
  error: string | null;
}

const initialState: GuarantorState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchGuarantors = createAsyncThunk(
  'guarantors/fetch',
  async (certificateId: string) => guarantorService.getGuarantors(certificateId)
);

export const saveGuarantors = createAsyncThunk(
  'guarantors/saveAll',
  async ({ certificateId, items }: { certificateId: string; items: GuarantorItem[] }) =>
    guarantorService.saveAll(certificateId, items)
);

export const addGuarantorItem = createAsyncThunk(
  'guarantors/addItem',
  async ({ certificateId, item }: { certificateId: string; item: GuarantorItem }) =>
    guarantorService.addItem(certificateId, item)
);

export const updateGuarantorItem = createAsyncThunk(
  'guarantors/updateItem',
  async ({ certificateId, itemId, data }: { certificateId: string; itemId: string; data: Partial<GuarantorItem> }) =>
    guarantorService.updateItem(certificateId, itemId, data)
);

export const deleteGuarantorItem = createAsyncThunk(
  'guarantors/deleteItem',
  async ({ certificateId, itemId }: { certificateId: string; itemId: string }) =>
    guarantorService.deleteItem(certificateId, itemId)
);

const guarantorSlice = createSlice({
  name: 'guarantors',
  initialState,
  reducers: {
    clearGuarantors(state) {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    const setData = (state: GuarantorState, action: { payload: GuarantorDetail }) => {
      state.loading = false;
      state.data = action.payload;
    };
    builder
      .addCase(fetchGuarantors.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchGuarantors.fulfilled, setData)
      .addCase(fetchGuarantors.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? 'Failed'; })
      .addCase(saveGuarantors.fulfilled, setData)
      .addCase(addGuarantorItem.fulfilled, setData)
      .addCase(updateGuarantorItem.fulfilled, setData)
      .addCase(deleteGuarantorItem.fulfilled, setData);
  },
});

export const { clearGuarantors } = guarantorSlice.actions;
export default guarantorSlice.reducer;
