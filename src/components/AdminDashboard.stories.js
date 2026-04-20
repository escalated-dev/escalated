import { computed } from 'vue';
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
 * Light mode admin dashboard — same layout, light theme.
 * Used for README hero screenshot.
 */
export const FullDashboardLight = {
    render: () => ({
        components: { StatsCard, KpiCard, StatusBadge, PriorityBadge, AgentLoadIndicator },
        data: () => ({ sidebarLinks, tickets }),
        provide: { 'esc-dark': computed(() => false) },
        template: `
            <div style="display:flex; min-height:720px; background:#f9fafb; color:#111827; font-family: ui-sans-serif, system-ui, sans-serif; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
                <aside style="width:240px; background:#ffffff; border-right:1px solid #e5e7eb; display:flex; flex-direction:column; flex-shrink:0;">
                    <div style="height:56px; display:flex; align-items:center; gap:10px; padding:0 16px;">
                        <div style="width:32px; height:32px; border-radius:8px; background:#f3f4f6; display:flex; align-items:center; justify-content:center;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <defs><linearGradient id="esc-rb-l" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f97316"/><stop offset="30%" stop-color="#eab308"/><stop offset="50%" stop-color="#22c55e"/><stop offset="70%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs>
                                <g transform="translate(12,12) scale(1.35) translate(-12,-12)"><polyline points="17 11 12 6 7 11" stroke="url(#esc-rb-l)"/><polyline points="17 18 12 13 7 18" stroke="url(#esc-rb-l)"/></g>
                            </svg>
                        </div>
                        <div>
                            <span style="font-size:13px; font-weight:700; letter-spacing:0.02em; color:#111827;">Escalated</span>
                            <span style="margin-left:6px; background:#eff6ff; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:600; color:#3b82f6;">ADMIN</span>
                        </div>
                    </div>
                    <nav style="flex:1; padding:4px 10px; display:flex; flex-direction:column; gap:1px; overflow-y:auto;">
                        <a v-for="link in sidebarLinks" :key="link.label" :style="{ display:'flex', alignItems:'center', gap:'10px', padding:'7px 10px', borderRadius:'8px', fontSize:'13px', fontWeight:'500', textDecoration:'none', color: link.active ? '#111827' : '#6b7280', background: link.active ? '#eff6ff' : 'transparent' }">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :stroke="link.active ? '#3b82f6' : '#9ca3af'" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" :d="link.icon"/></svg>
                            {{ link.label }}
                            <span v-if="link.badge" style="margin-left:auto; background:#dbeafe; color:#2563eb; font-size:10px; font-weight:600; padding:1px 6px; border-radius:10px;">{{ link.badge }}</span>
                        </a>
                    </nav>
                    <div style="border-top:1px solid #e5e7eb; padding:10px;">
                        <div style="display:flex; align-items:center; gap:10px; background:#f9fafb; border-radius:8px; padding:8px 10px;">
                            <div style="width:28px; height:28px; border-radius:6px; background:#e5e7eb; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; color:#374151;">J</div>
                            <span style="font-size:13px; color:#374151;">Jane Admin</span>
                        </div>
                    </div>
                </aside>
                <div style="flex:1; display:flex; flex-direction:column; min-width:0;">
                    <header style="height:48px; display:flex; align-items:center; border-bottom:1px solid #e5e7eb; background:rgba(255,255,255,0.95); padding:0 20px; backdrop-filter:blur(12px); flex-shrink:0;">
                        <span style="font-size:13px; font-weight:600; color:#111827;">Reports</span>
                    </header>
                    <main style="flex:1; padding:20px; overflow-y:auto;">
                        <div class="grid grid-cols-3 gap-4" style="margin-bottom:20px;">
                            <KpiCard label="Total Tickets" :value="1284" :trend="5" icon="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859" />
                            <KpiCard label="Avg Response Time" value="1h 42m" :trend="-18" icon="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <KpiCard label="CSAT Score" value="94%" :trend="3" icon="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </div>
                        <div class="grid grid-cols-4 gap-4" style="margin-bottom:20px;">
                            <StatsCard label="Open Tickets" :value="142" trend="+8% this week" color="blue" />
                            <StatsCard label="Resolved Today" :value="38" trend="+12% vs yesterday" color="green" />
                            <StatsCard label="Avg Response" value="2h 14m" trend="-18% improvement" color="cyan" />
                            <StatsCard label="SLA Breaches" :value="3" trend="-25% vs last week" color="red" />
                        </div>
                        <div style="border-radius:12px; border:1px solid #e5e7eb; background:#ffffff; overflow:hidden;">
                            <div style="padding:12px 16px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; justify-content:space-between;">
                                <span style="font-size:13px; font-weight:600; color:#111827;">Recent Tickets</span>
                                <span style="font-size:12px; color:#9ca3af;">Last 24 hours</span>
                            </div>
                            <table style="width:100%; border-collapse:collapse;">
                                <thead><tr style="background:#f9fafb;">
                                    <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#6b7280;">Reference</th>
                                    <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#6b7280;">Subject</th>
                                    <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#6b7280;">Requester</th>
                                    <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#6b7280;">Status</th>
                                    <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#6b7280;">Priority</th>
                                    <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#6b7280;">Last Reply</th>
                                </tr></thead>
                                <tbody>
                                    <tr v-for="t in tickets" :key="t.ref" style="border-top:1px solid #f3f4f6;">
                                        <td style="padding:10px 14px; font-size:13px; font-weight:500; white-space:nowrap;"><div style="display:flex; align-items:center; gap:6px;"><span v-if="t.sla" :style="{ width:'7px', height:'7px', borderRadius:'50%', background: t.sla === 'red' ? '#ef4444' : t.sla === 'amber' ? '#f59e0b' : '#22c55e' }"></span><span style="color:#2563eb;">{{ t.ref }}</span></div></td>
                                        <td style="padding:10px 14px; font-size:13px; color:#111827; max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{{ t.subject }}</td>
                                        <td style="padding:10px 14px;"><div style="font-size:13px; color:#374151;">{{ t.requester }}</div><div style="font-size:11px; color:#9ca3af;">{{ t.email }}</div></td>
                                        <td style="padding:10px 14px;"><StatusBadge :status="t.status" /></td>
                                        <td style="padding:10px 14px;"><PriorityBadge :priority="t.priority" /></td>
                                        <td style="padding:10px 14px; white-space:nowrap;"><div style="font-size:13px; color:#374151;">{{ t.ago }}</div><div style="font-size:11px; color:#9ca3af;">{{ t.author }}</div></td>
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

/**
 * Ticket detail view — agent viewing a single ticket with conversation thread and sidebar.
 * Dark mode. Used for README hero screenshot.
 */
export const TicketDetailView = {
    render: () => ({
        components: { StatusBadge, PriorityBadge },
        data: () => ({
            messages: [
                {
                    id: 1,
                    author: 'Sarah Chen',
                    initial: 'S',
                    role: 'customer',
                    time: 'Mar 20, 2026 at 2:14 PM',
                    text: "Hi, I'm trying to export our monthly CSV report from the dashboard but the download never starts. I've tried Chrome and Firefox, both on macOS. The button spinner appears but then nothing happens after about 30 seconds. This is blocking our end-of-quarter review.",
                },
                {
                    id: 2,
                    author: 'Mike Agent',
                    initial: 'M',
                    role: 'agent',
                    time: 'Mar 20, 2026 at 2:32 PM',
                    text: "Hi Sarah, thanks for reporting this. I can reproduce the issue on our end. It looks like exports with more than 10,000 rows are timing out. I've escalated this to our engineering team and we're working on a fix. In the meantime, could you try filtering to a smaller date range as a workaround?",
                },
                {
                    id: 3,
                    author: 'Sarah Chen',
                    initial: 'S',
                    role: 'customer',
                    time: 'Mar 20, 2026 at 3:05 PM',
                    text: 'Thanks Mike! Filtering to a single month did work as a workaround. That said, we really need the full quarter export for our finance team. Is there an ETA on the fix?',
                },
                {
                    id: 4,
                    author: 'Mike Agent',
                    initial: 'M',
                    role: 'agent',
                    time: 'Mar 20, 2026 at 3:18 PM',
                    text: "Great to hear the workaround helped! Engineering has identified the root cause — it's a memory limit on the export worker. The fix is in review and should ship by tomorrow morning. I'll update this ticket as soon as it's deployed.",
                },
            ],
            activeTab: 'reply',
        }),
        template: `
            <div style="min-height:720px; background:#000; color:#fff; font-family: ui-sans-serif, system-ui, sans-serif; border-radius: 12px; overflow: hidden;">
                <!-- Top nav (same as AgentPanel) -->
                <nav style="height:48px; border-bottom:1px solid rgba(255,255,255,0.06); background:#0a0a0a; display:flex; align-items:center; justify-content:space-between; padding:0 24px; flex-shrink:0;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:30px; height:30px; border-radius:8px; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <defs><linearGradient id="esc-rb3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f97316"/><stop offset="30%" stop-color="#eab308"/><stop offset="50%" stop-color="#22c55e"/><stop offset="70%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs>
                                <g transform="translate(12,12) scale(1.35) translate(-12,-12)"><polyline points="17 11 12 6 7 11" stroke="url(#esc-rb3)"/><polyline points="17 18 12 13 7 18" stroke="url(#esc-rb3)"/></g>
                            </svg>
                        </div>
                        <span style="font-size:13px; font-weight:700; letter-spacing:0.02em;">Escalated</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:4px;">
                        <span style="padding:5px 12px; border-radius:8px; font-size:13px; font-weight:500; color:#737373;">Dashboard</span>
                        <span style="background:rgba(255,255,255,0.08); padding:5px 12px; border-radius:8px; font-size:13px; font-weight:500;">Tickets</span>
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

                <!-- Main content area: left (thread) + right (sidebar) -->
                <div style="display:flex; flex:1; min-height:672px;">
                    <!-- Left: ticket thread -->
                    <div style="flex:7; display:flex; flex-direction:column; border-right:1px solid rgba(255,255,255,0.06);">
                        <!-- Ticket header -->
                        <div style="padding:16px 24px; border-bottom:1px solid rgba(255,255,255,0.06);">
                            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                                <span style="font-size:13px; color:#22d3ee; font-weight:500;">ESC-1042</span>
                                <StatusBadge status="in_progress" />
                                <PriorityBadge priority="high" />
                            </div>
                            <h1 style="font-size:16px; font-weight:600; margin:0; color:#f5f5f5;">Unable to export CSV reports from dashboard</h1>
                        </div>

                        <!-- Conversation thread -->
                        <div style="flex:1; overflow-y:auto; padding:16px 24px; display:flex; flex-direction:column; gap:16px;">
                            <div v-for="msg in messages" :key="msg.id" style="display:flex; gap:12px;">
                                <!-- Avatar -->
                                <div :style="{
                                    width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '12px', fontWeight: '600',
                                    background: msg.role === 'agent' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.08)',
                                    color: msg.role === 'agent' ? '#60a5fa' : '#a3a3a3',
                                }">{{ msg.initial }}</div>
                                <!-- Message body -->
                                <div style="flex:1; min-width:0;">
                                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                                        <span style="font-size:13px; font-weight:600;" :style="{ color: msg.role === 'agent' ? '#60a5fa' : '#e5e5e5' }">{{ msg.author }}</span>
                                        <span v-if="msg.role === 'agent'" style="font-size:10px; background:rgba(59,130,246,0.12); color:#60a5fa; padding:1px 6px; border-radius:4px; font-weight:500;">Agent</span>
                                        <span style="font-size:11px; color:#525252;">{{ msg.time }}</span>
                                    </div>
                                    <div style="font-size:13px; line-height:1.6; color:#d4d4d4; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.04); border-radius:10px; padding:10px 14px;">
                                        {{ msg.text }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Reply composer -->
                        <div style="border-top:1px solid rgba(255,255,255,0.06); padding:12px 24px;">
                            <div style="display:flex; gap:0; margin-bottom:8px;">
                                <button :style="{
                                    padding: '5px 14px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer', borderRadius: '6px 0 0 6px',
                                    background: activeTab === 'reply' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                                    color: activeTab === 'reply' ? '#60a5fa' : '#737373',
                                }" @click="activeTab = 'reply'">Reply</button>
                                <button :style="{
                                    padding: '5px 14px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer', borderRadius: '0 6px 6px 0',
                                    background: activeTab === 'note' ? 'rgba(234,179,8,0.12)' : 'rgba(255,255,255,0.05)',
                                    color: activeTab === 'note' ? '#facc15' : '#737373',
                                }" @click="activeTab = 'note'">Internal Note</button>
                            </div>
                            <div style="position:relative;">
                                <textarea :placeholder="activeTab === 'reply' ? 'Type your reply...' : 'Add an internal note...'" style="width:100%; min-height:68px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:10px 14px; font-size:13px; color:#e5e5e5; resize:none; font-family:inherit; box-sizing:border-box;" />
                                <div style="display:flex; justify-content:flex-end; margin-top:8px;">
                                    <span :style="{
                                        padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                        background: activeTab === 'reply' ? '#3b82f6' : '#ca8a04',
                                        color: '#fff',
                                    }">{{ activeTab === 'reply' ? 'Send Reply' : 'Add Note' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right: ticket sidebar -->
                    <div style="flex:3; padding:16px; overflow-y:auto; background:rgba(10,10,10,0.5);">
                        <!-- Assignee -->
                        <div style="margin-bottom:20px;">
                            <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252; margin-bottom:6px;">Assignee</div>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <div style="width:28px; height:28px; border-radius:6px; background:rgba(59,130,246,0.15); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; color:#60a5fa;">M</div>
                                <div>
                                    <div style="font-size:13px; font-weight:500; color:#e5e5e5;">Mike Agent</div>
                                    <div style="font-size:11px; color:#525252;">Support Team</div>
                                </div>
                            </div>
                        </div>

                        <!-- Department -->
                        <div style="margin-bottom:20px;">
                            <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252; margin-bottom:6px;">Department</div>
                            <div style="font-size:13px; color:#a3a3a3;">Technical Support</div>
                        </div>

                        <!-- Tags -->
                        <div style="margin-bottom:20px;">
                            <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252; margin-bottom:6px;">Tags</div>
                            <div style="display:flex; flex-wrap:wrap; gap:4px;">
                                <span style="background:rgba(255,255,255,0.06); color:#a3a3a3; font-size:11px; padding:2px 8px; border-radius:6px;">csv-export</span>
                                <span style="background:rgba(255,255,255,0.06); color:#a3a3a3; font-size:11px; padding:2px 8px; border-radius:6px;">dashboard</span>
                                <span style="background:rgba(255,255,255,0.06); color:#a3a3a3; font-size:11px; padding:2px 8px; border-radius:6px;">bug</span>
                            </div>
                        </div>

                        <!-- SLA Timer -->
                        <div style="margin-bottom:20px;">
                            <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252; margin-bottom:6px;">SLA</div>
                            <div style="border:1px solid rgba(16,185,129,0.2); background:rgba(16,185,129,0.08); border-radius:8px; padding:8px 12px;">
                                <div style="font-size:12px; font-weight:500; color:#34d399;">Next Response Due</div>
                                <div style="font-size:11px; color:#34d399;">3h 42m remaining</div>
                            </div>
                        </div>

                        <!-- Requester Info -->
                        <div style="margin-bottom:20px;">
                            <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252; margin-bottom:6px;">Requester</div>
                            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:10px 12px;">
                                <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                                    <div style="width:28px; height:28px; border-radius:6px; background:rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; color:#a3a3a3;">S</div>
                                    <div>
                                        <div style="font-size:13px; font-weight:500; color:#e5e5e5;">Sarah Chen</div>
                                        <div style="font-size:11px; color:#525252;">sarah@acme.co</div>
                                    </div>
                                </div>
                                <div style="display:flex; justify-content:space-between; font-size:11px; color:#525252; border-top:1px solid rgba(255,255,255,0.04); padding-top:8px;">
                                    <span>Org: Acme Corp</span>
                                    <span>12 tickets</span>
                                </div>
                            </div>
                        </div>

                        <!-- Created / Updated -->
                        <div>
                            <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252; margin-bottom:6px;">Details</div>
                            <div style="font-size:12px; color:#525252; display:flex; flex-direction:column; gap:4px;">
                                <div style="display:flex; justify-content:space-between;"><span>Created</span><span style="color:#737373;">Mar 20, 2026</span></div>
                                <div style="display:flex; justify-content:space-between;"><span>Updated</span><span style="color:#737373;">2 min ago</span></div>
                                <div style="display:flex; justify-content:space-between;"><span>Channel</span><span style="color:#737373;">Email</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
    }),
};

