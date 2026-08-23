let refreshRequested = false;
let resetToFirstPage = false;

export function requestAdminProductListRefresh(options?: { resetToFirstPage?: boolean }): void {
  refreshRequested = true;
  resetToFirstPage = Boolean(options?.resetToFirstPage);
}

export function consumeAdminProductListRefreshRequest(): {
  refresh: boolean;
  resetToFirstPage: boolean;
} {
  const result = {
    refresh: refreshRequested,
    resetToFirstPage,
  };

  refreshRequested = false;
  resetToFirstPage = false;
  return result;
}
