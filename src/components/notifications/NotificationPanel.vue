<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, onValue, update } from 'firebase/database';
import { BellIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  read: boolean;
  createdAt: number;
}

const notifications = ref<Notification[]>([]);
const loading = ref(true);
const error = ref('');
const panelRef = ref<HTMLElement | null>(null);

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close', 'notificationsRead']);

onMounted(() => {
  loadNotifications();
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

const handleClickOutside = (event: MouseEvent) => {
  if (panelRef.value && !panelRef.value.contains(event.target as Node)) {
    emit('close');
  }
};

const loadNotifications = () => {
  const notificationsRef = dbRef(db, 'notifications');
  onValue(notificationsRef, (snapshot) => {
    loading.value = true;
    try {
      if (snapshot.exists()) {
        const data = snapshot.val();
        notifications.value = Object.entries(data)
          .map(([id, notification]: [string, any]) => ({
            id,
            ...notification
          }))
          .filter(notification => !notification.read)
          .sort((a, b) => b.createdAt - a.createdAt);
      } else {
        notifications.value = [];
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
      error.value = 'Bildirimler yüklenirken bir hata oluştu';
    } finally {
      loading.value = false;
    }
  });
};

const markAllAsRead = async () => {
  try {
    const updates: Record<string, boolean> = {};
    notifications.value.forEach(notification => {
      if (!notification.read) {
        updates[`notifications/${notification.id}/read`] = true;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      await update(dbRef(db), updates);
      notifications.value = [];
      emit('notificationsRead');
    }
  } catch (err) {
    console.error('Error marking notifications as read:', err);
  }
};

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return CheckCircleIcon;
    case 'error':
      return ExclamationCircleIcon;
    case 'warning':
      return ExclamationCircleIcon;
    default:
      return InformationCircleIcon;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-green-500';
    case 'error':
      return 'text-red-500';
    case 'warning':
      return 'text-yellow-500';
    default:
      return 'text-blue-500';
  }
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<template>
  <div
    v-if="isOpen"
    ref="panelRef"
    class="absolute right-0 top-16 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
  >
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-medium text-gray-900">Bildirimler</h2>
        <button
          v-if="notifications.length > 0"
          @click="markAllAsRead"
          class="text-sm text-indigo-600 hover:text-indigo-900"
        >
          Tümünü okundu işaretle
        </button>
      </div>
    </div>

    <div class="max-h-96 overflow-y-auto">
      <div v-if="loading" class="p-4 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>

      <div v-else-if="error" class="p-4 text-center text-red-500">
        {{ error }}
      </div>

      <div v-else-if="notifications.length === 0" class="p-4 text-center text-gray-500">
        Yeni bildirim bulunmamaktadır
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="p-4 hover:bg-gray-50"
        >
          <div class="flex space-x-3">
            <component
              :is="getIcon(notification.type)"
              :class="[getTypeColor(notification.type), 'h-6 w-6 mt-1 flex-shrink-0']"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">
                {{ notification.title }}
              </p>
              <p class="mt-1 text-sm text-gray-500">
                {{ notification.message }}
              </p>
              <p class="mt-1 text-xs text-gray-400">
                {{ formatDate(notification.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.max-h-96 {
  max-height: 24rem;
}
</style>