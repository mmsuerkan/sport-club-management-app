<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, onValue } from 'firebase/database';
import { 
  TrophyIcon, 
  ChartBarIcon, 
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftIcon
} from '@heroicons/vue/24/outline';

interface DevelopmentNotification {
  id: string;
  studentId: string;
  studentName: string;
  type: 'achievement' | 'performance' | 'assessment' | 'feedback';
  title: string;
  message: string;
  createdAt: number;
  read: boolean;
}

const notifications = ref<DevelopmentNotification[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(() => {
  const notificationsRef = dbRef(db, 'developmentNotifications');
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
      console.error('Error loading development notifications:', err);
      error.value = 'Bildirimler yüklenirken bir hata oluştu';
    } finally {
      loading.value = false;
    }
  });
});

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'achievement':
      return TrophyIcon;
    case 'performance':
      return ChartBarIcon;
    case 'assessment':
      return ClipboardDocumentCheckIcon;
    case 'feedback':
      return ChatBubbleLeftIcon;
    default:
      return ChartBarIcon;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'achievement':
      return 'text-yellow-500';
    case 'performance':
      return 'text-blue-500';
    case 'assessment':
      return 'text-green-500';
    case 'feedback':
      return 'text-purple-500';
    default:
      return 'text-gray-500';
  }
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<template>
  <div class="bg-white shadow rounded-lg overflow-hidden">
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-lg font-medium text-gray-900">Gelişim Bildirimleri</h2>
    </div>

    <div v-if="loading" class="p-4 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
    </div>

    <div v-else-if="error" class="p-4 text-center text-red-500">
      {{ error }}
    </div>

    <div v-else-if="notifications.length === 0" class="p-4 text-center text-gray-500">
      Henüz bildirim bulunmamaktadır
    </div>

    <div v-else class="divide-y divide-gray-200">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="p-4 hover:bg-gray-50 transition-colors duration-150"
      >
        <div class="flex space-x-3">
          <div class="flex-shrink-0">
            <component
              :is="getNotificationIcon(notification.type)"
              :class="[
                'h-6 w-6',
                getNotificationColor(notification.type)
              ]"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-900">
                {{ notification.studentName }}
              </p>
              <span class="text-xs text-gray-500">
                {{ formatDate(notification.createdAt) }}
              </span>
            </div>
            <p class="text-sm text-gray-900 mt-1">{{ notification.title }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ notification.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>