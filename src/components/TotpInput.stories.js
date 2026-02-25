import TotpInput from './TotpInput.vue';

export default {
    title: 'Components/TotpInput',
    component: TotpInput,
};

export const Empty = { args: { modelValue: '' } };
export const PartiallyFilled = { args: { modelValue: '123' } };
