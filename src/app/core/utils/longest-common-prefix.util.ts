export const longestCommonPrefix = (arrayOfStrings: string[]): string => {
  let k = 0;
  const firstPos = 0;
  let longestPrefix = '';

  while (true) {
    if (arrayOfStrings.length === 0 || !arrayOfStrings[firstPos][k]) {
      return longestPrefix;
    }

    const nextCharacter = arrayOfStrings[firstPos][k];

    for (const item of arrayOfStrings) {
      if (item[k] !== nextCharacter) {
        return longestPrefix;
      }
    }
    k++;
    longestPrefix = `${longestPrefix}${nextCharacter}`;
  }
};

export const longestCommonPath = (paths: string[]): string => {
  const split = paths.map((path) => path.split('/').slice(0, -1));
  return split[0]
    .filter((path) => split.every((ps) => ps.includes(path)))
    .join('/');
};
