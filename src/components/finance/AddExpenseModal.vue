<script setup lang="ts">
import { ref } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, push, set } from 'firebase/database';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close', 'expense-added']);

const form = ref({
  category: '',
  amount: 0,
  description: '',
  date: new Date().toISOString().split('T')[0],
  receipt: null as File | null
});

const loading = ref(false);
const error = ref('');

const categories = [
  'Maaşlar',
  'Ekipman',
  'Tesis',
  'Etkinlikler',
  'Ulaşım',
  'Diğer'
];

const resetForm = () => {
  form.value = {
    category: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    receipt: null
  };
  error.value = '';
};

const closeModal = () => {
  resetForm();
  emit('close');
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    form.value.receipt = input.files[0];
  }
};

const addExpense = async () => {
  if (!form.value.category || !form.value.amount || !form.value.description) {
    error.value = 'Lütfen tüm zorunlu alanları doldurun';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const newExpenseRef = push(dbRef(db, 'expenses'));
    
    // Create expense data without receipt first
    const expenseData = {
      category: form.value.category,
      amount: form.value.amount,
      description: form.value.description,
      date: form.value.date,
      status: 'pending',
      createdAt: Date.now()
    };

    // If there's a receipt file, handle it
    if (form.value.receipt) {
      // Here you would typically upload the file to storage
      // and get back a URL to store in the database
      // For now, we'll just store the filename
      expenseData.receipt = form.value.receipt.name;
    }

    await set(newExpenseRef, expenseData);

    resetForm();
    emit('expense-added');
    emit('close');
  } catch (err) {
    console.error('Error adding expense:', err);
    error.value = 'Gider eklenirken bir hata oluştu';
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
            <h3 class="text-xl font-semibold leading-6 text-gray-900">Yeni Gider Ekle</h3>
            <div class="mt-4">
              <form @submit.prevent="addExpense" class="space-y-4">
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

                <!-- Amount -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Tutar</label>
                  <div class="relative mt-1 rounded-md shadow-sm">
                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span class="text-gray-500 sm:text-sm">₺</span>
                    </div>
                    <input
                      v-model.number="form.amount"
                      type="number"
                      min="0"
                      step="0.01"
                      class="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <!-- Description -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Açıklama</label>
                  <textarea
                    v-model="form.description"
                    rows="3"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  ></textarea>
                </div>

                <!-- Date -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Tarih</label>
                  <input
                    v-model="form.date"
                    type="date"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <!-- Receipt Upload -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Fiş/Fatura (Opsiyonel)</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    @change="handleFileChange"
                    class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p v-if="form.receipt" class="mt-1 text-sm text-gray-500">
                    Seçilen dosya: {{ form.receipt.name }}
                  </p>
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
                    {{ loading ? 'Ekleniyor...' : 'Gider Ekle' }}
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