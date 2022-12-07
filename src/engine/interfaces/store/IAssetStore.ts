import IPackedFile from './IPackedFile'

export enum FileMode {
  READ,
  APPEND,
  WRITE
}

export default interface IAssetStore {
  loadPackFile: (dir: string, packName: string) => Promise<{name: string, data: ArrayBuffer, type: string, contents:IPackedFile[]}>,
  loadFile: (filename: string) => Promise<ArrayBuffer>,

  // lower level operations
  openFile: (filename: string, mode: FileMode) => Promise<boolean>,
  readFile: (filename: string) => Promise<Buffer>,
  writeFile: (filename: string, data: Uint8Array, len: number) => Promise<boolean>,
  writeTextFile: (filename: string, data: string) => Promise<boolean>,
}