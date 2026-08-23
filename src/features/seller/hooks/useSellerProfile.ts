import { useCallback, useEffect, useRef, useState } from 'react';

import { getSellerProfileCache, setSellerProfileCache } from '../../../services/cache/screenCache';
import { getErrorMessage } from '../../../services/api/errors';
import { getSellerProfile } from '../../../services/api/sellersApi';
import type { SellerProfile } from '../types/sellerProfile';

export function useSellerProfile(sellerId?: string) {
  const [profile, setProfile] = useState<SellerProfile | null>(() =>
    sellerId ? getSellerProfileCache(sellerId) ?? null : null,
  );
  const [isRefreshing, setIsRefreshing] = useState(Boolean(sellerId));
  const [error, setError] = useState<string | null>(null);
  const profileRef = useRef(profile);

  profileRef.current = profile;

  const reload = useCallback(async () => {
    if (!sellerId) {
      setProfile(null);
      setError(null);
      setIsRefreshing(false);
      return;
    }

    const hasExistingProfile = Boolean(profileRef.current);
    if (!hasExistingProfile) {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      const response = await getSellerProfile(sellerId);
      setProfile(response);
      setSellerProfileCache(sellerId, response);
    } catch (err) {
      if (!hasExistingProfile) {
        setProfile(null);
        setError(getErrorMessage(err, 'Failed to load seller profile'));
      } else {
        setError(getErrorMessage(err, 'Unable to refresh seller profile.'));
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [sellerId]);

  useEffect(() => {
    if (!sellerId) {
      setProfile(null);
      return;
    }

    const cachedProfile = getSellerProfileCache(sellerId);
    if (cachedProfile) {
      setProfile(cachedProfile);
    }
  }, [sellerId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const applyProfileUpdate = useCallback((nextProfile: SellerProfile) => {
    setProfile(nextProfile);
    if (sellerId) {
      setSellerProfileCache(sellerId, nextProfile);
    }
  }, [sellerId]);

  return {
    profile,
    isRefreshing,
    isLoading: isRefreshing && !profile,
    error,
    reload,
    applyProfileUpdate,
  };
}
