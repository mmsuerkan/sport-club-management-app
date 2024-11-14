<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['setting-change']);

const settings = ref({
  theme: 'light',
  density: 'comfortable',
  fontSize: 'medium',
  animations: true,
  sidebarCollapsed: false,
  tableRows: '10'
});

const themes = [
  { value: 'light', label: 'Açık Tema' },
  { value: 'dark', label: 'Koyu Tema' },
  { value: 'system', label: 'Sistem Teması' }
];

const densities = [
  { value: 'comfortable', label: 'Rahat' },
  { value: 'compact', label: 'Sıkışık' },
  { value: 'spacious', label: 'Geniş' }
];

const fontSizes = [
  { value: 'small', label: 'Küçük' },
  { value: 'medium', label: 'Orta' },
  { value: 'large', label: 'Büyük' }
];

const tableRowOptions = [
  { value: '10', label: '10 satır' },
  { value: '25', label: '25 satır' },
  { value: '50', label: '50 satır' },
  { value: '100', label: '100 satır' }
];

const handleChange = () => {
  emit('setting-change');
};
</script>

<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-medium leading-6 text-gray-900">Görünüm Ayarları</h3>
      <p class="mt-1 text-sm text-gray-500">
        Arayüz görünümünü kişiselleştirin
      </p>
    </div>

    <div class="space-y-6">
      <!-- Theme -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Tema
        </label>
        <select
          v-model="settings.theme"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          @change="handleChange"
        >
          <option v-for="theme in themes" :key="theme.value" :value="theme.value">
            {{ theme.label }}
          </option>
        </select>
      </div>

      <!-- Density -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Yoğunluk
        </label>
        <select
          v-model="settings.density"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          @change="handleChange"
        >
          <option v-for="density in densities" :key="density.value" :value="density.value">
            {{ density.label }}
          </option>
        </select>
      </div>

      <!-- Font Size -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Yazı Boyutu
        </label>
        <select
          v-model="settings.fontSize"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          @change="handleChange"
        >
          <option v-for="size in fontSizes" :key="size.value" :value="size.value">
            {{ size.label }}
          </option>
        </select>
      </div>

      <!-- Table Rows -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Tablo Satır Sayısı
        </label>
        <select
          v-model="settings.tableRows"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          @change="handleChange"
        >
          <option v-for="option in tableRowOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Animations -->
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-sm font-medium text-gray-900">Animasyonlar</h4>
          <p class="text-xs text-gray-500">Arayüz animasyonlarını etkinleştirin</p>
        </div>
        <button
          type="button"
          @click="settings.animations = !settings.animations; handleChange()"
          :class="[
            settings.animations ? 'bg-indigo-600' : 'bg-gray-200',
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          ]"
        >
          <span
            :class="[
              settings.animations ? 'translate-x-5' : 'translate-x-0',
              'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
            ]"
          />
        </button>
      </div>

      <!-- Sidebar -->
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-sm font-medium text-gray-900">Daraltılmış Kenar Çubuğu</h4>
          <p class="text-xs text-gray-500">Kenar çubuğunu otomatik daralt</p>
        </div>
        <button
          type="button"
          @click="settings.sidebarCollapsed = !settings.sidebarCollapsed; handleChange()"
          :class="[
            settings.sidebarCollapsed ? 'bg-indigo-600' : 'bg-gray-200',
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          ]"
        >
          <span
            :class="[
              settings.sidebarCollapsed ? 'translate-x-5' : 'translate-x-0',
              'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
            ]"
          />
        </button>
      </div>
    </div>
  </div>
</template>