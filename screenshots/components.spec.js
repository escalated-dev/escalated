import { test, expect } from '@playwright/test';

// Each story is rendered at /iframe.html?id=<storyId>&viewMode=story
// Story IDs follow the pattern: category-name--story-name (kebab-case)

const stories = [
    // Badges
    { id: 'components-prioritybadge--all-priorities', name: 'PriorityBadge-AllPriorities' },
    { id: 'components-statusbadge--all-statuses', name: 'StatusBadge-AllStatuses' },
    { id: 'components-statusbadge--custom-status', name: 'StatusBadge-CustomStatus' },

    // SLA Timer
    { id: 'components-slatimer--all-states', name: 'SlaTimer-AllStates' },

    // Stats & KPIs
    { id: 'components-statscard--dashboard-grid', name: 'StatsCard-DashboardGrid' },
    { id: 'components-kpicard--dashboard-row', name: 'KpiCard-DashboardRow' },

    // Agent Load
    { id: 'components-agentloadindicator--all-levels', name: 'AgentLoadIndicator-AllLevels' },

    // Timeline
    { id: 'components-activitytimeline--default', name: 'ActivityTimeline-Default' },
    { id: 'components-activitytimeline--empty', name: 'ActivityTimeline-Empty' },

    // Collision Warning
    { id: 'components-collisionwarning--single-typer', name: 'CollisionWarning-SingleTyper' },
    { id: 'components-collisionwarning--two-typers', name: 'CollisionWarning-TwoTypers' },

    // TOTP Input
    { id: 'components-totpinput--empty', name: 'TotpInput-Empty' },

    // Follow Button
    { id: 'components-followbutton--not-following', name: 'FollowButton-NotFollowing' },
    { id: 'components-followbutton--following', name: 'FollowButton-Following' },

    // Full-page composites
    { id: 'pages-admindashboard--full-dashboard', name: 'AdminDashboard-Full', fullPage: true },
    { id: 'pages-admindashboard--full-dashboard-light', name: 'AdminDashboard-Light', fullPage: true },
    { id: 'agent-pages-inbox--dark', name: 'AgentInbox-Dark', fullPage: true },
    { id: 'agent-pages-inbox--light', name: 'AgentInbox-Light', fullPage: true },
    { id: 'agent-pages-ticket--dark', name: 'AgentTicket-Dark', fullPage: true },
    { id: 'agent-pages-ticket--light', name: 'AgentTicket-Light', fullPage: true },
];

/**
 * Navigate to a story and wait for it to render.
 */
async function openStory(page, storyId) {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
    await page.waitForTimeout(500);
    const root = page.locator('#storybook-root');
    await expect(root).toBeVisible();
    return root;
}

// ----------------------------------------------------------------
// Individual component screenshots → screenshot-results/
// ----------------------------------------------------------------

for (const story of stories) {
    test(`screenshot: ${story.name}`, async ({ page }) => {
        const root = await openStory(page, story.id);
        if (story.fullPage) {
            await page.screenshot({
                path: `screenshot-results/${story.name}.png`,
                animations: 'disabled',
            });
        } else {
            await root.screenshot({
                path: `screenshot-results/${story.name}.png`,
                animations: 'disabled',
            });
        }
    });
}

// ----------------------------------------------------------------
// README hero screenshots → docs/assets/ (referenced by README.md)
// Full-page captures of the admin dashboard and the agent panel pages.
// ----------------------------------------------------------------

test('README hero: Admin Dashboard (escalated_admin_1)', async ({ page }) => {
    await openStory(page, 'pages-admindashboard--full-dashboard');
    await page.evaluate(() => {
        document.body.style.background = 'transparent';
        document.documentElement.style.background = 'transparent';
        const root = document.querySelector('#storybook-root');
        if (root?.firstElementChild) root.firstElementChild.style.background = 'transparent';
    });
    await page.screenshot({
        path: 'docs/assets/escalated_admin_1.png',
        animations: 'disabled',
        omitBackground: true,
    });
});

test('README hero: Admin Dashboard Light (escalated_admin_3)', async ({ page }) => {
    await openStory(page, 'pages-admindashboard--full-dashboard-light');
    await page.evaluate(() => {
        document.body.style.background = 'transparent';
        document.documentElement.style.background = 'transparent';
        const root = document.querySelector('#storybook-root');
        if (root?.firstElementChild) root.firstElementChild.style.background = 'transparent';
    });
    await page.screenshot({
        path: 'docs/assets/escalated_admin_3.png',
        animations: 'disabled',
        omitBackground: true,
    });
});

// The agent shots come from the real agent pages (Agent/Pages/* stories), which
// fill the viewport themselves.
async function agentShot(page, storyId, path) {
    await openStory(page, storyId);
    await page.locator('[data-testid="esc-queue-row"]').first().waitFor({ state: 'visible' });
    await page.screenshot({ path, animations: 'disabled' });
}

test('README hero: Agent inbox (escalated_ticket_list)', async ({ page }) => {
    await agentShot(page, 'agent-pages-inbox--dark', 'docs/assets/escalated_ticket_list.png');
});

test('README hero: Agent ticket, light (escalated_admin_2)', async ({ page }) => {
    await agentShot(page, 'agent-pages-ticket--light', 'docs/assets/escalated_admin_2.png');
});

