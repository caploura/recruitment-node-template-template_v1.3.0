import { mkdirSync, openSync, rmSync } from 'fs';
import { listFilesInDirectoryByExtension } from 'helpers/file.helpers';
import path from 'path';

describe('File Helper Functions', () => {
  const extension = '.csv';
  const testFolder = '/test-files';
  const directory = path.join(__dirname, '../../..', testFolder);

  beforeAll(() => {
    mkdirSync(directory);
    openSync(directory + '/test-file-1.csv', 'a');
    openSync(directory + '/test-file-2.jpeg', 'a');
    openSync(directory + '/test-file-3.csv', 'a');
    openSync(directory + '/test-file-4.docx', 'a');
    openSync(directory + '/test-file-5.pdf', 'a');
  });

  afterAll(() => {
    rmSync(directory, { recursive: true });
  });

  describe('listFilesInDirectoryByExtension', () => {
    it('should return array of files - extension: .csv, dir: /test-files', async () => {
      const result = await listFilesInDirectoryByExtension(extension, testFolder);

      expect(result.length).toBe(2);
      expect(result).toStrictEqual(
        expect.arrayContaining([
          path.join(__dirname, '../../..', testFolder, '/test-file-3.csv'),
          path.join(__dirname, '../../..', testFolder, '/test-file-1.csv'),
        ]),
      );
    });

    it('should return empty array when given directory doesnt exist - extension: .csv, dir: /test-files-non-existant', async () => {
      const result = await listFilesInDirectoryByExtension(extension, '/test-files-non-existant');

      expect(result.length).toBe(0);
    });
  });
});
