// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_NAME: string,
  readonly APP_VERSION: string,

  readonly BUILD_VERSION: string,
  readonly BUILD_DATE: string,
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv,
}
