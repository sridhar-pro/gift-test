// utils/storage.js
const EXPIRY_DURATION = 1 * 60 * 1000; // 15 minutes

export function setWithExpiry(key, value) {
  const item = {
    value,
    timestamp: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(item));
}

export function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    const now = Date.now();

    if (now - item.timestamp > EXPIRY_DURATION) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (e) {
    return null;
  }
}
