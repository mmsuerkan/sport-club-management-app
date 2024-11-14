<script setup lang="ts">
import { ref } from 'vue';
import UpdateStatusModal from './UpdateStatusModal.vue';

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  branchId: string;
  branchName: string;
  groupId: string;
  groupName: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  method: 'cash' | 'card' | 'transfer';
  reference?: string;
}

const props = defineProps<{
  payments: Payment[];
  loading: boolean;
  error: string;
}>();

const selectedPayment = ref<Payment | null>(null);
const showStatusModal = ref(false);

const openStatusModal = (payment: Payment) => {
  selectedPayment.value = payment;
  showStatusModal.value = true;
};

const closeStatusModal = () => {
  selectedPayment.value = null;
  showStatusModal.value = false;
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('tr-TR');
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
};
</script>

<template>
  <div class="bg-white shadow rounded-lg overflow-hidden">
    <div v-if="loading" class="text-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
    </div>

    <div v-else-if="error" class="text-red-500 text-center py-4">
      {{ error }}
    </div>

    <div v-else-if="payments.length === 0" class="text-center py-4 text-gray-500">
      Henüz ödeme kaydı bulunmamaktadır
    </div>

    <div v-else>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-300">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                Öğrenci
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Şube/Grup
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Tutar
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Tarih
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Durum
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Ödeme Yöntemi
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Referans
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="payment in payments" :key="payment.id">
              <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                {{ payment.studentName }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {{ payment.branchName }} / {{ payment.groupName }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {{ formatCurrency(payment.amount) }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {{ formatDate(payment.date) }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm">
                <span :class="[
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  getStatusClass(payment.status)
                ]">
                  {{ payment.status === 'completed' ? 'Tamamlandı' : 
                     payment.status === 'pending' ? 'Beklemede' : 'Başarısız' }}
                </span>
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {{ payment.method === 'cash' ? 'Nakit' :
                   payment.method === 'card' ? 'Kart' : 'Havale' }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {{ payment.reference || '-' }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <button
                  @click="openStatusModal(payment)"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  <svg 
                    class="h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                    />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <UpdateStatusModal
      v-if="showStatusModal"
      :payment="selectedPayment"
      @close="closeStatusModal"
      @update-status="closeStatusModal"
    />
  </div>
</template>