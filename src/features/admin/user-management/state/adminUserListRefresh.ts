let refreshRequested = false;
let resetToFirstPage = false;

export function requestAdminUserListRefresh(options?: { resetToFirstPage?: boolean }): void {
  refreshRequested = true;
  resetToFirstPage = Boolean(options?.resetToFirstPage);
}

export function consumeAdminUserListRefreshRequest(): {
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
