import { useMemo } from 'react';
import { Chip, Stack, alpha } from '@mui/material';
import type { Asset } from '../../../types';
import { Button, DataGrid, type Column } from '../../common';
import { formatCurrency, formatDate } from '../../../utils';
import { AssetCategory } from '../../../types/models';
import { getAssetCategoryLabel, assetCategoryLabels } from '../../../config/categoryConfig';

interface AssetListProps {
  assets: Asset[];
  loading?: boolean;
  onSelectAsset?: (assetId: string) => void;
  onEditAsset?: (asset: Asset) => void;
  onDeleteAsset?: (asset: Asset) => void;
}

export const AssetList = ({
  assets,
  loading = false,
  onSelectAsset,
  onEditAsset,
  onDeleteAsset,
}: AssetListProps) => {
  const filterOptions = useMemo(
    () =>
      Object.values(AssetCategory).map((value) => ({
        label: assetCategoryLabels[value],
        value: value,
        field: 'category' as keyof Asset,
      })),
    []
  );

  const columns: Column<Asset>[] = [
    {
      id: 'name',
      label: 'Name',
      minWidth: 200,
      sortable: true,
    },
    {
      id: 'category',
      label: 'Category',
      minWidth: 120,
      sortable: true,
      format: (_value, row) => {
        const asset = row as Asset;
        const label = getAssetCategoryLabel(asset.category, asset.customCategoryName);
        return (
          <Chip
            size="small"
            label={label}
            sx={{
              height: 24,
              fontSize: '0.75rem',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              fontWeight: 500,
            }}
          />
        );
      },
    },
    {
      id: 'institution',
      label: 'Institution',
      minWidth: 150,
      sortable: true,
      format: (value) => (value ? String(value) : '—'),
    },
    {
      id: 'owner',
      label: 'Owner',
      minWidth: 120,
      sortable: true,
    },
    {
      id: 'value',
      label: 'Value',
      minWidth: 150,
      align: 'right',
      sortable: true,
      format: (value) => (
        <strong style={{ color: 'inherit' }}>{formatCurrency(value as number)}</strong>
      ),
    },
    {
      id: 'updatedAt',
      label: 'Updated',
      minWidth: 120,
      sortable: true,
      format: (value) => formatDate(value as string),
    },
  ];

  return (
    <DataGrid<Asset & Record<string, unknown>>
      data={assets as (Asset & Record<string, unknown>)[]}
      columns={columns}
      loading={loading}
      searchable={true}
      searchPlaceholder="Search assets..."
      filterable={true}
      filterOptions={filterOptions}
      onRowClick={onSelectAsset ? (row) => onSelectAsset((row as Asset).id) : undefined}
      actions={
        onEditAsset || onDeleteAsset
          ? (row) => {
              const asset = row as Asset;
              return (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  {onEditAsset && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<i className="ri-edit-line" style={{ fontSize: '14px' }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAsset(asset);
                      }}
                      sx={{
                        textTransform: 'none',
                        minWidth: 'auto',
                        px: 1.5,
                      }}
                    >
                      Edit
                    </Button>
                  )}
                  {onDeleteAsset && (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<i className="ri-delete-bin-line" style={{ fontSize: '14px' }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAsset(asset);
                      }}
                      sx={{
                        textTransform: 'none',
                        minWidth: 'auto',
                        px: 1.5,
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </Stack>
              );
            }
          : undefined
      }
      emptyMessage="No assets found. Add your first asset to get started."
    />
  );
};

export default AssetList;

