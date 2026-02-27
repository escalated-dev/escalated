import FollowButton from './FollowButton.vue';

export default {
    title: 'Components/FollowButton',
    component: FollowButton,
};

export const NotFollowing = {
    args: {
        action: '#',
        isFollowing: false,
        followersCount: 3,
    },
};

export const Following = {
    args: {
        action: '#',
        isFollowing: true,
        followersCount: 5,
    },
};

export const NoFollowers = {
    args: {
        action: '#',
        isFollowing: false,
        followersCount: 0,
    },
};
