// ⚡ Bolt: Global memoization of getInitials to prevent expensive string processing on every render cycle for lists
const initialsCache = new Map();

export const getInitials = (name, fallback = '??') => {
  if (!name || typeof name !== 'string') return fallback;
  const trimmedName = name.trim();
  if (!trimmedName) return fallback;

  const cacheKey = `${trimmedName}_${fallback}`;
  if (initialsCache.has(cacheKey)) return initialsCache.get(cacheKey);

  // Use a safe implementation similar to the original map/join one to handle extra spaces
  let result = trimmedName.split(/\s+/).map(n => n?.[0] || '').join('').toUpperCase().slice(0, 2);

  result = result || fallback;

  // Bound the cache size (e.g. 5000)
  if (initialsCache.size >= 5000) {
    const firstKey = initialsCache.keys().next().value;
    initialsCache.delete(firstKey);
  }

  initialsCache.set(cacheKey, result);
  return result;
};