test('README hero: Agent ticket (escalated_ticket_view)', async ({ page }) => {
    await agentShot(page, 'agent-pages-ticket--dark', 'docs/assets/escalated_ticket_view.png');
});

// ----------------------------------------------------------------
// README set → docs/assets/readme/<name>-<mode>.png
// The shared images every Escalated README links to, in both GitHub themes.
// Each capture is placed in a browser window on a soft background so the
// README reads like a product page rather than a raw screenshot.
// ----------------------------------------------------------------

const FRAME = {
    light: {
        page: '#f6f7fb',
        glow: ['rgba(249,115,22,0.16)', 'rgba(34,197,94,0.14)', 'rgba(59,130,246,0.18)', 'rgba(139,92,246,0.16)'],
        chrome: '#ffffff',
        border: 'rgba(15,23,42,0.10)',
        dot: '#d4d7de',
        pill: '#f1f3f7',
        pillText: '#6b7280',
        shadow: '0 30px 70px -20px rgba(15,23,42,0.28), 0 12px 24px -12px rgba(15,23,42,0.14)',
    },
    dark: {
        page: '#07080b',
        glow: ['rgba(249,115,22,0.20)', 'rgba(34,197,94,0.14)', 'rgba(59,130,246,0.24)', 'rgba(139,92,246,0.22)'],
        chrome: '#121318',
        border: 'rgba(255,255,255,0.09)',
        dot: '#2f3139',
        pill: '#1b1d24',
        pillText: '#8b8f9a',
        shadow: '0 30px 80px -20px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04)',
    },
};

function frameHtml(png, mode, url) {
    const c = FRAME[mode];
    const [g1, g2, g3, g4] = c.glow;
    return `<!doctype html><html><head><style>
        html, body { margin: 0; }
        body { font-family: Inter, -apple-system, 'Segoe UI', Roboto, sans-serif; }
        #stage {
            display: inline-block; padding: 72px 88px 88px;
            background:
                radial-gradient(60% 55% at 12% 8%, ${g1}, transparent 70%),
                radial-gradient(50% 50% at 38% 100%, ${g2}, transparent 70%),
                radial-gradient(55% 55% at 88% 12%, ${g3}, transparent 70%),
                radial-gradient(50% 60% at 100% 95%, ${g4}, transparent 70%),
                ${c.page};
        }
        .window { width: 1440px; border-radius: 14px; overflow: hidden; background: ${c.chrome};
            border: 1px solid ${c.border}; box-shadow: ${c.shadow}; }
        .bar { height: 44px; display: flex; align-items: center; gap: 8px; padding: 0 16px; border-bottom: 1px solid ${c.border}; }
        .dot { width: 12px; height: 12px; border-radius: 50%; background: ${c.dot}; }
        .pill { margin: 0 auto; transform: translateX(-30px); height: 26px; min-width: 380px; padding: 0 14px; border-radius: 7px;
            background: ${c.pill}; color: ${c.pillText}; font-size: 13px; display: flex; align-items: center; justify-content: center; }
        img { display: block; width: 1440px; }
    </style></head><body><div id="stage"><div class="window">
        <div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="pill">${url}</span></div>
        <img src="data:image/png;base64,${png.toString('base64')}">
    </div></div></body></html>`;
}

test.describe('README set', () => {
    test.use({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

    const shots = [
        {
            name: 'inbox',
            story: (m) => `agent-pages-inbox--${m}`,
            url: 'your-app.com/support/agent/tickets',
            ready: '[data-testid="esc-queue-row"]',
        },
        {
            name: 'ticket',
            story: (m) => `agent-pages-ticket--${m}`,
            url: 'your-app.com/support/agent/tickets/ESC-1042',
            ready: '[data-testid="esc-queue-row"]',
        },
        {
            name: 'dashboard',
            story: (m) => `pages-admindashboard--full-dashboard${m === 'light' ? '-light' : ''}`,
            url: 'your-app.com/support/admin/reports',
            // The story wraps the app in a padded card; capture just the app.
            element: 'xpath=//aside/..',
        },
        { name: 'portal', story: (m) => `customer-pages-portal--${m}`, url: 'your-app.com/support/tickets' },
    ];

    for (const shot of shots) {
        for (const mode of ['dark', 'light']) {
            test(`${shot.name}-${mode}`, async ({ page }) => {
                await openStory(page, shot.story(mode));
                if (shot.ready) await page.locator(shot.ready).first().waitFor({ state: 'visible' });
                await page.evaluate(() => document.fonts.ready);
                const options = { animations: 'disabled', caret: 'hide' };
                let png;
                if (shot.element) {
                    const el = page.locator(shot.element).first();
                    await el.evaluate((node) => {
                        node.style.borderRadius = '0';
                        node.style.border = '0';
                        node.style.width = '1440px';
                        node.style.minHeight = '900px';
                    });
                    png = await el.screenshot(options);
                } else {
                    png = await page.screenshot(options);
                }

                await page.setViewportSize({ width: 1800, height: 1200 });
                await page.setContent(frameHtml(png, mode, shot.url));
                await page.locator('#stage img').evaluate((img) => img.decode());
                await page
                    .locator('#stage')
                    .screenshot({ path: `docs/assets/readme/${shot.name}-${mode}.png`, ...options });
            });
        }
    }
});
