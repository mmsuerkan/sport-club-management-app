import { createRouter, createWebHistory } from 'vue-router';
import { auth } from './firebase';
import LoginPage from './components/auth/LoginPage.vue';
import RegisterPage from './components/auth/RegisterPage.vue';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage.vue';
import DashboardLayout from './components/layout/DashboardLayout.vue';
import HelpPage from './components/help/HelpPage.vue';
import SettingsPage from './components/settings/SettingsPage.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: LoginPage,
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      component: RegisterPage,
      meta: { requiresGuest: true }
    },
    {
      path: '/forgot-password',
      component: ForgotPasswordPage,
      meta: { requiresGuest: true }
    },
    {
      path: '/help',
      component: HelpPage
    },
    {
      path: '/settings',
      component: SettingsPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      component: DashboardLayout,
      meta: { requiresAuth: true }
    }
  ]
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
  const isAuthenticated = auth.currentUser;

  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (requiresGuest && isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;