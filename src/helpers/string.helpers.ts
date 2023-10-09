export const transformArrayToNumbers = (arr: string[]): (number | string)[] => {
  return arr.map(a => parseFloat(a) || a);
};

export const containsDigit = (s: string): boolean => {
  const regex = /\d/;
  return regex.test(s);
};
