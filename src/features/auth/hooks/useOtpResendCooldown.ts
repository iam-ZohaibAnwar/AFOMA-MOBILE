import { useEffect, useState } from 'react';

import { OTP_RESEND_COOLDOWN_SECONDS } from '../../../constants/auth';

export function useOtpResendCooldown(active = true) {
  const [cooldownKey, setCooldownKey] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(OTP_RESEND_COOLDOWN_SECONDS);
  const canResend = secondsRemaining <= 0;

  useEffect(() => {
    if (!active) {
      return;
    }

    setSecondsRemaining(OTP_RESEND_COOLDOWN_SECONDS);

    const intervalId = setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [active, cooldownKey]);

  const restartCooldown = () => {
    setCooldownKey((current) => current + 1);
  };

  return {
    secondsRemaining,
    canResend,
    restartCooldown,
  };
}
