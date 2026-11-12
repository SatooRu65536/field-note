/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Planetiler の OpenMapTiles プロファイルで生成した PMTiles の URL
  readonly VITE_PMTILES_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
