/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INNERMIRROR_RUNTIME_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}