export const isSafeExternalUrl = (value: string | null | undefined) => {
  if (!value) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};
