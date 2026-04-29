const LIST_CANDIDATE_KEYS = ['data', 'items', 'results', 'tenders'] as const;

const findNestedValue = <T>(
  input: unknown,
  predicate: (value: unknown) => value is T,
  candidateKeys: readonly string[],
): T | undefined => {
  if (predicate(input)) return input;
  if (input && typeof input === 'object') {
    const record = input as Record<string, unknown>;
    for (const key of candidateKeys) {
      if (!(key in record)) continue;
      const nested = findNestedValue(record[key], predicate, candidateKeys);
      if (nested !== undefined) return nested;
    }
  }
  return undefined;
};

const response = {
  success: true,
  message: "foo",
  data: {
    data: [{ id: 1 }, { id: 2 }],
    meta: {}
  }
};

const isTenderArray = (val: any): val is any[] => Array.isArray(val);
console.log(findNestedValue(response, isTenderArray, LIST_CANDIDATE_KEYS));
