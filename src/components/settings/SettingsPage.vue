<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import GeneralSettings from './sections/GeneralSettings.vue';
import { ArrowLeftIcon } from '@heroicons/vue/24/outline';

const router = useRouter();
const activeTab = ref('general');
const hasUnsavedChanges = ref(false);

const tabs = [
  { id: 'general', name: 'Genel', component: GeneralSettings }
];

const goBack = () => {
  if (hasUnsavedChanges.value) {
    if (confirm('Kaydedilmemiş değişiklikler var. Çıkmak istediğinizden emin misiniz?')) {
      router.back();
    }
  } else {
    router.back();
  }
};

const handleSettingChange = () => {
  hasUnsavedChanges.value = true;
};

const handleSave = async () => {
  try {
    // Save settings logic here
    hasUnsavedChanges.value = false;
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-10">
      <header>
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
          <div class="md:flex md:items-center md:justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex items-center">
                <button
                  @click="goBack"
                  class="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-white"
                >
                  <ArrowLeftIcon class="h-6 w-6" />
                </button>
                <div>
                  <h1 class="text-3xl font-bold leading-tight text-gray-900">
                    Ayarlar
                  </h1>
                  <p class="mt-1 text-sm text-gray-500">
                    Sistem ayarlarını yapılandırın
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-4 flex md:ml-4 md:mt-0">
              <button
                type="button"
                @click="handleSave"
                :disabled="!hasUnsavedChanges"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Değişiklikleri Kaydet
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <div class="bg-white shadow rounded-lg">
              <!-- Navigation Tabs -->
              <div class="border-b border-gray-200">
                <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    v-for="tab in tabs"
                    :key="tab.id"
                    @click="activeTab = tab.id"
                    :class="[
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                      'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                    ]"
                  >
                    {{ tab.name }}
                  </button>
                </nav>
              </div>

              <!-- Settings Content -->
              <div class="p-6">
                <keep-alive>
                  <component
                    :is="tabs.find(tab => tab.id === activeTab)?.component"
                    @setting-change="handleSettingChange"
                  />
                </keep-alive>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>