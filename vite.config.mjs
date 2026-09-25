import { defineConfig } from 'vite';

// Development only: the legacy script tags are packaged by Gulp for releases.
export default defineConfig({
    server: {
        host: 'localhost',
        port: 8080,
        strictPort: true,
        watch: { ignored: ['**/dev-client/**', '**/cache/**', '**/dist/**', '**/debug/**', '**/apps/**', '**/release/**'] },
    },
    plugins: [{
        name: 'reload-legacy-scripts',
        handleHotUpdate({ file, server }) {
            if (file.endsWith('.js') || file.endsWith('.json')) {
                server.ws.send({ type: 'full-reload' });
                return [];
            }
        },
    }],
});
