<script setup lang="ts">
import { ref } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, push, set } from 'firebase/database';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close', 'budget-added']);

const form = ref({
  category: '',
  allocated: 0,
  period: '',
  startDate: '',
  endDate: ''
});

const loading = ref(false);
const error = ref('');

const categories = ['Maaşlar', 'Ekipman', 'Tesis', 'Etkinlikler', 'Ulaşım', 'Diğer'];
const periods = ['Ocak 2024', 'Şubat 2024', 'Mart 2024', 'Nisan 2024'];

const resetForm = () => {
  form.value = {
    category: '',
    allocated: 0,
    period: '',
    startDate: '',
    endDate: ''
  };
  error.value = '';
};

const closeModal = () => {
  resetForm();
  emit('close');
};

const addBudget = async () => {
  if (!form.value.category || !form.value.allocated || !form.value.period || !form.value.startDate || !form.value.endDate) {
    error.value = 'Lütfen tüm alanları doldurun';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const newBudgetRef = push(dbRef(db, 'budgets'));
    await set(newBudgetRef, {
      ...form.value,
      spent: 0,
      remaining: form.value.allocated,
      createdAt: Date.now()
    });

    resetForm();
    emit('budget-added');
    emit('close');
  } catch (err) {
    console.error('Error adding budget:', err);
    error.value = 'Bütçe eklenirken bir hata oluştu';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
  
  <div v-if="isOpen" class="fixed inset-0 z-10 overflow-y-auto">
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
        <div class="absolute right-0 top-0 pr-4 pt-4">
          <button
            type="button"
            @click="closeModal"
            class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span class="sr-only">Kapat</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="sm:flex sm:items-start">
          <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
            <h3 class="text-xl font-semibold leading-6 text-gray-900">Yeni Bütçe Ekle</h3>
            <div class="mt-4">
              <form @submit.prevent="addBudget" class="space-y-4">
                <!-- Category -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Kategori</label>
                  <select
                    v-model="form.category"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Kategori Seçin</option>
                    <option v-for="category in categories" :key="category" :value="category">
                      {{ category }}
                    </option>
                  </select>
                </div>

                <!-- Period -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Dönem</label>
                  <select
                    v-model="form.period"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Dönem Seçin</option>
                    <option v-for="period in periods" :key="period" :value="period">
                      {{ period }}
                    </option>
                  </select>
                </div>

                <!-- Allocated Amount -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Ayrılan Bütçe</label>
                  <div class="relative mt-1 rounded-md shadow-sm">
                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span class="text-gray-500 sm:text-sm">₺</span>
                    </div>
                    <input
                      v-model.number="form.allocated"
                      type="number"
                      min="0"
                      step="0.01"
                      class="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <!-- Date Range -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
                    <input
                      v-model="form.startDate"
                      type="date"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Bitiş Tarihi</label>
                    <input
                      v-model="form.endDate"
                      type="date"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <!-- Error Message -->
                <div v-if="error" class="text-red-500 text-sm mt-2">
                  {{ error }}
                </div>

                <!-- Submit Button -->
                <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    :disabled="loading"
                    class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {{ loading ? 'Ekleniyor...' : 'Bütçe Ekle' }}
                  </button>
                  <button
                    type="button"
                    @click="closeModal"
                    class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>