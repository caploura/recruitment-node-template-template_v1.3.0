import path from 'path';
import { glob } from 'glob';

export const listFilesInDirectoryByExtension = async (ext:string, dir: string): Promise<string[]> => {
  const directory = path.join(__dirname, '../..', dir);
  const filesPath = directory + '/**/*' + ext;

  const fileNames = await glob(filesPath);
  return fileNames;
};
