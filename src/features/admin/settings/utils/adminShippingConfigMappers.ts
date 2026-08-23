import type {
  AdminShippingConfigSavePayload,
  AdminShippingMatrixEntry,
  AdminShippingMatrixMap,
  AdminShippingTier,
  AdminShippingTierDraft,
} from '../types/adminShippingConfig';

export function mapApiMatrixToUiMap(matrix: AdminShippingMatrixEntry[] | undefined): AdminShippingMatrixMap {
  if (!matrix?.length) {
    return {};
  }

  return matrix.reduce<AdminShippingMatrixMap>((acc, { from, to, surcharge }) => {
    if (!acc[from]) {
      acc[from] = {};
    }
    acc[from][to] = String(surcharge ?? 0);
    return acc;
  }, {});
}

export function rebuildMatrixForTiers(
  tiers: AdminShippingTierDraft[],
  previousMatrix: AdminShippingMatrixMap,
): AdminShippingMatrixMap {
  const nextMatrix: AdminShippingMatrixMap = {};

  for (const origin of tiers) {
    nextMatrix[origin.tierName] = {};
    for (const destination of tiers) {
      const existing = previousMatrix[origin.tierName]?.[destination.tierName];
      nextMatrix[origin.tierName][destination.tierName] = existing ?? '0';
    }
  }

  return nextMatrix;
}

function renameMatrixTierKey(
  matrix: AdminShippingMatrixMap,
  oldTierName: string,
  newTierName: string,
): AdminShippingMatrixMap {
  const renamed: AdminShippingMatrixMap = {};

  for (const [fromTier, destinations] of Object.entries(matrix)) {
    const nextFrom = fromTier === oldTierName ? newTierName : fromTier;
    renamed[nextFrom] = {};

    for (const [toTier, surcharge] of Object.entries(destinations)) {
      const nextTo = toTier === oldTierName ? newTierName : toTier;
      renamed[nextFrom][nextTo] = surcharge;
    }
  }

  return renamed;
}

export function migrateMatrixForTierChange(
  previousTiers: AdminShippingTierDraft[],
  nextTiers: AdminShippingTierDraft[],
  previousMatrix: AdminShippingMatrixMap,
  editingIndex: number | null,
): AdminShippingMatrixMap {
  if (editingIndex == null) {
    return rebuildMatrixForTiers(nextTiers, previousMatrix);
  }

  const oldName = previousTiers[editingIndex]?.tierName;
  const newName = nextTiers[editingIndex]?.tierName;
  const matrixWithRename =
    oldName && newName && oldName !== newName
      ? renameMatrixTierKey(previousMatrix, oldName, newName)
      : previousMatrix;

  return rebuildMatrixForTiers(nextTiers, matrixWithRename);
}

export function buildShippingConfigSavePayload(params: {
  configId?: string | null;
  tiers: AdminShippingTierDraft[];
  matrix: AdminShippingMatrixMap;
}): AdminShippingConfigSavePayload {
  const preparedTiers: AdminShippingTier[] = params.tiers.map((tier) => ({
    tierName: tier.tierName.trim(),
    countires: tier.countires,
  }));

  const preparedMatrix: AdminShippingMatrixEntry[] = [];

  for (const origin of preparedTiers) {
    for (const destination of preparedTiers) {
      const raw = params.matrix[origin.tierName]?.[destination.tierName];
      const surcharge = parseFloat(raw ?? '0');
      preparedMatrix.push({
        from: origin.tierName,
        to: destination.tierName,
        surcharge: Number.isFinite(surcharge) ? surcharge : 0,
      });
    }
  }

  const payload: AdminShippingConfigSavePayload = {
    tiers: preparedTiers,
    matrix: preparedMatrix,
  };

  if (params.configId) {
    payload._id = params.configId;
  }

  return payload;
}

export function validateAdminShippingTierDraft(draft: AdminShippingTierDraft): string | null {
  if (!draft.tierName.trim()) {
    return 'Tier name is required.';
  }

  if (draft.countires.length === 0) {
    return 'Select at least one country.';
  }

  return null;
}

export function validateAdminShippingTierNameUnique(
  draft: AdminShippingTierDraft,
  tiers: AdminShippingTierDraft[],
  editingIndex: number | null,
): string | null {
  const normalized = draft.tierName.trim().toLowerCase();
  const duplicate = tiers.some(
    (tier, index) => index !== editingIndex && tier.tierName.trim().toLowerCase() === normalized,
  );

  if (duplicate) {
    return 'Tier name must be unique.';
  }

  return null;
}

export function formatAdminShippingTierCountries(countries: string[]): string {
  if (!countries.length) {
    return 'No countries selected';
  }

  if (countries.length <= 3) {
    return countries.join(', ');
  }

  return `${countries.slice(0, 3).join(', ')} +${countries.length - 3} more`;
}
