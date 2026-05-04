export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxAttempts - 1) {
        await sleep(delayMs * Math.pow(2, i));
      }
    }
  }

  throw lastError || new Error('Retry failed');
};

export const groupBy = <T, K extends string | number | symbol>(
  arr: T[],
  key: (item: T) => K
): Record<K, T[]> => {
  return arr.reduce(
    (groups, item) => {
      const k = key(item);
      if (!groups[k]) {
        groups[k] = [];
      }
      groups[k].push(item);
      return groups;
    },
    {} as Record<K, T[]>
  );
};

export const sumBy = <T>(arr: T[], selector: (item: T) => number): number => {
  return arr.reduce((sum, item) => sum + selector(item), 0);
};

export const averageBy = <T>(arr: T[], selector: (item: T) => number): number => {
  if (arr.length === 0) return 0;
  return sumBy(arr, selector) / arr.length;
};

export const maxBy = <T>(arr: T[], selector: (item: T) => number): T | undefined => {
  if (arr.length === 0) return undefined;
  return arr.reduce((max, item) =>
    selector(item) > selector(max) ? item : max
  );
};

export const minBy = <T>(arr: T[], selector: (item: T) => number): T | undefined => {
  if (arr.length === 0) return undefined;
  return arr.reduce((min, item) =>
    selector(item) < selector(min) ? item : min
  );
};
