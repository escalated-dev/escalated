import MergeFieldDropdown from './MergeFieldDropdown.vue';

export default { title: 'Admin/Newsletters/MergeFieldDropdown', component: MergeFieldDropdown };

export const Default = {};
export const WithMetadataKeys = { args: { metadataKeys: ['tier', 'plan', 'lifecycle_stage'] } };
