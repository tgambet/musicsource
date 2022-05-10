export const removeFromArray = <T>(array: T[], element: T): T[] => {
  const indexToRemove = array.indexOf(element);
  return [
    ...array.slice(0, indexToRemove),
    ...array.slice(indexToRemove + 1, array.length),
  ];
};
