import { createApp, h } from 'vue';
import EscalatedWidget from './EscalatedWidget.vue';

(function () {
    const scriptTag = document.currentScript || document.querySelector('script[data-escalated-widget]');
    const globalConfig = window.EscalatedWidget || {};

    const config = {
        baseUrl: scriptTag?.getAttribute('data-base-url') || globalConfig.baseUrl || '',
        // Host-framework-specific path prefix. Every plugin except the NestJS
        // reference mounts at /support/widget; NestJS mounts at
        // /escalated/widget. Set via data-widget-path on NestJS backends.
        widgetPath: scriptTag?.getAttribute('data-widget-path') || globalConfig.widgetPath || '/support/widget',
        color: scriptTag?.getAttribute('data-color') || globalConfig.color || '#4F46E5',
        position: scriptTag?.getAttribute('data-position') || globalConfig.position || 'bottom-right',
    };

    const host = document.createElement('div');
    host.id = 'escalated-widget-host';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    const mountEl = document.createElement('div');
    mountEl.id = 'escalated-widget-root';
    shadow.appendChild(mountEl);

    const styleEl = document.createElement('style');
    styleEl.textContent = getWidgetStyles();
    shadow.appendChild(styleEl);

    const app = createApp({
        render() {
            return h(EscalatedWidget, {
                baseUrl: config.baseUrl,
                widgetPath: config.widgetPath,
                initialColor: config.color,
                initialPosition: config.position,
            });
        },
    });

    app.mount(mountEl);

    window.EscalatedWidget = Object.assign(window.EscalatedWidget || {}, {
        open() {
            mountEl.querySelector('[data-widget-panel]')?.classList.add('esc-open');
        },
        close() {
            mountEl.querySelector('[data-widget-panel]')?.classList.remove('esc-open');
        },
    });
})();

