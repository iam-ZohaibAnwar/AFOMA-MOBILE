type RefreshListener = (mode: BellNotificationsRefreshMode) => void;

export type BellNotificationsRefreshMode = 'cache' | 'remote';

const listeners = new Set<RefreshListener>();

export function subscribeBellNotificationsRefresh(listener: RefreshListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyBellNotificationsRefresh(
  mode: BellNotificationsRefreshMode = 'remote',
): void {
  listeners.forEach((listener) => {
    listener(mode);
  });
}
