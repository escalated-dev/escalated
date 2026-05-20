import PreviewIframe from './PreviewIframe.vue';

export default { title: 'Admin/Newsletters/PreviewIframe', component: PreviewIframe };

export const Empty = { args: { html: '<p>(empty)</p>' } };
export const Rendered = { args: { html: '<h1>Newsletter</h1><p>Hello Maria,</p><p>Welcome aboard.</p>' } };
export const Loading = { args: { html: '<h1>Newsletter</h1>', loading: true } };
