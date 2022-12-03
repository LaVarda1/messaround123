/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALLOW_SERVER_DOWNLOADS: boolean
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}