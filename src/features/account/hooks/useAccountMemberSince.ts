import { useEffect, useState } from 'react';

import { getUserProfile } from '../../../services/api/usersApi';

export function useAccountMemberSince(userId?: string) {
  const [memberSince, setMemberSince] = useState<string | undefined>();

  useEffect(() => {
    if (!userId) {
      setMemberSince(undefined);
      return;
    }

    let cancelled = false;

    void getUserProfile(userId)
      .then((profile) => {
        if (!cancelled) {
          setMemberSince(profile.createdAt);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMemberSince(undefined);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return memberSince;
}
