import { createServer as createHttpServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createServer as createViteServer } from 'vite';
import vue from '@vitejs/plugin-vue';

const fsUrl = (path) => `/@fs/${path.replaceAll('\\', '/').replace(/^\//, '')}`;
const json = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');

/** A loopback-only protocol fixture; every token, code and account is synthetic. */
export async function startFlashServer({ root, consumer, cacheDir, major }) {
    const packageRoot = join(consumer, 'node_modules/@escalated-dev/escalated');
    const adapterRoot = join(consumer, 'node_modules/@inertiajs/vue3');
    const adapter = JSON.parse(readFileSync(join(adapterRoot, 'package.json'), 'utf8'));
    const entry = join(adapterRoot, adapter.exports['.'].import);
    const entrySource = `
        import { createApp, h, Fragment } from 'vue';
        import { createInertiaApp, Link } from '@inertiajs/vue3';
        import Tokens from ${JSON.stringify(fsUrl(join(packageRoot, 'src/pages/Admin/ApiTokens/Index.vue')))};
        import TwoFactor from ${JSON.stringify(fsUrl(join(packageRoot, 'src/pages/Admin/Settings/TwoFactor.vue')))};
        import ${JSON.stringify(fsUrl(join(root, '.storybook/tailwind.css')))};
        import ${JSON.stringify(fsUrl(join(root, '.storybook/storybook.css')))};
        const base = location.pathname.split('/').slice(0, 3).join('/');
        globalThis.route = (name) => base + '/support/admin/two-factor/' + name.split('.').at(-1);
        const Done = { render: () => h('h1', 'Other page') };
        createInertiaApp({
            resolve: (name) => ({ Tokens, TwoFactor, Done })[name],
            progress: false,
            setup({ el, App, props, plugin }) {
                const app = createApp({render: () => h(Fragment, [
                    h('nav', {class: 'fixture-navigation'}, [
                        h(Link, {href: base + '/support/other'}, () => 'Other page')
                    ]), h(App, props)
                ])});
                app.use(plugin);
                app.config.globalProperties.route = globalThis.route;
                app.mount(el);
            }
        });
    `;
    const vite = await createViteServer({
        configFile: false,
        root,
        cacheDir,
        plugins: [
            {
                name: 'inertia-flash-fixture',
                resolveId: (id) => (id === '/fixture-entry.js' ? '\0inertia-flash-fixture' : null),
                load: (id) => (id === '\0inertia-flash-fixture' ? entrySource : null),
            },
            vue(),
        ],
        server: { middlewareMode: true, hmr: false, fs: { allow: [root, consumer] } },
        resolve: {
            alias: [
                { find: /^@inertiajs\/vue3$/, replacement: entry },
                {
                    find: /^@escalated-dev\/locale$/,
                    replacement: join(consumer, 'node_modules/@escalated-dev/locale/index.js'),
                },
                { find: /^vue$/, replacement: join(root, 'node_modules/vue/dist/vue.esm-bundler.js') },
            ],
            dedupe: ['vue'],
        },
        optimizeDeps: { include: ['@inertiajs/vue3', '@escalated-dev/locale', 'vue'] },
    });
    const sessions = new Map();
    const posts = [];
    const server = createHttpServer(async (request, response) => {
        try {
            const url = new URL(request.url, 'http://127.0.0.1');
            const match = url.pathname.match(
                /^\/case\/(native|legacy|mixed|clear)\/support\/(admin\/api-tokens|admin\/two-factor(?:\/(setup|confirm|disable))?|other)$/,
            );
            if (!match)
                return vite.middlewares(request, response, () => {
                    response.writeHead(404);
                    response.end();
                });
            const [, shape, route, action] = match;
            let session = request.headers.cookie?.match(/fixture_session=([^;]+)/)?.[1];
            if (!session) {
                session = randomUUID();
                response.setHeader('Set-Cookie', `fixture_session=${session}; Path=/; SameSite=Lax; HttpOnly`);
            }
            const key = `${session}:${shape}`;
            if (!sessions.has(key))
                sessions.set(key, { enabled: false, pending: false, token: 0, setup: 0, flash: {} });
            const state = sessions.get(key);
            const base = `/case/${shape}/support`;
            if (request.method === 'POST') {
                let body = '';
                for await (const part of request) body += part;
                const values = body ? JSON.parse(body) : {};
                posts.push({ shape, route, values });
                if (route === 'admin/api-tokens')
                    state.flash = { plain_text_token: `fixture-token-${major}-${++state.token}` };
                else if (action === 'setup') {
                    state.pending = true;
                    state.setup++;
                    state.flash = {
                        two_factor_setup: {
                            qr_uri: `otpauth://totp/Fixture-${major}?secret=JBSWY3DPEHPK3PX${state.setup === 1 ? 'P' : 'Q'}&issuer=Fixture`,
                        },
                    };
                } else if (action === 'confirm') {
                    if (values.code !== '123456') throw new Error('Fixture expected the synthetic code');
                    state.enabled = true;
                    state.pending = false;
                    state.flash = {
                        two_factor_confirmed: { recovery_codes: ['fixture-recovery-one', 'fixture-recovery-two'] },
                    };
                } else if (action === 'disable') state.enabled = false;
                response.writeHead(303, {
                    Location: `${base}/${route === 'admin/api-tokens' ? route : 'admin/two-factor'}`,
                });
                response.end();
                return;
            }
            const props = {
                errors: {},
                auth: { user: { id: 42, name: 'Fixture Admin' } },
                escalated: {
                    prefix: base,
                    is_admin: true,
                    is_agent: true,
                    show_powered_by: false,
                    features: {},
                    permissions: [],
                },
                tokens: [],
                users: [{ id: 42, name: 'Fixture Admin', email: 'fixture@example.test' }],
                api_enabled: true,
                enabled: state.enabled,
                pending: state.pending,
            };
            const payload = {
                component: route === 'other' ? 'Done' : route === 'admin/api-tokens' ? 'Tokens' : 'TwoFactor',
                props,
                url: url.pathname,
                version: 'fixture-v1',
            };
            if (shape === 'legacy' || (shape === 'native' && major !== '3')) props.flash = state.flash;
            else if (shape === 'mixed') {
                props.flash = state.flash;
                payload.flash = {};
            } else if (shape === 'clear') {
                props.flash = {
                    plain_text_token: 'stale-token',
                    two_factor_setup: { qr_uri: 'stale-uri' },
                    two_factor_confirmed: { recovery_codes: ['stale-code'] },
                };
                payload.flash = { plain_text_token: null, two_factor_setup: null, two_factor_confirmed: null };
            } else payload.flash = state.flash;
            state.flash = {};
            response.setHeader('Vary', 'X-Inertia');
            if (request.headers['x-inertia']) {
                response.writeHead(200, { 'Content-Type': 'application/json', 'X-Inertia': 'true' });
                response.end(JSON.stringify(payload));
                return;
            }
            const bootstrap =
                major === '3'
                    ? `<div id="app"></div><script type="application/json" data-page="app">${json(payload)}</script>`
                    : `<div id="app" data-page="${JSON.stringify(payload).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')}"></div>`;
            const html = await vite.transformIndexHtml(
                url.pathname,
                `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#09090b;color:#fff}.fixture-navigation{position:relative;z-index:100;padding:8px}.fixture-navigation a{color:cyan}</style></head><body>${bootstrap}<script type="module" src="/fixture-entry.js"></script></body></html>`,
            );
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(html);
        } catch (error) {
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end(error.stack);
        }
    });
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    return {
        origin: `http://127.0.0.1:${server.address().port}`,
        posts,
        close: async () => {
            await new Promise((resolve) => server.close(resolve));
            await vite.close();
        },
    };
}
