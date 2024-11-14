<script setup lang="ts">
import { computed } from 'vue';
import { useTranslation } from '../../composables/useTranslation';

const { t } = useTranslation();

interface Payment {
  id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

const props = defineProps<{
  payments: Payment[];
}>();

const totalRevenue = computed(() => {
  return props.payments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
});

const pendingAmount = computed(() => {
  return props.payments
    .filter(p => p.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);
});

const failedAmount = computed(() => {
  return props.payments
    .filter(p => p.status === 'failed')
    .reduce((sum, payment) => sum + payment.amount, 0);
});

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
};
</script>

<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h2 class="text-lg font-medium text-gray-900 mb-6">Ödeme Genel Bakışı</h2>
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <div class="bg-gray-50 overflow-hidden rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">Toplam Gelir</dt>
          <dd class="mt-1 text-3xl font-semibold text-green-600">{{ formatAmount(totalRevenue) }}</dd>
        </div>
      </div>
      <div class="bg-gray-50 overflow-hidden rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">Bekleyen Ödemeler</dt>
          <dd class="mt-1 text-3xl font-semibold text-yellow-600">{{ formatAmount(pendingAmount) }}</dd>
        </div>
      </div>
      <div class="bg-gray-50 overflow-hidden rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">Başarısız Ödemeler</dt>
          <dd class="mt-1 text-3xl font-semibold text-red-600">{{ formatAmount(failedAmount) }}</dd>
        </div>
      </div>
    </div>
  </div>
</template>