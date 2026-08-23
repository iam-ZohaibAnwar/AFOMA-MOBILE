export function maskEmail(email: string | undefined | null): string | undefined {
  const trimmed = email?.trim();
  if (!trimmed || !trimmed.includes('@')) {
    return undefined;
  }

  const [local, domain] = trimmed.split('@');
  if (!local || !domain) {
    return undefined;
  }

  const visible = local.slice(0, Math.min(4, local.length));
  return `${visible}****@${domain}`;
}
