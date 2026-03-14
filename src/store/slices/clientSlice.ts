import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Client } from '../../types/networth';
import { clientService } from '../../services/clientService';

interface ClientState {
  items: Client[];
  selectedClient: Client | null;
  total: number;
  pages: number;
  loading: boolean;
  error: string | null;
  importStatus: { imported: number; errors: string[] } | null;
}

const initialState: ClientState = {
  items: [],
  selectedClient: null,
  total: 0,
  pages: 1,
  loading: false,
  error: null,
  importStatus: null,
};

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) => {
    return clientService.getClients(params);
  }
);

export const fetchClientById = createAsyncThunk(
  'clients/fetchClientById',
  async (id: string) => clientService.getClientById(id)
);

export const createClient = createAsyncThunk(
  'clients/createClient',
  async (data: Partial<Client>) => clientService.createClient(data)
);

export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ id, data }: { id: string; data: Partial<Client> }) =>
    clientService.updateClient(id, data)
);

export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (id: string) => {
    await clientService.deleteClient(id);
    return id;
  }
);

export const importClients = createAsyncThunk(
  'clients/importClients',
  async (file: File) => clientService.importClients(file)
);

const clientSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setSelectedClient(state, action: PayloadAction<Client | null>) {
      state.selectedClient = action.payload;
    },
    clearClientError(state) {
      state.error = null;
    },
    clearImportStatus(state) {
      state.importStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.clients;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load clients';
      })
      .addCase(fetchClientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedClient = action.payload;
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load client';
      })
      .addCase(createClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to create client';
      })
      .addCase(updateClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((c) => (c.id === action.payload.id ? action.payload : c));
        if (state.selectedClient?.id === action.payload.id) {
          state.selectedClient = action.payload;
        }
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to update client';
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      })
      .addCase(importClients.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.importStatus = null;
      })
      .addCase(importClients.fulfilled, (state, action) => {
        state.loading = false;
        state.importStatus = action.payload;
      })
      .addCase(importClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Import failed';
      });
  },
});

export const { setSelectedClient, clearClientError, clearImportStatus } = clientSlice.actions;
export default clientSlice.reducer;
