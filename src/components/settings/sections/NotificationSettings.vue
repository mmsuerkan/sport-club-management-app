<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['setting-change']);

const settings = ref({
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  notifyOn: {
    newPayment: true,
    paymentDue: true,
    newStudent: true,
    attendanceAlert: true,
    systemUpdates: true
  },
  emailDigest: 'daily',
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  }
});

const handleChange = () => {
  emit('setting-change');
};
</script>

<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-medium leading-6 text-gray-900">Bildirim Ayarları</h3>
      <p class="mt-1 text-sm text-gray-500">
        Bildirim tercihlerinizi yapılandırın
      </p>
    </div>

    <div class="space-y-6">
      <!-- Notification Channels -->
      <div class="space-y-4">
        <h4 class="text-sm font-medium text-gray-900">Bildirim Kanalları</h4>
        
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm text-gray-700">E-posta Bildirimleri</label>
            <p class="text-xs text-gray-500">Önemli güncellemeleri e-posta ile alın</p>
          </div>
          <button
            type="button"
            @click="settings.emailNotifications = !settings.emailNotifications; handleChange()"
            :class="[
              settings.emailNotifications ? 'bg-indigo-600' : 'bg-gray-200',
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            ]"
          >
            <span
              :class="[
                settings.emailNotifications ? 'translate-x-5' : 'translate-x-0',
                'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
              ]"
            />
          </button>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm text-gray-700">SMS Bildirimleri</label>
            <p class="text-xs text-gray-500">Acil bildirimleri SMS ile alın</p>
          </div>
          <button
            type="button"
            @click="settings.smsNotifications = !settings.smsNotifications; handleChange()"
            :class="[
              settings.smsNotifications ? 'bg-indigo-600' : 'bg-gray-200',
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            ]"
          >
            <span
              :class="[
                settings.smsNotifications ? 'translate-x-5' : 'translate-x-0',
                'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
              ]"
            />
          </button>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm text-gray-700">Push Bildirimleri</label>
            <p class="text-xs text-gray-500">Anlık bildirimleri tarayıcınızda alın</p>
          </div>
          <button
            type="button"
            @click="settings.pushNotifications = !settings.pushNotifications; handleChange()"
            :class="[
              settings.pushNotifications ? 'bg-indigo-600' : 'bg-gray-200',
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            ]"
          >
            <span
              :class="[
                settings.pushNotifications ? 'translate-x-5' : 'translate-x-0',
                'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
              ]"
            />
          </button>
        </div>
      </div>

      <!-- Notification Types -->
      <div class="space-y-4">
        <h4 class="text-sm font-medium text-gray-900">Bildirim Türleri</h4>
        
        <div class="space-y-4">
          <div class="flex items-center">
            <input
              v-model="settings.notifyOn.newPayment"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              @change="handleChange"
            />
            <label class="ml-3 text-sm text-gray-700">Yeni Ödemeler</label>
          </div>
          
          <div class="flex items-center">
            <input
              v-model="settings.notifyOn.paymentDue"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              @change="handleChange"
            />
            <label class="ml-3 text-sm text-gray-700">Vadesi Gelen Ödemeler</label>
          </div>
          
          <div class="flex items-center">
            <input
              v-model="settings.notifyOn.newStudent"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              @change="handleChange"
            />
            <label class="ml-3 text-sm text-gray-700">Yeni Öğrenci Kayıtları</label>
          </div>
          
          <div class="flex items-center">
            <input
              v-model="settings.notifyOn.attendanceAlert"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              @change="handleChange"
            />
            <label class="ml-3 text-sm text-gray-700">Devamsızlık Uyarıları</label>
          </div>
          
          <div class="flex items-center">
            <input
              v-model="settings.notifyOn.systemUpdates"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              @change="handleChange"
            />
            <label class="ml-3 text-sm text-gray-700">Sistem Güncellemeleri</label>
          </div>
        </div>
      </div>

      <!-- Email Digest -->
      <div class="space-y-4">
        <h4 class="text-sm font-medium text-gray-900">E-posta Özeti</h4>
        
        <div>
          <select
            v-model="settings.emailDigest"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            @change="handleChange"
          >
            <option value="daily">Günlük Özet</option>
            <option value="weekly">Haftalık Özet</option>
            <option value="never">Özet Gönderme</option>
          </select>
        </div>
      </div>

      <!-- Quiet Hours -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900">Sessiz Saatler</h4>
            <p class="text-xs text-gray-500">Belirli saatlerde bildirim almayın</p>
          </div>
          <button
            type="button"
            @click="settings.quietHours.enabled = !settings.quietHours.enabled; handleChange()"
            :class="[
              settings.quietHours.enabled ? 'bg-indigo-600' : 'bg-gray-200',
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            ]"
          >
            <span
              :class="[
                settings.quietHours.enabled ? 'translate-x-5' : 'translate-x-0',
                'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
              ]"
            />
          </button>
        </div>

        <div v-if="settings.quietHours.enabled" class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Başlangıç</label>
            <input
              v-model="settings.quietHours.start"
              type="time"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              @change="handleChange"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Bitiş</label>
            <input
              v-model="settings.quietHours.end"
              type="time"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              @change="handleChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>