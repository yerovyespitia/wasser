import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import { VitePWA } from 'vite-plugin-pwa';

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
    version: string;
};

function getCommitHash() {
    try {
        return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    } catch {
        return 'development';
    }
}

const commitHash = getCommitHash();

export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production';
    const serviceWorkerDisabled = process.env.VITE_DISABLE_SERVICE_WORKER === 'true';

    return {
        plugins: [
            {
                name: 'wasser-js-as-jsx',
                enforce: 'pre',
                async transform(code, id) {
                    if (!id.includes('/src/') || !id.endsWith('.js')) {
                        return null;
                    }

                    const cssModuleRequires = [];
                    const moduleRequires = [];
                    let rewrittenCode = code.replace(
                        /^(\s*)const\s+([A-Za-z0-9_$]+)\s*=\s*require\((['"])([^'"]+\.module\.css)\3\);?\s*$/gm,
                        (_match, _indent, identifier, _quote, specifier) => {
                            cssModuleRequires.push(`import ${identifier} from '${specifier}';`);
                            return '';
                        }
                    );
                    rewrittenCode = rewrittenCode.replace(
                        /^(\s*)const\s+([A-Za-z0-9_$]+)\s*=\s*require\((['"])([^'"]+\?worker)\3\);?\s*$/gm,
                        (_match, _indent, identifier, _quote, specifier) => {
                            moduleRequires.push(`import ${identifier} from '${specifier}';`);
                            return '';
                        }
                    );

                    return transformWithEsbuild(
                        cssModuleRequires.length > 0 || moduleRequires.length > 0
                            ? `${cssModuleRequires.join('\n')}${cssModuleRequires.length > 0 && moduleRequires.length > 0 ? '\n' : ''}${moduleRequires.join('\n')}\n${rewrittenCode}`
                            : rewrittenCode,
                        id,
                        {
                        loader: 'jsx',
                        jsx: 'transform',
                        jsxFactory: 'React.createElement',
                        jsxFragment: 'React.Fragment',
                        }
                    );
                },
            },
            viteCommonjs(),
            react(),
            VitePWA({
                injectRegister: false,
                manifest: false,
                filename: 'service-worker.js',
                strategies: 'generateSW',
                workbox: {
                    maximumFileSizeToCacheInBytes: 20_000_000,
                },
            }),
        ],
        resolve: {
            alias: {
                wasser: path.resolve(__dirname, 'src'),
                'wasser-router': path.resolve(__dirname, 'src/router'),
            },
            extensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '.css', '.wasm'],
        },
        define: {
            __APP_VERSION__: JSON.stringify(packageJson.version),
            __APP_COMMIT_HASH__: JSON.stringify(commitHash),
            __APP_DEBUG__: JSON.stringify(!isProduction),
            __APP_SENTRY_DSN__: JSON.stringify(process.env.VITE_SENTRY_DSN ?? ''),
            __APP_SERVICE_WORKER_DISABLED__: JSON.stringify(serviceWorkerDisabled),
        },
        assetsInclude: ['**/*.wasm'],
        css: {
            modules: {
                generateScopedName: '[local]-[hash:base64:5]',
                scopeBehaviour: 'local',
                globalModulePaths: [/src\/router\/styles\.css$/],
            },
        },
        server: {
            host: '0.0.0.0',
            port: 8080,
            strictPort: true,
        },
        preview: {
            host: '0.0.0.0',
            port: 8080,
            strictPort: true,
        },
        build: {
            outDir: 'build',
            emptyOutDir: true,
            sourcemap: true,
            cssMinify: false,
            commonjsOptions: {
                include: [/src/, /node_modules/],
                transformMixedEsModules: true,
            },
        },
        optimizeDeps: {
            esbuildOptions: {
                loader: {
                    '.js': 'jsx',
                },
            },
        },
        test: {
            globals: true,
            environment: 'node',
            include: ['tests/**/*.test.js', 'tests/**/*.spec.js'],
        },
    };
});
