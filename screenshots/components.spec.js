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
        await root.screenshot({
            path: `screenshot-results/${story.name}.png`,
            animations: 'disabled',
        });
    });
}

// ----------------------------------------------------------------
// README hero screenshots → docs/assets/ (referenced by README.md)
// Full-page viewport captures with centered content for the README.
// ----------------------------------------------------------------

/**
 * Prepare the page for a hero screenshot: fill the viewport background
 * and center the story content both horizontally and vertically.
 */
async function prepareHeroShot(page, storyId) {
    await openStory(page, storyId);
    await page.addStyleTag({
        content: `
            body { background: #171717 !important; margin: 0; }
            #storybook-root {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                min-height: 100vh !important;
            }
            #storybook-root > * {
                width: 100%;
                max-width: 900px;
            }
        `,
    });
    await page.waitForTimeout(300);
}

test('README hero: Dashboard components (escalated_admin_1)', async ({ page }) => {
    await prepareHeroShot(page, 'components-statscard--dashboard-grid');
    await page.screenshot({
        path: 'docs/assets/escalated_admin_1.png',
        animations: 'disabled',
    });
});

test('README hero: KPI metrics (escalated_admin_2)', async ({ page }) => {
    await prepareHeroShot(page, 'components-kpicard--dashboard-row');
    await page.screenshot({
        path: 'docs/assets/escalated_admin_2.png',
        animations: 'disabled',
    });
});