function getWidgetStyles() {
    return `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
#escalated-widget-root {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px; line-height: 1.5; color: #1f2937; -webkit-font-smoothing: antialiased;
}
.esc-w-fab {
    position: fixed; z-index: 2147483646; width: 56px; height: 56px;
    border-radius: 50%; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: transform 0.2s, box-shadow 0.2s; color: #fff;
}
.esc-w-fab:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
.esc-w-fab.bottom-right { bottom: 20px; right: 20px; }
.esc-w-fab.bottom-left { bottom: 20px; left: 20px; }
.esc-w-fab svg { width: 24px; height: 24px; fill: currentColor; }
.esc-w-panel {
    position: fixed; z-index: 2147483647;
    width: 380px; max-width: calc(100vw - 24px);
    height: 560px; max-height: calc(100vh - 100px);
    border-radius: 12px; background: #ffffff;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
    display: flex; flex-direction: column; overflow: hidden;
    transform: scale(0.95) translateY(10px); opacity: 0;
    pointer-events: none; transition: transform 0.25s ease, opacity 0.25s ease;
}
.esc-w-panel.esc-open { transform: scale(1) translateY(0); opacity: 1; pointer-events: auto; }
.esc-w-panel.bottom-right { bottom: 84px; right: 20px; }
.esc-w-panel.bottom-left { bottom: 84px; left: 20px; }
@media (max-width: 440px) {
    .esc-w-panel {
        width: calc(100vw - 16px); height: calc(100vh - 80px);
        max-height: calc(100vh - 80px); bottom: 8px !important;
        right: 8px !important; left: 8px !important; border-radius: 10px;
    }
}
.esc-w-header { padding: 16px 20px; color: #fff; flex-shrink: 0; }
.esc-w-header h2 { font-size: 16px; font-weight: 600; margin-bottom: 2px; }
.esc-w-header p { font-size: 13px; opacity: 0.9; }
.esc-w-tabs { display: flex; border-bottom: 1px solid #e5e7eb; flex-shrink: 0; background: #f9fafb; }
.esc-w-tab {
    flex: 1; padding: 10px 8px; font-size: 12px; font-weight: 500;
    text-align: center; border: none; background: none; cursor: pointer;
    color: #6b7280; border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s;
}
.esc-w-tab:hover { color: #374151; }
.esc-w-tab.active { color: #1f2937; border-bottom-color: var(--esc-widget-color, #4F46E5); }
.esc-w-body { flex: 1; overflow-y: auto; padding: 16px 20px; }
.esc-w-input {
    width: 100%; padding: 8px 12px; border: 1px solid #d1d5db;
    border-radius: 8px; font-size: 13px; outline: none;
    transition: border-color 0.15s; background: #fff; color: #1f2937;
}
.esc-w-input:focus { border-color: var(--esc-widget-color, #4F46E5); box-shadow: 0 0 0 2px rgba(79,70,229,0.1); }
.esc-w-textarea {
    width: 100%; padding: 8px 12px; border: 1px solid #d1d5db;
    border-radius: 8px; font-size: 13px; outline: none;
    resize: vertical; min-height: 80px; font-family: inherit;
    transition: border-color 0.15s; background: #fff; color: #1f2937;
}
.esc-w-textarea:focus { border-color: var(--esc-widget-color, #4F46E5); box-shadow: 0 0 0 2px rgba(79,70,229,0.1); }
.esc-w-select {
    width: 100%; padding: 8px 12px; border: 1px solid #d1d5db;
    border-radius: 8px; font-size: 13px; outline: none;
    background: #fff; color: #1f2937; cursor: pointer;
}
.esc-w-select:focus { border-color: var(--esc-widget-color, #4F46E5); }
.esc-w-label { display: block; font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 4px; }
.esc-w-field { margin-bottom: 12px; }
.esc-w-btn {
    width: 100%; padding: 10px 16px; border: none; border-radius: 8px;
    font-size: 13px; font-weight: 600; color: #fff; cursor: pointer; transition: opacity 0.15s;
}
.esc-w-btn:hover { opacity: 0.9; }
.esc-w-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.esc-w-article { padding: 10px 0; border-bottom: 1px solid #f3f4f6; cursor: pointer; }
.esc-w-article:last-child { border-bottom: none; }
.esc-w-article:hover { background: #f9fafb; margin: 0 -20px; padding: 10px 20px; }
.esc-w-article h4 { font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
.esc-w-article p { font-size: 12px; color: #6b7280; }
.esc-w-back {
    display: inline-flex; align-items: center; gap: 4px; font-size: 12px;
    color: #6b7280; cursor: pointer; margin-bottom: 12px;
    background: none; border: none; padding: 0;
}
.esc-w-back:hover { color: #374151; }
.esc-w-article-detail h3 { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #1f2937; }
.esc-w-article-detail .esc-w-article-body { font-size: 13px; line-height: 1.7; color: #374151; }
.esc-w-article-detail .esc-w-article-body p { margin-bottom: 8px; }
.esc-w-article-detail .esc-w-article-body a { color: var(--esc-widget-color, #4F46E5); }
.esc-w-success { text-align: center; padding: 24px 0; }
.esc-w-success svg { width: 48px; height: 48px; color: #10b981; margin: 0 auto 12px; }
.esc-w-success h4 { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.esc-w-success p { font-size: 13px; color: #6b7280; }
.esc-w-success .esc-w-ref {
    display: inline-block; margin-top: 8px; padding: 4px 12px;
    background: #f0fdf4; border-radius: 6px; font-size: 14px; font-weight: 600; color: #059669;
}
.esc-w-status-card { padding: 16px; border-radius: 10px; border: 1px solid #e5e7eb; margin-bottom: 12px; }
.esc-w-status-card h4 { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.esc-w-status-badge {
    display: inline-block; padding: 2px 8px; border-radius: 12px;
    font-size: 11px; font-weight: 600; color: #fff;
}
.esc-w-reply { padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
.esc-w-reply:last-child { border-bottom: none; }
.esc-w-reply-author { font-size: 12px; font-weight: 600; color: #374151; }
.esc-w-reply-agent {
    font-size: 10px; padding: 1px 6px; background: #eff6ff;
    color: #3b82f6; border-radius: 4px; margin-left: 4px;
}
.esc-w-reply-time { font-size: 11px; color: #9ca3af; }
.esc-w-reply-body { font-size: 13px; color: #374151; margin-top: 4px; line-height: 1.6; }
.esc-w-error {
    padding: 8px 12px; background: #fef2f2; border: 1px solid #fecaca;
    border-radius: 8px; font-size: 12px; color: #dc2626; margin-bottom: 12px;
}
.esc-w-empty { text-align: center; padding: 24px 0; color: #9ca3af; font-size: 13px; }
.esc-w-chat-avail {
    display: flex; align-items: center; gap: 8px; padding: 10px 14px;
    background: #f0fdf4; border-radius: 8px; font-size: 13px; color: #166534; margin-bottom: 16px;
}
.esc-w-chat-dot-green {
    width: 8px; height: 8px; border-radius: 50%; background: #22c55e; flex-shrink: 0;
}
.esc-w-chat-header-bar {
    display: flex; justify-content: space-between; align-items: center;
    padding: 8px 0; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb;
}
.esc-w-chat-agent-info { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: #1f2937; }
.esc-w-chat-agent-avatar {
    width: 28px; height: 28px; border-radius: 50%; background: var(--esc-widget-color, #4F46E5);
    color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700;
}
.esc-w-chat-header-actions { display: flex; align-items: center; gap: 8px; }
.esc-w-chat-conn-dot { width: 6px; height: 6px; border-radius: 50%; }
.esc-w-chat-conn-connected { background: #22c55e; }
.esc-w-chat-conn-reconnecting { background: #eab308; }
.esc-w-chat-conn-disconnected { background: #ef4444; }
.esc-w-chat-end-link { background: none; border: none; color: #6b7280; font-size: 12px; cursor: pointer; }
.esc-w-chat-end-link:hover { color: #ef4444; }
.esc-w-chat-messages {
    flex: 1; overflow-y: auto; max-height: 280px; min-height: 120px;
    padding: 8px 0; display: flex; flex-direction: column; gap: 6px;
}
.esc-w-chat-bubble-row { display: flex; align-items: flex-end; gap: 6px; }
.esc-w-chat-bubble-row.esc-w-chat-agent { flex-direction: row-reverse; }
.esc-w-chat-bubble-row.esc-w-chat-customer { flex-direction: row; }
.esc-w-chat-avatar-sm {
    width: 24px; height: 24px; border-radius: 50%; background: #e5e7eb;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 700; color: #6b7280; flex-shrink: 0;
}
.esc-w-chat-avatar-agent { background: var(--esc-widget-color, #4F46E5); color: #fff; }
.esc-w-chat-bubble {
    max-width: 75%; padding: 8px 12px; border-radius: 16px; font-size: 13px; line-height: 1.5; word-break: break-word;
}
.esc-w-chat-bubble-customer { background: #f3f4f6; color: #1f2937; border-bottom-left-radius: 4px; }
.esc-w-chat-bubble-agent { color: #fff; border-bottom-right-radius: 4px; }
.esc-w-chat-typing { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #9ca3af; padding: 4px 0; }
.esc-w-chat-typing-dots { display: inline-flex; gap: 3px; }
.esc-w-chat-typing-dots span {
    width: 5px; height: 5px; border-radius: 50%; background: #9ca3af;
    animation: esc-chat-bounce 1.4s infinite both;
}
.esc-w-chat-typing-dots span:nth-child(2) { animation-delay: 0.16s; }
.esc-w-chat-typing-dots span:nth-child(3) { animation-delay: 0.32s; }
@keyframes esc-chat-bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
}
.esc-w-chat-input-bar {
    display: flex; gap: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; margin-top: 8px;
}
.esc-w-chat-input {
    flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 20px;
    font-size: 13px; outline: none; background: #fff; color: #1f2937;
}
.esc-w-chat-input:focus { border-color: var(--esc-widget-color, #4F46E5); }
.esc-w-chat-send {
    width: 36px; height: 36px; border-radius: 50%; border: none; color: #fff;
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    transition: opacity 0.15s; flex-shrink: 0;
}
.esc-w-chat-send:disabled { opacity: 0.4; cursor: not-allowed; }
.esc-w-chat-rating { display: flex; justify-content: center; gap: 4px; margin: 12px 0; }
.esc-w-chat-star { background: none; border: none; cursor: pointer; color: #d1d5db; padding: 2px; transition: color 0.15s; }
.esc-w-chat-star:hover, .esc-w-chat-star-active { color: #f59e0b; }
.esc-w-chat-star svg { width: 28px; height: 28px; }
.esc-w-spinner {
    width: 20px; height: 20px; border: 2px solid #e5e7eb;
    border-top-color: var(--esc-widget-color, #4F46E5);
    border-radius: 50%; animation: esc-spin 0.6s linear infinite; margin: 24px auto;
}
@keyframes esc-spin { to { transform: rotate(360deg); } }
    `;
}
