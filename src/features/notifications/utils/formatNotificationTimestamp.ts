export function formatNotificationTimestamp(timestamp?: string): string {
  if (!timestamp) {
    return '';
  }

  const createdAt = new Date(timestamp);
  if (Number.isNaN(createdAt.getTime())) {
    return '';
  }

  const now = Date.now();
  const diff = now - createdAt.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return 'Just now';
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${days}d ago`;
}
