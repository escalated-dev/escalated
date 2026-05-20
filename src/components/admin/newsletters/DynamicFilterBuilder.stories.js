import DynamicFilterBuilder from './DynamicFilterBuilder.vue';

export default { title: 'Admin/Newsletters/DynamicFilterBuilder', component: DynamicFilterBuilder };

export const Empty = { args: { modelValue: { rules: [] }, matchCount: 0 } };
export const WithRules = {
    args: {
        modelValue: { rules: [{ field: 'tickets_count', op: '>=', value: 3 }] },
        matchCount: 142,
    },
};
