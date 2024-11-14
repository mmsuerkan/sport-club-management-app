<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import TopBar from './TopBar.vue';
import Sidebar from '../Sidebar.vue';
import MainContent from './MainContent.vue';
import Footer from './Footer.vue';
import NotificationPanel from '../notifications/NotificationPanel.vue';
import { db, auth } from '../../firebase';
import { ref as dbRef, onValue } from 'firebase/database';
import { useRouter } from 'vue-router';

const router = useRouter();
const selectedBranch = ref<{ id: string; name: string; } | null>(null);
const currentPath = ref('dashboard');
const showNotifications = ref(false);
const unreadNotifications = ref<number>(0);

onMounted(() => {
  // Check authentication state
  auth.onAuthStateChanged((user) => {
    if (!user) {
      router.push('/login');
    }
  });

  // Load notifications
  onValue(dbRef(db, 'notifications'), (snapshot) => {
    if (snapshot.exists()) {
      const notifications = snapshot.val();
      unreadNotifications.value = Object.values(notifications).filter(
        (notification: any) => !notification.read
      ).length;
    } else {
      unreadNotifications.value = 0;
    }
  });
});

const handleBranchSelect = (branch: { id: string; name: string; }) => {
  selectedBranch.value = branch;
};

const resetBranch = () => {
  selectedBranch.value = null;
};

const handleNavigate = (path: string) => {
  currentPath.value = path;
  if (path === 'branches') {
    resetBranch();
  }
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

const handleNotificationsRead = () => {
  showNotifications.value = false;
  unreadNotifications.value = 0;
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <TopBar
      :notifications="unreadNotifications"
      :show-notifications="showNotifications"
      @toggle-notifications="toggleNotifications"
    />

    <Sidebar
      :current-path="currentPath"
      @navigate="handleNavigate"
    />

    <NotificationPanel 
      :is-open="showNotifications" 
      @close="showNotifications = false"
      @notifications-read="handleNotificationsRead"
    />

    <MainContent
      :current-path="currentPath"
      :selected-branch="selectedBranch"
      @branch-select="handleBranchSelect"
      @reset-branch="resetBranch"
    />

    <Footer />
  </div>
</template>