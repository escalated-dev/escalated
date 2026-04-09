<script setup>
import { computed, ref, onMounted } from 'vue';

const props = defineProps({
    type: {
        type: String,
        default: 'bar',
        validator: (v) => ['line', 'bar', 'area', 'histogram', 'stacked-bar', 'pie'].includes(v),
    },
    data: { type: Array, default: () => [] },
    title: { type: String, default: '' },
    height: { type: Number, default: 240 },
    colors: { type: Array, default: () => ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'] },
    xLabel: { type: String, default: '' },
    yLabel: { type: String, default: '' },
    stacked: { type: Boolean, default: false },
});

const svgRef = ref(null);
const tooltip = ref({ show: false, x: 0, y: 0, label: '', value: '' });
const animated = ref(false);

onMounted(() => {
    setTimeout(() => {
        animated.value = true;
    }, 50);
});

const padding = { top: 20, right: 20, bottom: 40, left: 50 };
const chartWidth = 600;
const chartHeight = computed(() => props.height);
const innerWidth = chartWidth - padding.left - padding.right;
const innerHeight = computed(() => chartHeight.value - padding.top - padding.bottom);

const maxValue = computed(() => {
    if (!props.data.length) return 1;
    if (props.type === 'stacked-bar') {
        return Math.max(
            ...props.data.map((d) => {
                const vals = Array.isArray(d.values) ? d.values : [d.value || 0];
                return vals.reduce((a, b) => a + b, 0);
            }),
            1,
        );
    }
    return Math.max(...props.data.map((d) => d.value || 0), 1);
});

const barWidth = computed(() => {
    if (!props.data.length) return 0;
    return Math.min(innerWidth / props.data.length - 4, 40);
});

const linePath = computed(() => {
    if (!props.data.length) return '';
    const stepX = innerWidth / Math.max(props.data.length - 1, 1);
    return props.data
        .map((d, i) => {
            const x = padding.left + i * stepX;
            const y = padding.top + innerHeight.value - (d.value / maxValue.value) * innerHeight.value;
            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
        })
        .join(' ');
});

const areaPath = computed(() => {
    if (!props.data.length) return '';
    const stepX = innerWidth / Math.max(props.data.length - 1, 1);
    const baseline = padding.top + innerHeight.value;
    const top = props.data
        .map((d, i) => {
            const x = padding.left + i * stepX;
            const y = padding.top + innerHeight.value - (d.value / maxValue.value) * innerHeight.value;
            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
        })
        .join(' ');
    const lastX = padding.left + (props.data.length - 1) * stepX;
    return `${top} L${lastX},${baseline} L${padding.left},${baseline} Z`;
});

const yTicks = computed(() => {
    const ticks = [];
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
        const val = Math.round((maxValue.value / steps) * i);
        const y = padding.top + innerHeight.value - (val / maxValue.value) * innerHeight.value;
        ticks.push({ value: val, y });
    }
    return ticks;
});

