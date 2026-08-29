import type { BellNotification } from '../../features/notifications/types';
import { apiDelete, apiGet, apiPut } from './request';

/** GET /notifications?userId= */
export async function getNotificationsByUserId(userId: string): Promise<BellNotification[]> {
  return apiGet<BellNotification[]>(
    '/notifications',
    { params: { userId } },
    'Failed to load notifications',
  );
}

/** PUT /notifications/:id — mark as read */
export async function markNotificationRead(notificationId: string): Promise<{ success?: boolean }> {
  return apiPut<{ success?: boolean }>(
    `/notifications/${notificationId}`,
    {},
    undefined,
    'Failed to update notification',
  );
}

/** DELETE /notifications/:id */
export async function deleteNotificationById(notificationId: string): Promise<{ success?: boolean }> {
  return apiDelete<{ success?: boolean }>(
    `/notifications/${notificationId}`,
    undefined,
    'Failed to delete notification',
  );
}
