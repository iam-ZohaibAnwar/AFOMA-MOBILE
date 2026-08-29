type RefreshListener = () => void;

const listeners = new Set<RefreshListener>();

export function subscribeBellNotificationsRefresh(listener: RefreshListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyBellNotificationsRefresh(): void {
  listeners.forEach((listener) => {
    listener();
  });
}
