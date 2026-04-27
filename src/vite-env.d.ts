/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly SSR: boolean;
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly [key: string]: string | boolean | undefined;
}