const pieSlices = computed(() => {
    if (!props.data.length) return [];
    const total = props.data.reduce((s, d) => s + (d.value || 0), 0);
    if (total === 0) return [];
    const cx = chartWidth / 2;
    const cy = chartHeight.value / 2;
    const r = Math.min(cx, cy) - 30;
    let startAngle = -Math.PI / 2;
    return props.data.map((d, i) => {
        const angle = (d.value / total) * Math.PI * 2;
        const endAngle = startAngle + angle;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const largeArc = angle > Math.PI ? 1 : 0;
        const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`;
        const midAngle = startAngle + angle / 2;
        const labelX = cx + r * 0.65 * Math.cos(midAngle);
        const labelY = cy + r * 0.65 * Math.sin(midAngle);
        startAngle = endAngle;
        return {
            path,
            color: props.colors[i % props.colors.length],
            label: d.label,
            value: d.value,
            percent: Math.round((d.value / total) * 100),
            labelX,
            labelY,
        };
    });
});

function showTooltip(event, label, value) {
    const rect = svgRef.value?.getBoundingClientRect();
    if (!rect) return;
    tooltip.value = {
        show: true,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top - 10,
        label,
        value: typeof value === 'number' ? value.toLocaleString() : value,
    };
}

function hideTooltip() {
    tooltip.value.show = false;
}

function getBarX(index) {
    const step = innerWidth / props.data.length;
    return padding.left + index * step + (step - barWidth.value) / 2;
}

function getBarHeight(value) {
    return (value / maxValue.value) * innerHeight.value;
}

function getBarY(value) {
    return padding.top + innerHeight.value - getBarHeight(value);
}
</script>

<template>
    <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-5">
        <h3 v-if="title" class="mb-4 text-sm font-semibold text-[var(--esc-panel-text-secondary)]">{{ title }}</h3>
        <div
            v-if="!data.length"
            class="flex items-center justify-center py-12 text-sm text-[var(--esc-panel-text-muted)]"
        >
            No data available
        </div>
        <div v-else class="relative">
            <svg
                ref="svgRef"
                :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
                class="w-full"
                preserveAspectRatio="xMidYMid meet"
            >
                <!-- Grid lines -->
                <template v-if="type !== 'pie'">
                    <line
                        v-for="tick in yTicks"
                        :key="tick.value"
                        :x1="padding.left"
                        :y1="tick.y"
                        :x2="chartWidth - padding.right"
                        :y2="tick.y"
                        stroke="var(--esc-panel-border, #333)"
                        stroke-width="0.5"
                        stroke-dasharray="4 4"
                    />
                    <text
                        v-for="tick in yTicks"
                        :key="'label-' + tick.value"
                        :x="padding.left - 8"
                        :y="tick.y + 4"
                        text-anchor="end"
                        class="fill-[var(--esc-panel-text-muted)] text-[10px]"
                    >
                        {{ tick.value }}
                    </text>
                </template>

                <!-- Bar chart -->
                <template v-if="type === 'bar' || type === 'histogram'">
                    <rect
                        v-for="(d, i) in data"
                        :key="i"
                        :x="getBarX(i)"
                        :y="animated ? getBarY(d.value) : padding.top + innerHeight"
                        :width="barWidth"
                        :height="animated ? getBarHeight(d.value) : 0"
                        :fill="d.color || colors[i % colors.length]"
                        rx="3"
                        class="transition-all duration-700 ease-out"
                        style="cursor: pointer"
                        @mouseenter="showTooltip($event, d.label, d.value)"
                        @mouseleave="hideTooltip"
                    />
                    <text
                        v-for="(d, i) in data"
                        :key="'x-' + i"
                        :x="getBarX(i) + barWidth / 2"
                        :y="chartHeight - 8"
                        text-anchor="middle"
                        class="fill-[var(--esc-panel-text-muted)] text-[10px]"
                    >
                        {{ d.label?.length > 8 ? d.label.slice(0, 8) + '..' : d.label }}
                    </text>
                </template>

                <!-- Stacked bar -->
                <template v-if="type === 'stacked-bar'">
                    <template v-for="(d, i) in data" :key="i">
                        <rect
                            v-for="(val, si) in d.values || [d.value]"
                            :key="si"
                            :x="getBarX(i)"
                            :y="
                                animated
                                    ? getBarY((d.values || [d.value]).slice(0, si + 1).reduce((a, b) => a + b, 0))
                                    : padding.top + innerHeight
                            "
                            :width="barWidth"
                            :height="animated ? getBarHeight(val) : 0"
                            :fill="colors[si % colors.length]"
                            class="transition-all duration-700 ease-out"
                            style="cursor: pointer"
                            @mouseenter="showTooltip($event, d.label + ' (' + (d.seriesLabels?.[si] || si) + ')', val)"
                            @mouseleave="hideTooltip"
                        />
                    </template>
                    <text
                        v-for="(d, i) in data"
                        :key="'sx-' + i"
                        :x="getBarX(i) + barWidth / 2"
                        :y="chartHeight - 8"
                        text-anchor="middle"
                        class="fill-[var(--esc-panel-text-muted)] text-[10px]"
                    >
                        {{ d.label?.length > 8 ? d.label.slice(0, 8) + '..' : d.label }}
                    </text>
                </template>

                <!-- Line chart -->
                <template v-if="type === 'line'">
                    <path
                        :d="linePath"
                        fill="none"
                        :stroke="colors[0]"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="transition-all duration-700"
                    />
                    <circle
                        v-for="(d, i) in data"
                        :key="i"
                        :cx="padding.left + (innerWidth / Math.max(data.length - 1, 1)) * i"
                        :cy="
                            animated
                                ? padding.top + innerHeight - (d.value / maxValue) * innerHeight
                                : padding.top + innerHeight
                        "
                        r="4"
                        :fill="colors[0]"
                        class="transition-all duration-700 ease-out"
                        style="cursor: pointer"
                        @mouseenter="showTooltip($event, d.label, d.value)"
                        @mouseleave="hideTooltip"
                    />
                    <text
                        v-for="(d, i) in data"
                        :key="'lx-' + i"
                        :x="padding.left + (innerWidth / Math.max(data.length - 1, 1)) * i"
                        :y="chartHeight - 8"
                        text-anchor="middle"
                        class="fill-[var(--esc-panel-text-muted)] text-[10px]"
                    >
                        {{ d.label?.length > 6 ? d.label.slice(0, 6) : d.label }}
                    </text>
                </template>

                <!-- Area chart -->
                <template v-if="type === 'area'">
                    <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" :stop-color="colors[0]" stop-opacity="0.3" />
                            <stop offset="100%" :stop-color="colors[0]" stop-opacity="0.02" />
                        </linearGradient>
                    </defs>
                    <path :d="areaPath" fill="url(#areaGrad)" class="transition-all duration-700" />
                    <path
                        :d="linePath"
                        fill="none"
                        :stroke="colors[0]"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="transition-all duration-700"
                    />
                    <circle
                        v-for="(d, i) in data"
                        :key="i"
                        :cx="padding.left + (innerWidth / Math.max(data.length - 1, 1)) * i"
                        :cy="
                            animated
                                ? padding.top + innerHeight - (d.value / maxValue) * innerHeight
                                : padding.top + innerHeight
                        "
                        r="3.5"
                        :fill="colors[0]"
                        class="transition-all duration-700 ease-out"
                        style="cursor: pointer"
                        @mouseenter="showTooltip($event, d.label, d.value)"
                        @mouseleave="hideTooltip"
                    />
                </template>

                <!-- Pie chart -->
                <template v-if="type === 'pie'">
                    <path
                        v-for="(slice, i) in pieSlices"
                        :key="i"
                        :d="slice.path"
                        :fill="slice.color"
                        stroke="var(--esc-panel-surface, #111)"
                        stroke-width="2"
                        style="cursor: pointer"
                        @mouseenter="showTooltip($event, slice.label, `${slice.value} (${slice.percent}%)`)"
                        @mouseleave="hideTooltip"
                    />
                    <text
                        v-for="(slice, i) in pieSlices"
                        :key="'pl-' + i"
                        :x="slice.labelX"
                        :y="slice.labelY"
                        text-anchor="middle"
                        class="fill-white text-[10px] font-medium"
                    >
                        {{ slice.percent }}%
                    </text>
                </template>

                <!-- Axis labels -->
                <text
                    v-if="xLabel"
                    :x="chartWidth / 2"
                    :y="chartHeight - 2"
                    text-anchor="middle"
                    class="fill-[var(--esc-panel-text-muted)] text-[11px]"
                >
                    {{ xLabel }}
                </text>
            </svg>

            <!-- Tooltip -->
            <div
                v-if="tooltip.show"
                class="pointer-events-none absolute z-20 rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-active)] px-3 py-2 text-xs shadow-lg"
                :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px', transform: 'translate(-50%, -100%)' }"
            >
                <div class="font-medium text-[var(--esc-panel-text)]">{{ tooltip.value }}</div>
                <div class="text-[var(--esc-panel-text-muted)]">{{ tooltip.label }}</div>
            </div>
        </div>

        <!-- Legend for stacked/pie -->
        <div v-if="(type === 'pie' || type === 'stacked-bar') && data.length" class="mt-4 flex flex-wrap gap-3">
            <div
                v-for="(d, i) in type === 'pie' ? data : data[0]?.seriesLabels || []"
                :key="i"
                class="flex items-center gap-1.5"
            >
                <span
                    class="inline-block h-2.5 w-2.5 rounded-full"
                    :style="{ backgroundColor: colors[i % colors.length] }"
                ></span>
                <span class="text-xs text-[var(--esc-panel-text-muted)]">{{ type === 'pie' ? d.label : d }}</span>
            </div>
        </div>
    </div>
</template>
