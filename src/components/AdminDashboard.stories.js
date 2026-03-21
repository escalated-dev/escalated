import StatsCard from './StatsCard.vue';
import KpiCard from './KpiCard.vue';
import StatusBadge from './StatusBadge.vue';
import PriorityBadge from './PriorityBadge.vue';
import AgentLoadIndicator from './AgentLoadIndicator.vue';

export default {
    title: 'Pages/AdminDashboard',
};

const sidebarLinks = [
    {
        label: 'Reports',
        icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
        active: true,
    },
    {
        label: 'Tickets',
        icon: 'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z',
        badge: '24',
    },
    {
        label: 'Departments',
        icon: 'M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z',
    },
    { label: 'SLA Policies', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    {
        label: 'Knowledge Base',
        icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
    },
    { label: 'Escalation Rules', icon: 'M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12' },
    {
        label: 'Automations',
        icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182',
    },
    {
        label: 'Tags',
        icon: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z',
    },
    {
        label: 'Plugins',
        icon: 'M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z',
    },
    {
        label: 'Settings',
        icon: 'M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.781.93l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
    },
];

const tickets = [
    {
        ref: 'ESC-1042',
        subject: 'Unable to export CSV reports from dashboard',
        requester: 'Sarah Chen',
        email: 'sarah@acme.co',
        status: 'open',
        priority: 'high',
        ago: '12m ago',
        author: 'Agent Mike',
        sla: 'green',
    },
    {
        ref: 'ESC-1041',
        subject: 'SSO login redirect loop on Firefox',
        requester: 'James Wilson',
        email: 'james@corp.io',
        status: 'pending',
        priority: 'urgent',
        ago: '34m ago',
        author: 'Sarah Chen',
        sla: 'amber',
    },
    {
        ref: 'ESC-1040',
        subject: 'Custom field values not persisting after save',
        requester: 'Maria Garcia',
        email: 'maria@startup.dev',
        status: 'open',
        priority: 'medium',
        ago: '1h ago',
        author: 'Agent Lisa',
        sla: 'green',
    },
    {
        ref: 'ESC-1039',
        subject: 'Webhook notifications delayed by 15+ minutes',
        requester: 'Tom Baker',
        email: 'tom@enterprise.com',
        status: 'open',
        priority: 'high',
        ago: '2h ago',
        author: 'Tom Baker',
        sla: 'red',
    },
    {
        ref: 'ESC-1038',
        subject: 'Knowledge base search returning no results',
        requester: 'Priya Patel',
        email: 'priya@example.com',
        status: 'solved',
        priority: 'medium',
        ago: '3h ago',
        author: 'Agent Mike',
        sla: '',
    },
    {
        ref: 'ESC-1037',
        subject: 'Feature request: Dark mode for customer portal',
        requester: 'Alex Kim',
        email: 'alex@design.co',
        status: 'open',
        priority: 'low',
        ago: '5h ago',
        author: 'Alex Kim',
        sla: '',
    },
];

/**
 * Full admin dashboard with sidebar, top bar, stats cards, and ticket list.
 * Used for README hero screenshot.
 */
export const FullDashboard = {
    render: () => ({
        components: { StatsCard, KpiCard, StatusBadge, PriorityBadge, AgentLoadIndicator },
        data: () => ({ sidebarLinks, tickets }),
        template: `
            <div style="display:flex; min-height:720px; background:#000; color:#fff; font-family: ui-sans-serif, system-ui, sans-serif; border-radius: 12px; overflow: hidden;">
                <!-- Sidebar -->
                <aside style="width:240px; background:#0a0a0a; border-right:1px solid rgba(255,255,255,0.06); display:flex; flex-direction:column; flex-shrink:0;">
                    <!-- Logo -->
                    <div style="height:56px; display:flex; align-items:center; gap:10px; padding:0 16px;">
                        <div style="width:32px; height:32px; border-radius:8px; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <defs><linearGradient id="esc-rb" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f97316"/><stop offset="30%" stop-color="#eab308"/><stop offset="50%" stop-color="#22c55e"/><stop offset="70%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs>
                                <g transform="translate(12,12) scale(1.35) translate(-12,-12)"><polyline points="17 11 12 6 7 11" stroke="url(#esc-rb)"/><polyline points="17 18 12 13 7 18" stroke="url(#esc-rb)"/></g>
                            </svg>
                        </div>
                        <div>
                            <span style="font-size:13px; font-weight:700; letter-spacing:0.02em;">Escalated</span>
                            <span style="margin-left:6px; background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; font-size:10px; font-weight:600; color:#737373;">ADMIN</span>
                        </div>
                    </div>

                    <!-- Nav links -->
                    <nav style="flex:1; padding:4px 10px; display:flex; flex-direction:column; gap:1px; overflow-y:auto;">
                        <a v-for="link in sidebarLinks" :key="link.label"
                           :style="{
                               display: 'flex', alignItems: 'center', gap: '10px',
                               padding: '7px 10px', borderRadius: '8px',
                               fontSize: '13px', fontWeight: '500', textDecoration: 'none',
                               color: link.active ? '#fff' : '#737373',
                               background: link.active ? 'rgba(255,255,255,0.08)' : 'transparent',
                           }">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :stroke="link.active ? '#fff' : '#737373'" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" :d="link.icon"/></svg>
                            {{ link.label }}
                            <span v-if="link.badge" style="margin-left:auto; background:rgba(6,182,212,0.2); color:#06b6d4; font-size:10px; font-weight:600; padding:1px 6px; border-radius:10px;">{{ link.badge }}</span>
                        </a>
                    </nav>

                    <!-- Bottom user -->
                    <div style="border-top:1px solid rgba(255,255,255,0.06); padding:10px;">
                        <div style="display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.03); border-radius:8px; padding:8px 10px;">
                            <div style="width:28px; height:28px; border-radius:6px; background:rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; color:#a3a3a3;">J</div>
                            <span style="font-size:13px; color:#a3a3a3;">Jane Admin</span>
                        </div>
                    </div>
                </aside>

                <!-- Main -->
                <div style="flex:1; display:flex; flex-direction:column; min-width:0;">
                    <!-- Top bar -->
                    <header style="height:48px; display:flex; align-items:center; border-bottom:1px solid rgba(255,255,255,0.06); background:rgba(0,0,0,0.8); padding:0 20px; backdrop-filter:blur(12px); flex-shrink:0;">
                        <span style="font-size:13px; font-weight:600;">Reports</span>
                    </header>

                    <!-- Content -->
                    <main style="flex:1; padding:20px; overflow-y:auto;">
                        <!-- KPI row -->
                        <div class="grid grid-cols-3 gap-4" style="margin-bottom:20px;">
                            <KpiCard label="Total Tickets" :value="1284" :trend="5" icon="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859" />
                            <KpiCard label="Avg Response Time" value="1h 42m" :trend="-18" icon="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <KpiCard label="CSAT Score" value="94%" :trend="3" icon="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </div>

                        <!-- Stats row -->
                        <div class="grid grid-cols-4 gap-4" style="margin-bottom:20px;">
                            <StatsCard label="Open Tickets" :value="142" trend="+8% this week" color="blue" />
                            <StatsCard label="Resolved Today" :value="38" trend="+12% vs yesterday" color="green" />
                            <StatsCard label="Avg Response" value="2h 14m" trend="-18% improvement" color="cyan" />
                            <StatsCard label="SLA Breaches" :value="3" trend="-25% vs last week" color="red" />
                        </div>

                        <!-- Recent tickets table -->
                        <div style="border-radius:12px; border:1px solid rgba(255,255,255,0.06); background:rgba(23,23,23,0.6); overflow:hidden;">
                            <div style="padding:12px 16px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between;">
                                <span style="font-size:13px; font-weight:600;">Recent Tickets</span>
                                <span style="font-size:12px; color:#737373;">Last 24 hours</span>
                            </div>
                            <table style="width:100%; border-collapse:collapse;">
                                <thead>
                                    <tr style="background:rgba(255,255,255,0.02);">
                                        <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252;">Reference</th>
                                        <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252;">Subject</th>
                                        <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252;">Requester</th>
                                        <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252;">Status</th>
                                        <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252;">Priority</th>
                                        <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252;">Last Reply</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="t in tickets" :key="t.ref" style="border-top:1px solid rgba(255,255,255,0.04);" class="hover:bg-white/[0.03]">
                                        <td style="padding:10px 14px; font-size:13px; font-weight:500; white-space:nowrap;">
                                            <div style="display:flex; align-items:center; gap:6px;">
                                                <span v-if="t.sla" :style="{ width:'7px', height:'7px', borderRadius:'50%', background: t.sla === 'red' ? '#ef4444' : t.sla === 'amber' ? '#f59e0b' : '#22c55e' }"></span>
                                                <span style="color:#22d3ee;">{{ t.ref }}</span>
                                            </div>
                                        </td>
                                        <td style="padding:10px 14px; font-size:13px; color:#d4d4d4; max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{{ t.subject }}</td>
                                        <td style="padding:10px 14px;">
                                            <div style="font-size:13px; color:#a3a3a3;">{{ t.requester }}</div>
                                            <div style="font-size:11px; color:#525252;">{{ t.email }}</div>
                                        </td>
                                        <td style="padding:10px 14px;"><StatusBadge :status="t.status" /></td>
                                        <td style="padding:10px 14px;"><PriorityBadge :priority="t.priority" /></td>
                                        <td style="padding:10px 14px; white-space:nowrap;">
                                            <div style="font-size:13px; color:#a3a3a3;">{{ t.ago }}</div>
                                            <div style="font-size:11px; color:#525252;">{{ t.author }}</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </main>
                </div>
            </div>
        `,
    }),
};

/**
 * Agent panel view with top navigation bar, dashboard stats, and ticket list.
 * Used for README hero screenshot.
 */
export const AgentPanel = {
    render: () => ({
        components: { StatsCard, StatusBadge, PriorityBadge, AgentLoadIndicator },
        data: () => ({
            tickets: [
                {
                    ref: 'ESC-1042',
                    subject: 'Unable to export CSV reports from dashboard',
                    requester: 'Sarah Chen',
                    status: 'open',
                    priority: 'high',
                    ago: '12m ago',
                    sla: 'green',
                },
                {
                    ref: 'ESC-1041',
                    subject: 'SSO login redirect loop on Firefox',
                    requester: 'James Wilson',
                    status: 'pending',
                    priority: 'urgent',
                    ago: '34m ago',
                    sla: 'amber',
                },
                {
                    ref: 'ESC-1040',
                    subject: 'Custom field values not persisting after save',
                    requester: 'Maria Garcia',
                    status: 'open',
                    priority: 'medium',
                    ago: '1h ago',
                    sla: 'green',
                },
                {
                    ref: 'ESC-1039',
                    subject: 'Webhook notifications delayed by 15+ minutes',
                    requester: 'Tom Baker',
                    status: 'open',
                    priority: 'high',
                    ago: '2h ago',
                    sla: 'red',
                },
                {
                    ref: 'ESC-1038',
                    subject: 'Knowledge base search returning no results',
                    requester: 'Priya Patel',
                    status: 'solved',
                    priority: 'medium',
                    ago: '3h ago',
                    sla: '',
                },
            ],
        }),
        template: `
            <div style="min-height:720px; background:#000; color:#fff; font-family: ui-sans-serif, system-ui, sans-serif; border-radius: 12px; overflow: hidden;">
                <!-- Top nav -->
                <nav style="height:48px; border-bottom:1px solid rgba(255,255,255,0.06); background:#0a0a0a; display:flex; align-items:center; justify-content:space-between; padding:0 24px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:30px; height:30px; border-radius:8px; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <defs><linearGradient id="esc-rb2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f97316"/><stop offset="30%" stop-color="#eab308"/><stop offset="50%" stop-color="#22c55e"/><stop offset="70%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs>
                                <g transform="translate(12,12) scale(1.35) translate(-12,-12)"><polyline points="17 11 12 6 7 11" stroke="url(#esc-rb2)"/><polyline points="17 18 12 13 7 18" stroke="url(#esc-rb2)"/></g>
                            </svg>
                        </div>
                        <span style="font-size:13px; font-weight:700; letter-spacing:0.02em;">Escalated</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:4px;">
                        <span style="background:rgba(255,255,255,0.08); padding:5px 12px; border-radius:8px; font-size:13px; font-weight:500;">Dashboard</span>
                        <span style="padding:5px 12px; border-radius:8px; font-size:13px; font-weight:500; color:#737373;">Tickets</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-size:13px; color:#737373;">Admin</span>
                        <div style="width:1px; height:16px; background:rgba(255,255,255,0.08);"></div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div style="width:26px; height:26px; border-radius:6px; background:rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:600; color:#a3a3a3;">M</div>
                            <span style="font-size:13px; color:#a3a3a3;">Mike Agent</span>
                        </div>
                    </div>
                </nav>

                <!-- Content -->
                <main style="max-width:1100px; margin:0 auto; padding:20px 24px;">
                    <!-- Stats -->
                    <div class="grid grid-cols-4 gap-4" style="margin-bottom:20px;">
                        <StatsCard label="My Open" :value="18" trend="+2 today" color="blue" />
                        <StatsCard label="Unassigned" :value="7" trend="3 urgent" color="red" />
                        <StatsCard label="Avg Response" value="1h 08m" trend="-22% this week" color="cyan" />
                        <StatsCard label="Resolved Today" :value="12" trend="+4 vs yesterday" color="green" />
                    </div>

                    <!-- My tickets table -->
                    <div style="border-radius:12px; border:1px solid rgba(255,255,255,0.06); background:rgba(23,23,23,0.6); overflow:hidden;">
                        <div style="padding:12px 16px; border-bottom:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between;">
                            <span style="font-size:13px; font-weight:600;">My Tickets</span>
                            <span style="font-size:12px; color:#737373;">Assigned to me</span>
                        </div>
                        <table style="width:100%; border-collapse:collapse;">
                            <thead>
                                <tr style="background:rgba(255,255,255,0.02);">
                                    <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252;">Reference</th>
                                    <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252;">Subject</th>
                                    <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252;">Requester</th>
                                    <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252;">Status</th>
                                    <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252;">Priority</th>
                                    <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252;">Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="t in tickets" :key="t.ref" style="border-top:1px solid rgba(255,255,255,0.04);">
                                    <td style="padding:10px 14px; font-size:13px; font-weight:500; white-space:nowrap;">
                                        <div style="display:flex; align-items:center; gap:6px;">
                                            <span v-if="t.sla" :style="{ width:'7px', height:'7px', borderRadius:'50%', background: t.sla === 'red' ? '#ef4444' : t.sla === 'amber' ? '#f59e0b' : '#22c55e' }"></span>
                                            <span style="color:#22d3ee;">{{ t.ref }}</span>
                                        </div>
                                    </td>
                                    <td style="padding:10px 14px; font-size:13px; color:#d4d4d4; max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{{ t.subject }}</td>
                                    <td style="padding:10px 14px; font-size:13px; color:#a3a3a3;">{{ t.requester }}</td>
                                    <td style="padding:10px 14px;"><StatusBadge :status="t.status" /></td>
                                    <td style="padding:10px 14px;"><PriorityBadge :priority="t.priority" /></td>
                                    <td style="padding:10px 14px; font-size:13px; color:#a3a3a3; white-space:nowrap;">{{ t.ago }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        `,
    }),
};
