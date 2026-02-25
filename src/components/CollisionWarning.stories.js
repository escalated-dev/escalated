import CollisionWarning from './CollisionWarning.vue';

export default {
    title: 'Components/CollisionWarning',
    component: CollisionWarning,
};

export const SingleTyper = {
    args: {
        typers: [{ name: 'Alice Chen' }],
    },
};

export const TwoTypers = {
    args: {
        typers: [{ name: 'Alice Chen' }, { name: 'Bob Smith' }],
    },
};

export const ManyTypers = {
    args: {
        typers: [{ name: 'Alice Chen' }, { name: 'Bob Smith' }, { name: 'Carol Davis' }, { name: 'Dan Lee' }],
    },
};

export const NoTypers = {
    args: {
        typers: [],
    },
};
