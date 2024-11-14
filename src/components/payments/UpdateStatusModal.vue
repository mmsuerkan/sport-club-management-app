<script setup lang="ts">
interface Payment {
  id: string;
  studentName: string;
  status: string;
}

const props = defineProps<{
  payment: Payment | null;
}>();

const emit = defineEmits(['close', 'update-status']);

const updateStatus = (status: 'completed' | 'pending' | 'failed') => {
  emit('update-status', status);
};
</script>

<template>
  <div v-if="payment" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50" />
  
  <div v-if="payment" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
        <div class="absolute right-0 top-0 pr-4 pt-4">
          <button
            @click="$emit('close')"
            class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span class="sr-only">Kapat</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="sm:flex sm:items-start">
          <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
            <h3 class="text-xl font-semibold leading-6 text-gray-900">Ödeme Durumunu Güncelle</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                {{ payment.studentName }} için ödeme durumunu seçin
              </p>
            </div>
            <div class="mt-4 space-y-2">
              <button
                @click="updateStatus('completed')"
                class="w-full rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Tamamlandı
              </button>
              <button
                @click="updateStatus('pending')"
                class="w-full rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600"
              >
                Beklemede
              </button>
              <button
                @click="updateStatus('failed')"
                class="w-full rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Başarısız
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>