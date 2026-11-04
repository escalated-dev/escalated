import { describe, it, expect } from 'vitest';
import { panelThemeTokens } from '../src/plugin.js';

/**
 * WCAG AA for the panel's text tokens on the surfaces the agent panel puts
 * them on: the page, a hovered row, the active nav item and the selected row.
 */

function parse(color, under = [255, 255, 255]) {
    const value = String(color).trim();
    if (value.startsWith('#')) {
        const hex = value.slice(1);
        const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
        return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
    }
    const rgba = value.match(/^rgba?\(([^)]+)\)$/);
    if (rgba) {
        const [r, g, b, a = 1] = rgba[1].split(',').map(Number);
        return [r, g, b].map((c, i) => c * a + under[i] * (1 - a));
    }
    const mix = value.match(/^color-mix\(in srgb, (#[0-9a-f]+) (\d+)%, transparent\)$/i);
    if (mix) {
        const top = parse(mix[1]);
        const a = Number(mix[2]) / 100;
        return top.map((c, i) => c * a + under[i] * (1 - a));
    }
    throw new Error(`unparsed colour ${value}`);
}

function luminance(rgb) {
    const [r, g, b] = rgb.map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

describe.each(['dark', 'light'])('panel tokens in %s mode', (mode) => {
    const tokens = panelThemeTokens(mode);
    const page = parse(tokens['--esc-panel-bg']);
    const sidebar = parse(tokens['--esc-panel-sidebar-bg']);
    const surfaces = {
        page,
        sidebar,
        hover: parse(tokens['--esc-panel-hover'], page),
        active: parse(tokens['--esc-panel-active'], sidebar),
        selected: parse(tokens['--esc-panel-selected-bg'], page),
        note: parse(tokens['--esc-panel-note-bg'], page),
    };

    const text = [
        '--esc-panel-text',
        '--esc-panel-text-secondary',
        '--esc-panel-text-tertiary',
        '--esc-sla-breach',
        '--esc-sla-warn',
        '--esc-sla-ok',
    ];

    for (const token of text) {
        for (const [name, surface] of Object.entries(surfaces)) {
            it(`${token} on ${name} meets 4.5:1`, () => {
                expect(contrast(parse(tokens[token], surface), surface)).toBeGreaterThanOrEqual(4.5);
            });
        }
    }

    it('keeps the urgent pill label at 4.5:1 on its own tint', () => {
        const urgent = parse(tokens['--esc-priority-urgent']);
        for (const surface of [surfaces.page, surfaces.hover, surfaces.selected]) {
            const tint = urgent.map((c, i) => c * 0.14 + surface[i] * 0.86);
            expect(contrast(urgent, tint)).toBeGreaterThanOrEqual(4.5);
        }
    });

    it('keeps the internal-note label at 4.5:1 on the note tint', () => {
        expect(contrast(parse(tokens['--esc-panel-note-text']), surfaces.note)).toBeGreaterThanOrEqual(4.5);
    });
});
