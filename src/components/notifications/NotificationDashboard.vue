<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, push, set, onValue } from 'firebase/database';
import NotificationForm from './NotificationForm.vue';
import NotificationHistory from './NotificationHistory.vue';
import { useTranslation } from '../../composables/useTranslation';

const { t } = useTranslation();
const activeTab = ref('create'); // 'create' or 'history'
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-10">
      <header>
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            Bildirim Yönetimi
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            Bildirimleri oluşturun, yönetin ve geçmişi görüntüleyin
          </p>
        </div>
      </header>

      <main>
        <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <!-- Tab Navigation -->
            <div class="border-b border-gray-200 mb-6">
              <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  @click="activeTab = 'create'"
                  :class="[
                    activeTab === 'create'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                  ]"
                >
                  Yeni Bildirim
                </button>
                <button
                  @click="activeTab = 'history'"
                  :class="[
                    activeTab === 'history'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                  ]"
                >
                  Bildirim Geçmişi
                </button>
              </nav>
            </div>

            <!-- Tab Content -->
            <div v-if="activeTab === 'create'">
              <NotificationForm />
            </div>
            <div v-else>
              <NotificationHistory />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>