import IPackedFile from './IPackedFile'

export default interface IAssetStore {
  loadPackFile: (dir: string, packName: string) => Promise<{name: string, data: ArrayBuffer, type: string, contents:IPackedFile[]}>,
  loadFile: (filename: string) => Promise<ArrayBuffer>,
  writeFile: (filename: string, data: Uint8Array, len: number) => Promise<boolean>,
  writeTextFile: (filename: string, data: string) => Promise<boolean>,
}