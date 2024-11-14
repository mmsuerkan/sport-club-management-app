<script setup lang="ts">
import { ref } from 'vue';

interface Payment {
  id: string;
  studentName: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

const props = defineProps<{
  isOpen: boolean;
  payment: Payment;
}>();

const emit = defineEmits(['close', 'updateStatus']);

const newStatus = ref(props.payment.status);
const loading = ref(false);
const error = ref('');

const updateStatus = async () => {
  if (newStatus.value === props.payment.status) {
    error.value = 'Lütfen farklı bir durum seçin';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    emit('updateStatus', newStatus.value);
  } catch (err) {
    error.value = 'Durum güncellenirken bir hata oluştu';
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  error.value = '';
  emit('close');
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
            <h3 class="text-xl font-semibold leading-6 text-gray-900">Ödeme Durumunu Güncelle</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                {{ payment.studentName }} - {{ new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(payment.amount) }}
              </p>
            </div>
            <div class="mt-4">
              <form @submit.prevent="updateStatus" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Yeni Durum</label>
                  <select
                    v-model="newStatus"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="completed">Tamamlandı</option>
                    <option value="pending">Beklemede</option>
                    <option value="failed">Başarısız</option>
                  </select>
                </div>

                <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    :disabled="loading"
                    class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {{ loading ? 'Güncelleniyor...' : 'Durumu Güncelle' }}
                  </button>
                  <button
                    type="button"
                    @click="closeModal"
                    class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    İptal
                  </button>
                </div>

                <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>