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

for (const story of stories) {
    test(`screenshot: ${story.name}`, async ({ page }) => {
        await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);

        // Wait for the story to render
        await page.waitForSelector('#storybook-root', { state: 'attached' });
        await page.waitForTimeout(500); // Allow animations to settle

        const root = page.locator('#storybook-root');
        await expect(root).toBeVisible();

        await root.screenshot({
            path: `screenshot-results/${story.name}.png`,
            animations: 'disabled',
        });
    });
}