export const AgentPanelLight = {
    render: () => ({
        components: { StatsCard, StatusBadge, PriorityBadge, AgentLoadIndicator },
        provide: { 'esc-dark': computed(() => false) },
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
            <div style="min-height:720px; background:#f9fafb; color:#111827; font-family: ui-sans-serif, system-ui, sans-serif; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
                <!-- Top nav -->
                <nav style="height:48px; border-bottom:1px solid #e5e7eb; background:#ffffff; display:flex; align-items:center; justify-content:space-between; padding:0 24px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:30px; height:30px; border-radius:8px; background:#f3f4f6; display:flex; align-items:center; justify-content:center;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <defs><linearGradient id="esc-rb2l" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f97316"/><stop offset="30%" stop-color="#eab308"/><stop offset="50%" stop-color="#22c55e"/><stop offset="70%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs>
                                <g transform="translate(12,12) scale(1.35) translate(-12,-12)"><polyline points="17 11 12 6 7 11" stroke="url(#esc-rb2l)"/><polyline points="17 18 12 13 7 18" stroke="url(#esc-rb2l)"/></g>
                            </svg>
                        </div>
                        <span style="font-size:13px; font-weight:700; letter-spacing:0.02em;">Escalated</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:4px;">
                        <span style="background:#eff6ff; padding:5px 12px; border-radius:8px; font-size:13px; font-weight:500;">Dashboard</span>
                        <span style="padding:5px 12px; border-radius:8px; font-size:13px; font-weight:500; color:#6b7280;">Tickets</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-size:13px; color:#6b7280;">Admin</span>
                        <div style="width:1px; height:16px; background:#eff6ff;"></div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div style="width:26px; height:26px; border-radius:6px; background:#eff6ff; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:600; color:#374151;">M</div>
                            <span style="font-size:13px; color:#374151;">Mike Agent</span>
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
                    <div style="border-radius:12px; border:1px solid #e5e7eb; background:#ffffff; overflow:hidden;">
                        <div style="padding:12px 16px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; justify-content:space-between;">
                            <span style="font-size:13px; font-weight:600;">My Tickets</span>
                            <span style="font-size:12px; color:#6b7280;">Assigned to me</span>
                        </div>
                        <table style="width:100%; border-collapse:collapse;">
                            <thead>
                                <tr style="background:#f3f4f6;">
                                    <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#6b7280;">Reference</th>
                                    <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#6b7280;">Subject</th>
                                    <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#6b7280;">Requester</th>
                                    <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#6b7280;">Status</th>
                                    <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#6b7280;">Priority</th>
                                    <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#6b7280;">Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="t in tickets" :key="t.ref" style="border-top:1px solid #f3f4f6;">
                                    <td style="padding:10px 14px; font-size:13px; font-weight:500; white-space:nowrap;">
                                        <div style="display:flex; align-items:center; gap:6px;">
                                            <span v-if="t.sla" :style="{ width:'7px', height:'7px', borderRadius:'50%', background: t.sla === 'red' ? '#ef4444' : t.sla === 'amber' ? '#f59e0b' : '#22c55e' }"></span>
                                            <span style="color:#2563eb;">{{ t.ref }}</span>
                                        </div>
                                    </td>
                                    <td style="padding:10px 14px; font-size:13px; color:#111827; max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{{ t.subject }}</td>
                                    <td style="padding:10px 14px; font-size:13px; color:#374151;">{{ t.requester }}</td>
                                    <td style="padding:10px 14px;"><StatusBadge :status="t.status" /></td>
                                    <td style="padding:10px 14px;"><PriorityBadge :priority="t.priority" /></td>
                                    <td style="padding:10px 14px; font-size:13px; color:#374151; white-space:nowrap;">{{ t.ago }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        `,
    }),
};

/**
 * Ticket list view — agent ticket queue with filters, search, table, and pagination.
 * Used for README hero screenshot.
 */
export const TicketListView = {
    render: () => ({
        components: { StatusBadge, PriorityBadge },
        data: () => ({
            chips: [
                { label: 'My Tickets', active: true },
                { label: 'Unassigned', active: false },
                { label: 'Urgent+', active: false },
                { label: 'SLA Breaching', active: false },
                { label: 'Following', active: false },
            ],
            tickets: [
                {
                    ref: 'ESC-1042',
                    subject: 'Unable to export CSV reports from dashboard',
                    requester: 'Sarah Chen',
                    email: 'sarah@acme.co',
                    status: 'open',
                    priority: 'high',
                    assignee: 'Mike Agent',
                    ago: '12m ago',
                    author: 'Agent Mike',
                    sla: 'green',
                    checked: true,
                },
                {
                    ref: 'ESC-1041',
                    subject: 'SSO login redirect loop on Firefox',
                    requester: 'James Wilson',
                    email: 'james@corp.io',
                    status: 'pending',
                    priority: 'urgent',
                    assignee: 'Lisa Torres',
                    ago: '34m ago',
                    author: 'James Wilson',
                    sla: 'amber',
                    checked: true,
                },
                {
                    ref: 'ESC-1040',
                    subject: 'Custom field values not persisting after save',
                    requester: 'Maria Garcia',
                    email: 'maria@startup.dev',
                    status: 'in_progress',
                    priority: 'medium',
                    assignee: 'Mike Agent',
                    ago: '1h ago',
                    author: 'Agent Lisa',
                    sla: 'green',
                    checked: false,
                },
                {
                    ref: 'ESC-1039',
                    subject: 'Webhook notifications delayed by 15+ minutes',
                    requester: 'Tom Baker',
                    email: 'tom@enterprise.com',
                    status: 'escalated',
                    priority: 'high',
                    assignee: 'Mike Agent',
                    ago: '2h ago',
                    author: 'Tom Baker',
                    sla: 'red',
                    checked: false,
                },
                {
                    ref: 'ESC-1038',
                    subject: 'Knowledge base search returning no results',
                    requester: 'Priya Patel',
                    email: 'priya@example.com',
                    status: 'solved',
                    priority: 'medium',
                    assignee: 'Lisa Torres',
                    ago: '3h ago',
                    author: 'Agent Mike',
                    sla: '',
                    checked: false,
                },
                {
                    ref: 'ESC-1037',
                    subject: 'Feature request: Dark mode for customer portal',
                    requester: 'Alex Kim',
                    email: 'alex@design.co',
                    status: 'open',
                    priority: 'low',
                    assignee: 'Unassigned',
                    ago: '5h ago',
                    author: 'Alex Kim',
                    sla: '',
                    checked: false,
                },
                {
                    ref: 'ESC-1036',
                    subject: 'Mobile app crashes when uploading attachments',
                    requester: 'David Liu',
                    email: 'david@bigcorp.com',
                    status: 'in_progress',
                    priority: 'urgent',
                    assignee: 'Mike Agent',
                    ago: '6h ago',
                    author: 'Agent Mike',
                    sla: 'amber',
                    checked: false,
                },
                {
                    ref: 'ESC-1035',
                    subject: 'Automation rule not triggering on status change',
                    requester: 'Nina Petrova',
                    email: 'nina@saas.io',
                    status: 'pending',
                    priority: 'medium',
                    assignee: 'Lisa Torres',
                    ago: '8h ago',
                    author: 'Nina Petrova',
                    sla: 'green',
                    checked: false,
                },
            ],
        }),
        template: `
            <div style="min-height:720px; background:#000; color:#fff; font-family: ui-sans-serif, system-ui, sans-serif; border-radius: 12px; overflow: hidden; display:flex; flex-direction:column;">
                <!-- Top nav (same as AgentPanel with Tickets active) -->
                <nav style="height:48px; border-bottom:1px solid rgba(255,255,255,0.06); background:#0a0a0a; display:flex; align-items:center; justify-content:space-between; padding:0 24px; flex-shrink:0;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:30px; height:30px; border-radius:8px; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <defs><linearGradient id="esc-rb4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f97316"/><stop offset="30%" stop-color="#eab308"/><stop offset="50%" stop-color="#22c55e"/><stop offset="70%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs>
                                <g transform="translate(12,12) scale(1.35) translate(-12,-12)"><polyline points="17 11 12 6 7 11" stroke="url(#esc-rb4)"/><polyline points="17 18 12 13 7 18" stroke="url(#esc-rb4)"/></g>
                            </svg>
                        </div>
                        <span style="font-size:13px; font-weight:700; letter-spacing:0.02em;">Escalated</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:4px;">
                        <span style="padding:5px 12px; border-radius:8px; font-size:13px; font-weight:500; color:#737373;">Dashboard</span>
                        <span style="background:rgba(255,255,255,0.08); padding:5px 12px; border-radius:8px; font-size:13px; font-weight:500;">Tickets</span>
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

                <!-- Content area -->
                <div style="flex:1; display:flex; justify-content:center; padding:20px 24px; overflow-y:auto;">
                    <div style="max-width:1100px; width:100%; display:flex; flex-direction:column; gap:16px;">

                        <!-- Quick filter chips -->
                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            <span v-for="chip in chips" :key="chip.label"
                                :style="{
                                    padding: '4px 14px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    border: chip.active ? '1px solid rgba(6,182,212,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                    background: chip.active ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                                    color: chip.active ? '#22d3ee' : '#a3a3a3',
                                }">
                                {{ chip.label }}
                            </span>
                        </div>

                        <!-- Search / filter bar -->
                        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                            <div style="flex:1; min-width:200px; position:relative;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#737373" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position:absolute; left:10px; top:50%; transform:translateY(-50%);"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                                <input type="text" placeholder="Search tickets..." style="width:100%; padding:7px 12px 7px 32px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:#fff; font-size:13px; outline:none;" />
                            </div>
                            <select style="padding:7px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:#a3a3a3; font-size:12px; outline:none; appearance:auto;">
                                <option>Status</option>
                                <option>Open</option>
                                <option>Pending</option>
                                <option>In Progress</option>
                                <option>Solved</option>
                                <option>Escalated</option>
                            </select>
                            <select style="padding:7px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:#a3a3a3; font-size:12px; outline:none; appearance:auto;">
                                <option>Priority</option>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Urgent</option>
                            </select>
                            <span style="font-size:12px; color:#06b6d4; cursor:pointer; font-weight:500; padding:4px 8px;">Advanced</span>
                        </div>

                        <!-- Ticket table -->
                        <div style="border-radius:12px; border:1px solid rgba(255,255,255,0.06); background:rgba(23,23,23,0.6); overflow:hidden; flex:1;">
                            <table style="width:100%; border-collapse:collapse; font-size:13px;">
                                <thead>
                                    <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                                        <th style="padding:10px 14px; text-align:left; width:28px;">
                                            <div style="width:14px; height:14px; border:1px solid rgba(255,255,255,0.2); border-radius:3px;"></div>
                                        </th>
                                        <th style="padding:10px 8px; text-align:left; font-size:11px; font-weight:600; color:#737373; text-transform:uppercase; letter-spacing:0.05em;">Reference</th>
                                        <th style="padding:10px 8px; text-align:left; font-size:11px; font-weight:600; color:#737373; text-transform:uppercase; letter-spacing:0.05em;">Subject</th>
                                        <th style="padding:10px 8px; text-align:left; font-size:11px; font-weight:600; color:#737373; text-transform:uppercase; letter-spacing:0.05em;">Requester</th>
                                        <th style="padding:10px 8px; text-align:left; font-size:11px; font-weight:600; color:#737373; text-transform:uppercase; letter-spacing:0.05em;">Status</th>
                                        <th style="padding:10px 8px; text-align:left; font-size:11px; font-weight:600; color:#737373; text-transform:uppercase; letter-spacing:0.05em;">Priority</th>
                                        <th style="padding:10px 8px; text-align:left; font-size:11px; font-weight:600; color:#737373; text-transform:uppercase; letter-spacing:0.05em;">Assignee</th>
                                        <th style="padding:10px 8px; text-align:left; font-size:11px; font-weight:600; color:#737373; text-transform:uppercase; letter-spacing:0.05em;">Last Reply</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="t in tickets" :key="t.ref"
                                        :style="{
                                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                                            background: t.checked ? 'rgba(6,182,212,0.06)' : 'transparent',
                                        }">
                                        <td style="padding:10px 14px;">
                                            <div :style="{
                                                width: '14px', height: '14px', borderRadius: '3px',
                                                border: t.checked ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.15)',
                                                background: t.checked ? '#06b6d4' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }">
                                                <svg v-if="t.checked" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                            </div>
                                        </td>
                                        <td style="padding:10px 8px; white-space:nowrap;">
                                            <div style="display:flex; align-items:center; gap:6px;">
                                                <span :style="{
                                                    width: '7px', height: '7px', borderRadius: '50%',
                                                    background: t.sla === 'red' ? '#ef4444' : t.sla === 'amber' ? '#f59e0b' : t.sla === 'green' ? '#22c55e' : 'rgba(255,255,255,0.1)',
                                                    flexShrink: 0,
                                                }"></span>
                                                <span style="color:#22d3ee; font-weight:500;">{{ t.ref }}</span>
                                            </div>
                                        </td>
                                        <td style="padding:10px 8px; max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#e5e5e5;">{{ t.subject }}</td>
                                        <td style="padding:10px 8px; white-space:nowrap;">
                                            <div style="display:flex; flex-direction:column;">
                                                <span style="color:#d4d4d4; font-size:13px;">{{ t.requester }}</span>
                                                <span style="color:#525252; font-size:11px;">{{ t.email }}</span>
                                            </div>
                                        </td>
                                        <td style="padding:10px 8px;"><StatusBadge :status="t.status" /></td>
                                        <td style="padding:10px 8px;"><PriorityBadge :priority="t.priority" /></td>
                                        <td style="padding:10px 8px; white-space:nowrap;">
                                            <span :style="{ color: t.assignee === 'Unassigned' ? '#525252' : '#a3a3a3', fontStyle: t.assignee === 'Unassigned' ? 'italic' : 'normal' }">{{ t.assignee }}</span>
                                        </td>
                                        <td style="padding:10px 8px; white-space:nowrap;">
                                            <div style="display:flex; flex-direction:column;">
                                                <span style="color:#a3a3a3; font-size:12px;">{{ t.ago }}</span>
                                                <span style="color:#525252; font-size:11px;">{{ t.author }}</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Pagination -->
                        <div style="display:flex; align-items:center; justify-content:space-between;">
                            <span style="font-size:12px; color:#737373;">Showing 1\u20138 of 142 tickets</span>
                            <div style="display:flex; gap:6px;">
                                <button style="padding:5px 14px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:#525252; font-size:12px; cursor:default;">Previous</button>
                                <button style="padding:5px 14px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:#e5e5e5; font-size:12px; cursor:pointer;">Next</button>
                            </div>
                        </div>

                        <!-- Bulk action bar -->
                        <div style="display:flex; align-items:center; gap:12px; padding:8px 14px; border-radius:10px; background:rgba(6,182,212,0.08); border:1px solid rgba(6,182,212,0.15);">
                            <span style="font-size:12px; color:#22d3ee; font-weight:500;">2 tickets selected</span>
                            <div style="width:1px; height:14px; background:rgba(255,255,255,0.08);"></div>
                            <select style="padding:4px 8px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:#a3a3a3; font-size:11px; outline:none; appearance:auto;">
                                <option>Set Status...</option>
                                <option>Open</option>
                                <option>Pending</option>
                                <option>Solved</option>
                            </select>
                            <select style="padding:4px 8px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:#a3a3a3; font-size:11px; outline:none; appearance:auto;">
                                <option>Set Priority...</option>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Urgent</option>
                            </select>
                        </div>

                    </div>
                </div>
            </div>
        `,
    }),
};

const demoTickets = [
    {
        ref: 'ESC-1042',
        subject: 'Unable to export CSV reports from dashboard',
        requester: 'Sarah Chen',
        email: 'sarah@acme.co',
        status: 'open',
        priority: 'high',
        assignee: 'Mike Agent',
        ago: '12m ago',
        sla: 'green',
    },
    {
        ref: 'ESC-1041',
        subject: 'SSO login redirect loop on Firefox',
        requester: 'James Wilson',
        email: 'james@corp.io',
        status: 'pending',
        priority: 'urgent',
        assignee: 'Lisa Torres',
        ago: '34m ago',
        sla: 'amber',
    },
    {
        ref: 'ESC-1040',
        subject: 'Custom field values not persisting after save',
        requester: 'Maria Garcia',
        email: 'maria@startup.dev',
        status: 'in_progress',
        priority: 'medium',
        assignee: 'Mike Agent',
        ago: '1h ago',
        sla: 'green',
    },
    {
        ref: 'ESC-1039',
        subject: 'Webhook notifications delayed by 15+ minutes',
        requester: 'Tom Baker',
        email: 'tom@enterprise.com',
        status: 'escalated',
        priority: 'high',
        assignee: 'Mike Agent',
        ago: '2h ago',
        sla: 'red',
    },
    {
        ref: 'ESC-1038',
        subject: 'Knowledge base search returning no results',
        requester: 'Priya Patel',
        email: 'priya@example.com',
        status: 'solved',
        priority: 'medium',
        assignee: 'Lisa Torres',
        ago: '3h ago',
        sla: '',
    },
    {
        ref: 'ESC-1037',
        subject: 'Feature request: Dark mode for customer portal',
        requester: 'Alex Kim',
        email: 'alex@design.co',
        status: 'open',
        priority: 'low',
        assignee: 'Unassigned',
        ago: '5h ago',
        sla: '',
    },
];

/**
 * Single-page interactive flow used by the README demo GIF.
 * List ↔ detail transitions happen in one page load so there's no iframe flash.
 */
export const DemoFlow = {
    parameters: { layout: 'fullscreen' },
    render: () => ({
        components: { StatusBadge, PriorityBadge },
        data: () => ({
            view: 'list',
            tickets: demoTickets,
            selectedTicket: null,
            messages: [],
            replyText: '',
            toast: '',
        }),
        methods: {
            openTicket(t) {
                this.selectedTicket = t;
                this.messages = [
                    {
                        id: 1,
                        author: t.requester,
                        initial: t.requester[0],
                        role: 'customer',
                        time: t.ago,
                        text: `Hi team — ${t.subject.charAt(0).toLowerCase() + t.subject.slice(1)}. This is blocking our workflow, any update would be appreciated.`,
                    },
                    {
                        id: 2,
                        author: 'Mike Agent',
                        initial: 'M',
                        role: 'agent',
                        time: '3m ago',
                        text: 'Thanks for the report — I can reproduce this. Engineering has identified the root cause and a patch is already in review.',
                    },
                ];
                this.view = 'detail';
            },
            backToList() {
                this.view = 'list';
                this.replyText = '';
            },
            sendReply() {
                const text = this.replyText.trim();
                if (!text) return;
                this.messages.push({
                    id: Date.now(),
                    author: 'Mike Agent',
                    initial: 'M',
                    role: 'agent',
                    time: 'just now',
                    text,
                });
                this.replyText = '';
                this.toast = 'Reply sent';
                setTimeout(() => {
                    this.toast = '';
                }, 2800);
            },
            slaColor(s) {
                return s === 'red'
                    ? '#ef4444'
                    : s === 'amber'
                      ? '#f59e0b'
                      : s === 'green'
                        ? '#22c55e'
                        : 'rgba(255,255,255,0.1)';
            },
        },
        template: `
            <div class="demo-root" data-fullbleed>
                <style>
                    html, body, #storybook-root { margin: 0; padding: 0; background: #000 !important; }
                    .demo-root {
                        position: fixed; inset: 0; background: #000; color: #fff;
                        font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                        display: flex; flex-direction: column; overflow: hidden;
                    }
                    .demo-fade-enter-active, .demo-fade-leave-active { transition: opacity 220ms ease; }
                    .demo-fade-enter-from, .demo-fade-leave-to { opacity: 0; }
                    .demo-msg-enter-active { transition: opacity 280ms ease, transform 280ms ease; }
                    .demo-msg-enter-from { opacity: 0; transform: translateY(8px); }
                    .demo-toast-enter-active, .demo-toast-leave-active { transition: opacity 220ms ease, transform 220ms ease; }
                    .demo-toast-enter-from, .demo-toast-leave-to { opacity: 0; transform: translateY(10px); }
                    .demo-ticket-row { cursor: pointer; transition: background 120ms ease; }
                    .demo-ticket-row:hover { background: rgba(255,255,255,0.05) !important; }
                </style>

                <nav style="height:48px; border-bottom:1px solid rgba(255,255,255,0.06); background:#0a0a0a; display:flex; align-items:center; justify-content:space-between; padding:0 24px; flex-shrink:0;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:30px; height:30px; border-radius:8px; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <defs><linearGradient id="esc-rb-demo" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f97316"/><stop offset="30%" stop-color="#eab308"/><stop offset="50%" stop-color="#22c55e"/><stop offset="70%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs>
                                <g transform="translate(12,12) scale(1.35) translate(-12,-12)"><polyline points="17 11 12 6 7 11" stroke="url(#esc-rb-demo)"/><polyline points="17 18 12 13 7 18" stroke="url(#esc-rb-demo)"/></g>
                            </svg>
                        </div>
                        <span style="font-size:13px; font-weight:700; letter-spacing:0.02em;">Escalated</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:4px;">
                        <span style="padding:5px 12px; border-radius:8px; font-size:13px; font-weight:500; color:#737373; cursor:pointer;">Dashboard</span>
                        <span style="background:#1f2937; padding:5px 12px; border-radius:8px; font-size:13px; font-weight:600; color:#fff; cursor:pointer;" @click="backToList">Tickets</span>
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

                <transition name="demo-fade" mode="out-in">
                    <div v-if="view === 'list'" key="list" style="flex:1; display:flex; justify-content:center; padding:20px 24px; overflow-y:auto;">
                        <div style="max-width:1100px; width:100%; display:flex; flex-direction:column; gap:16px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <h1 style="font-size:20px; font-weight:600; margin:0; color:#f5f5f5;">All Tickets</h1>
                                <span style="font-size:12px; color:#737373;">142 tickets · 18 unassigned</span>
                            </div>
                            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                                <span style="padding:4px 14px; border-radius:20px; font-size:12px; font-weight:500; cursor:pointer; border:1px solid rgba(6,182,212,0.4); background:rgba(6,182,212,0.15); color:#22d3ee;">My Tickets</span>
                                <span style="padding:4px 14px; border-radius:20px; font-size:12px; font-weight:500; cursor:pointer; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:#a3a3a3;">Unassigned</span>
                                <span style="padding:4px 14px; border-radius:20px; font-size:12px; font-weight:500; cursor:pointer; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:#a3a3a3;">Urgent+</span>
                                <span style="padding:4px 14px; border-radius:20px; font-size:12px; font-weight:500; cursor:pointer; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:#a3a3a3;">SLA Breaching</span>
                                <span style="padding:4px 14px; border-radius:20px; font-size:12px; font-weight:500; cursor:pointer; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:#a3a3a3;">Following</span>
                            </div>
                            <div style="flex:1; min-width:200px; position:relative;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#737373" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position:absolute; left:10px; top:50%; transform:translateY(-50%);"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                                <input type="text" placeholder="Search tickets..." style="width:100%; padding:7px 12px 7px 32px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:#fff; font-size:13px; outline:none; box-sizing:border-box;" />
                            </div>
                            <div style="border-radius:12px; border:1px solid rgba(255,255,255,0.06); background:rgba(23,23,23,0.6); overflow:hidden;">
                                <table style="width:100%; border-collapse:collapse; font-size:13px;">
                                    <thead>
                                        <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                                            <th style="padding:10px 14px; text-align:left; font-size:11px; font-weight:600; color:#737373; text-transform:uppercase; letter-spacing:0.05em;">Reference</th>
                                            <th style="padding:10px 8px; text-align:left; font-size:11px; font-weight:600; color:#737373; text-transform:uppercase; letter-spacing:0.05em;">Subject</th>
                                            <th style="padding:10px 8px; text-align:left; font-size:11px; font-weight:600; color:#737373; text-transform:uppercase; letter-spacing:0.05em;">Requester</th>
                                            <th style="padding:10px 8px; text-align:left; font-size:11px; font-weight:600; color:#737373; text-transform:uppercase; letter-spacing:0.05em;">Status</th>
                                            <th style="padding:10px 8px; text-align:left; font-size:11px; font-weight:600; color:#737373; text-transform:uppercase; letter-spacing:0.05em;">Priority</th>
                                            <th style="padding:10px 8px; text-align:left; font-size:11px; font-weight:600; color:#737373; text-transform:uppercase; letter-spacing:0.05em;">Assignee</th>
                                            <th style="padding:10px 8px; text-align:left; font-size:11px; font-weight:600; color:#737373; text-transform:uppercase; letter-spacing:0.05em;">Last Reply</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="t in tickets" :key="t.ref"
                                            class="demo-ticket-row"
                                            data-testid="demo-ticket-row"
                                            :data-ref="t.ref"
                                            @click="openTicket(t)"
                                            style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                            <td style="padding:10px 14px; white-space:nowrap;">
                                                <div style="display:flex; align-items:center; gap:6px;">
                                                    <span :style="{ width: '7px', height: '7px', borderRadius: '50%', background: slaColor(t.sla), flexShrink: 0 }"></span>
                                                    <span style="color:#22d3ee; font-weight:500;">{{ t.ref }}</span>
                                                </div>
                                            </td>
                                            <td style="padding:10px 8px; max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#e5e5e5;">{{ t.subject }}</td>
                                            <td style="padding:10px 8px; white-space:nowrap;">
                                                <div style="display:flex; flex-direction:column;">
                                                    <span style="color:#d4d4d4; font-size:13px;">{{ t.requester }}</span>
                                                    <span style="color:#525252; font-size:11px;">{{ t.email }}</span>
                                                </div>
                                            </td>
                                            <td style="padding:10px 8px;"><StatusBadge :status="t.status" /></td>
                                            <td style="padding:10px 8px;"><PriorityBadge :priority="t.priority" /></td>
                                            <td style="padding:10px 8px; white-space:nowrap;">
                                                <span :style="{ color: t.assignee === 'Unassigned' ? '#525252' : '#a3a3a3', fontStyle: t.assignee === 'Unassigned' ? 'italic' : 'normal' }">{{ t.assignee }}</span>
                                            </td>
                                            <td style="padding:10px 8px; white-space:nowrap; color:#a3a3a3; font-size:12px;">{{ t.ago }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div v-else key="detail" style="flex:1; display:flex; min-height:0;">
                        <div style="flex:7; display:flex; flex-direction:column; border-right:1px solid rgba(255,255,255,0.06); min-width:0;">
                            <div style="padding:14px 24px; border-bottom:1px solid rgba(255,255,255,0.06); flex-shrink:0;">
                                <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                                    <span @click="backToList" style="font-size:12px; color:#737373; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                                        Tickets
                                    </span>
                                    <span style="color:#404040;">·</span>
                                    <span style="font-size:13px; color:#22d3ee; font-weight:500;">{{ selectedTicket?.ref }}</span>
                                    <StatusBadge :status="selectedTicket?.status" />
                                    <PriorityBadge :priority="selectedTicket?.priority" />
                                </div>
                                <h1 style="font-size:16px; font-weight:600; margin:0; color:#f5f5f5;">{{ selectedTicket?.subject }}</h1>
                            </div>

                            <div style="flex:1; overflow-y:auto; padding:16px 24px;">
                                <transition-group name="demo-msg" tag="div" style="display:flex; flex-direction:column; gap:14px;">
                                    <div v-for="msg in messages" :key="msg.id" style="display:flex; gap:12px;">
                                        <div :style="{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', background: msg.role === 'agent' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.08)', color: msg.role === 'agent' ? '#60a5fa' : '#a3a3a3' }">{{ msg.initial }}</div>
                                        <div style="flex:1; min-width:0;">
                                            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                                                <span :style="{ fontSize: '13px', fontWeight: '600', color: msg.role === 'agent' ? '#60a5fa' : '#e5e5e5' }">{{ msg.author }}</span>
                                                <span v-if="msg.role === 'agent'" style="font-size:10px; background:rgba(59,130,246,0.12); color:#60a5fa; padding:1px 6px; border-radius:4px; font-weight:500;">Agent</span>
                                                <span style="font-size:11px; color:#525252;">{{ msg.time }}</span>
                                            </div>
                                            <div style="font-size:13px; line-height:1.6; color:#d4d4d4; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.04); border-radius:10px; padding:10px 14px;">{{ msg.text }}</div>
                                        </div>
                                    </div>
                                </transition-group>
                            </div>

                            <div style="border-top:1px solid rgba(255,255,255,0.06); padding:12px 24px; flex-shrink:0;">
                                <div style="display:flex; gap:0; margin-bottom:8px;">
                                    <button style="padding:5px 14px; font-size:12px; font-weight:600; border:none; cursor:pointer; border-radius:6px 0 0 6px; background:rgba(59,130,246,0.15); color:#60a5fa;">Reply</button>
                                    <button style="padding:5px 14px; font-size:12px; font-weight:600; border:none; cursor:pointer; border-radius:0 6px 6px 0; background:rgba(255,255,255,0.05); color:#737373;">Internal Note</button>
                                </div>
                                <textarea
                                    v-model="replyText"
                                    data-testid="demo-reply-textarea"
                                    placeholder="Type your reply..."
                                    style="width:100%; min-height:68px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:10px 14px; font-size:13px; color:#e5e5e5; resize:none; font-family:inherit; box-sizing:border-box; outline:none;"
                                ></textarea>
                                <div style="display:flex; justify-content:flex-end; margin-top:8px;">
                                    <button
                                        data-testid="demo-send-reply"
                                        @click="sendReply"
                                        :disabled="!replyText.trim()"
                                        :style="{ padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: replyText.trim() ? 'pointer' : 'not-allowed', background: '#3b82f6', color: '#fff', opacity: replyText.trim() ? '1' : '0.5', transition: 'opacity 150ms ease' }"
                                    >Send Reply</button>
                                </div>
                            </div>
                        </div>

                        <div style="flex:3; padding:16px; overflow-y:auto; background:rgba(10,10,10,0.5); min-width:0;">
                            <div style="margin-bottom:20px;">
                                <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252; margin-bottom:6px;">Assignee</div>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <div style="width:28px; height:28px; border-radius:6px; background:rgba(59,130,246,0.15); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; color:#60a5fa;">M</div>
                                    <div>
                                        <div style="font-size:13px; font-weight:500; color:#e5e5e5;">{{ selectedTicket?.assignee }}</div>
                                        <div style="font-size:11px; color:#525252;">Support Team</div>
                                    </div>
                                </div>
                            </div>
                            <div style="margin-bottom:20px;">
                                <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252; margin-bottom:6px;">Department</div>
                                <div style="font-size:13px; color:#a3a3a3;">Technical Support</div>
                            </div>
                            <div style="margin-bottom:20px;">
                                <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252; margin-bottom:6px;">SLA</div>
                                <div style="border:1px solid rgba(16,185,129,0.2); background:rgba(16,185,129,0.08); border-radius:8px; padding:8px 12px;">
                                    <div style="font-size:12px; font-weight:500; color:#34d399;">Next Response Due</div>
                                    <div style="font-size:11px; color:#34d399;">3h 42m remaining</div>
                                </div>
                            </div>
                            <div>
                                <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#525252; margin-bottom:6px;">Requester</div>
                                <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:10px 12px;">
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <div style="width:28px; height:28px; border-radius:6px; background:rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; color:#a3a3a3;">{{ selectedTicket?.requester?.[0] }}</div>
                                        <div>
                                            <div style="font-size:13px; font-weight:500; color:#e5e5e5;">{{ selectedTicket?.requester }}</div>
                                            <div style="font-size:11px; color:#525252;">{{ selectedTicket?.email }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </transition>

                <transition name="demo-toast">
                    <div v-if="toast" style="position:fixed; bottom:20px; right:20px; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); color:#34d399; padding:10px 16px; border-radius:10px; font-size:13px; font-weight:500; display:flex; align-items:center; gap:8px; backdrop-filter: blur(8px);">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {{ toast }}
                    </div>
                </transition>
            </div>
        `,
    }),
};
