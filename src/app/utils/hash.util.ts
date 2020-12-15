/**
 * A string hashing function based on Daniel J. Bernstein's popular 'times 33' hash algorithm.
 */
export const hash = (text: string): string => {
  let h = 5381;
  let index = text.length;

  while (index) {
    // eslint-disable-next-line no-bitwise
    h = (h * 33) ^ text.charCodeAt(--index);
  }
  // eslint-disable-next-line no-bitwise
  return (h >>> 0).toString(16);
};
