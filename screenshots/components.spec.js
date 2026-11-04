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
