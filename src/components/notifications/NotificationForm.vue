<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, push, set, get } from 'firebase/database';
import { BellIcon } from '@heroicons/vue/24/outline';
import NotificationPreview from './NotificationPreview.vue';

interface NotificationForm {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  audience: 'all' | 'students' | 'trainers' | 'branch';
  branchId?: string;
  scheduledFor?: string;
  priority: 'low' | 'medium' | 'high';
}

const form = ref<NotificationForm>({
  title: '',
  message: '',
  type: 'info',
  audience: 'all',
  priority: 'medium'
});

const loading = ref(false);
const error = ref('');
const success = ref(false);
const showPreview = ref(false);
const branches = ref<Array<{ id: string; name: string }>>([]);

onMounted(async () => {
  try {
    const branchesRef = dbRef(db, 'branches');
    const snapshot = await get(branchesRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      branches.value = Object.entries(data).map(([id, branch]: [string, any]) => ({
        id,
        name: branch.name
      }));
    }
  } catch (err) {
    console.error('Error loading branches:', err);
  }
});

const resetForm = () => {
  form.value = {
    title: '',
    message: '',
    type: 'info',
    audience: 'all',
    priority: 'medium'
  };
  error.value = '';
  success.value = false;
  showPreview.value = false;
};

const validateForm = (): boolean => {
  if (!form.value.title.trim()) {
    error.value = 'Başlık alanı zorunludur';
    return false;
  }
  if (!form.value.message.trim()) {
    error.value = 'Mesaj alanı zorunludur';
    return false;
  }
  if (form.value.audience === 'branch' && !form.value.branchId) {
    error.value = 'Şube seçimi zorunludur';
    return false;
  }
  return true;
};

const sendNotification = async () => {
  if (!validateForm()) return;

  loading.value = true;
  error.value = '';
  success.value = false;

  try {
    const notificationRef = push(dbRef(db, 'notifications'));
    const scheduledTime = form.value.scheduledFor 
      ? new Date(form.value.scheduledFor).getTime()
      : null;

    const notificationData = {
      id: notificationRef.key!,
      ...form.value,
      status: scheduledTime && scheduledTime > Date.now() ? 'scheduled' : 'sent',
      read: false,
      createdAt: Date.now(),
      scheduledFor: scheduledTime
    };

    await set(notificationRef, notificationData);

    success.value = true;
    resetForm();
    setTimeout(() => {
      success.value = false;
    }, 3000);
  } catch (err) {
    console.error('Error sending notification:', err);
    error.value = 'Bildirim gönderilirken bir hata oluştu';
  } finally {
    loading.value = false;
  }
};

const togglePreview = () => {
  showPreview.value = !showPreview.value;
};
</script>

<template>
  <div class="bg-white shadow rounded-lg overflow-hidden">
    <div class="px-4 py-5 sm:p-6">
      <form @submit.prevent="sendNotification" class="space-y-6">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Başlık</label>
          <input
            v-model="form.title"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <!-- Message -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Mesaj</label>
          <textarea
            v-model="form.message"
            rows="4"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          ></textarea>
        </div>

        <!-- Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Bildirim Tipi</label>
          <select
            v-model="form.type"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="info">Bilgi</option>
            <option value="success">Başarılı</option>
            <option value="warning">Uyarı</option>
            <option value="error">Hata</option>
          </select>
        </div>

        <!-- Audience -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Hedef Kitle</label>
          <select
            v-model="form.audience"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">Tümü</option>
            <option value="students">Öğrenciler</option>
            <option value="trainers">Eğitmenler</option>
            <option value="branch">Şube</option>
          </select>
        </div>

        <!-- Branch Selection (if audience is branch) -->
        <div v-if="form.audience === 'branch'">
          <label class="block text-sm font-medium text-gray-700">Şube</label>
          <select
            v-model="form.branchId"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Şube Seçin</option>
            <option v-for="branch in branches" :key="branch.id" :value="branch.id">
              {{ branch.name }}
            </option>
          </select>
        </div>

        <!-- Priority -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Öncelik</label>
          <select
            v-model="form.priority"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
          </select>
        </div>

        <!-- Schedule -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Planlama (Opsiyonel)</label>
          <input
            v-model="form.scheduledFor"
            type="datetime-local"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <!-- Preview Toggle -->
        <div class="flex items-center">
          <button
            type="button"
            @click="togglePreview"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {{ showPreview ? 'Önizlemeyi Gizle' : 'Önizle' }}
          </button>
        </div>

        <!-- Preview -->
        <NotificationPreview
          v-if="showPreview"
          :notification="form"
        />

        <!-- Error Message -->
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="success" class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">Bildirim başarıyla gönderildi</h3>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <BellIcon class="h-5 w-5 mr-2" />
            {{ loading ? 'Gönderiliyor...' : 'Bildirimi Gönder' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>