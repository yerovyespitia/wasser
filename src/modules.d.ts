declare module '*.module.css' {
    const resource: Record<string, string>;
    export = resource;
}

declare module 'wasser-router';
declare module 'wasser/components/NavBar';
declare module 'wasser/components/ModalDialog';

declare const __APP_VERSION__: string;
declare const __APP_COMMIT_HASH__: string;
declare const __APP_DEBUG__: boolean;
declare const __APP_SENTRY_DSN__: string;
declare const __APP_SERVICE_WORKER_DISABLED__: boolean;
