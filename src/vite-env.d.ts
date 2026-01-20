/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BECKN_TARGET: string
    readonly VITE_API_CREDENTIALS_TARGET: string
    readonly VITE_API_TUNNEL_TARGET: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
