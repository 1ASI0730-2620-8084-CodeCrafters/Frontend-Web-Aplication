const signInForm = () => import('./views/sign-in-form.vue');
const profileView = () => import('./views/profile-view.vue');
const companySettings = () => import('./views/company-settings.vue');
const userManagement = () => import('./views/user-management.vue');

const iamRoutes = [
    { path: 'sign-in', name: 'iam-sign-in', component: signInForm, meta: { title: 'iam.sign-in.title', public: true } },
    { path: 'profile', name: 'profile', component: profileView, meta: { title: 'iam.profile.title' } },
    { path: 'company', name: 'company', component: companySettings, meta: { title: 'iam.company.title', roles: ['administrator'] } },
    { path: 'users', name: 'users', component: userManagement, meta: { title: 'iam.users.title', roles: ['administrator'] } }
];

export default iamRoutes;
