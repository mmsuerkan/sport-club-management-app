<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, onValue } from 'firebase/database';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  audience: string;
  status: string;
  createdAt: number;
  scheduledFor?: number;
}

const notifications = ref<Notification[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(() => {
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
});

const getStatusColor = (status: string) => {
  switch (status) {
    case 'sent':
      return 'bg-green-100 text-green-800';
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('tr-TR');
};
</script>

<template>
  <div class="bg-white shadow rounded-lg overflow-hidden">
    <div class="px-4 py-5 sm:p-6">
      <div v-if="loading" class="text-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>

      <div v-else-if="error" class="text-red-500 text-center py-4">
        {{ error }}
      </div>

      <div v-else-if="notifications.length === 0" class="text-center py-4 text-gray-500">
        Henüz bildirim bulunmamaktadır
      </div>

      <div v-else class="space-y-6">
        <div v-for="notification in notifications" :key="notification.id" class="bg-gray-50 rounded-lg p-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ notification.title }}</h3>
              <p class="mt-1 text-sm text-gray-500">{{ notification.message }}</p>
              <div class="mt-2 flex items-center space-x-4">
                <span class="text-sm text-gray-500">
                  {{ formatDate(notification.createdAt) }}
                </span>
                <span
                  :class="[
                    getStatusColor(notification.status),
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
                  ]"
                >
                  {{ notification.status }}
                </span>
                <span class="text-sm text-gray-500">
                  Hedef: {{ notification.audience }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>