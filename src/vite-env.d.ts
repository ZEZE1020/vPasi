/// <reference types="vite/client" />

// Allow inert attribute on HTML elements (HTML spec, not yet in TS lib)
declare global {
  namespace React {
    interface HTMLAttributes<T> {
      inert?: '';
    }
  }
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
