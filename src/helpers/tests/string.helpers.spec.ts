import { containsDigit, transformArrayToNumbers } from '../string.helpers';

describe('String Helper Functions', () => {
  describe('transformArrayToNumbers', () => {
    const arrayOfNumbersAndStrings = ['test string', '1992', '25.794', 'dummy', '-538.9706'];

    it('should return an array containing strings and numbers parsed correctly', () => {
      const result = transformArrayToNumbers(arrayOfNumbersAndStrings);
      expect(result).toStrictEqual(['test string', 1992, 25.794, 'dummy', -538.9706]);
    });

    it('should return an array containing strings, spaces and numbers parsed correctly', () => {
      const arr = [...arrayOfNumbersAndStrings, '', '   '];
      const result = transformArrayToNumbers(arr);
      expect(result).toStrictEqual(['test string', 1992, 25.794, 'dummy', -538.9706, '', '   ']);
    });

    it('should return an array containing only numbers parsed correctly', () => {
      const arr = ['123', '0.63', '-55', '-142.7602'];
      const result = transformArrayToNumbers(arr);
      expect(result).toStrictEqual([123, 0.63, -55, -142.7602]);
    });

    it('should return an array containing only strings parsed correctly', () => {
      const arr = ['unit testing', 'test', 'checking if this function is working properly...', '', '         '];
      const result = transformArrayToNumbers(arr);
      expect(result).toStrictEqual(['unit testing', 'test', 'checking if this function is working properly...', '', '         ']);
    });
  });

  describe('containsDigit', () => {
    it('should return true if the provided string contains at least 1 digit', () => {
      const result = containsDigit('test with 1 digit');
      expect(result).toBe(true);
    });

    it('should return true if the provided string contains multiple digits', () => {
      const result = containsDigit('test-string23');
      expect(result).toBe(true);
    });

    it('should return false if the provided string doesnt contains any digits', () => {
      const result = containsDigit('test with no digits');
      expect(result).toBe(false);
    });
  });
});
