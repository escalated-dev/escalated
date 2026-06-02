import MarkdownEditor from './MarkdownEditor.vue';

export default { title: 'Admin/Newsletters/MarkdownEditor', component: MarkdownEditor };

export const Empty = { args: { modelValue: '' } };
export const WithContent = { args: { modelValue: '# Welcome\n\nThanks for being a customer.' } };
