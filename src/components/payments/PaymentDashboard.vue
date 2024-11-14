<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, onValue } from 'firebase/database';
import PaymentStats from './PaymentStats.vue';
import PaymentTable from './PaymentTable.vue';
import NewPaymentModal from './NewPaymentModal.vue';

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

const payments = ref<Payment[]>([]);
const loading = ref(true);
const error = ref('');
const isNewPaymentModalOpen = ref(false);

onMounted(() => {
  const paymentsRef = dbRef(db, 'payments');
  onValue(paymentsRef, (snapshot) => {
    loading.value = true;
    try {
      if (snapshot.exists()) {
        const data = snapshot.val();
        payments.value = Object.entries(data).map(([id, payment]: [string, any]) => ({
          id,
          ...payment
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else {
        payments.value = [];
      }
    } catch (err) {
      console.error('Error loading payments:', err);
      error.value = 'Ödemeler yüklenirken bir hata oluştu';
    } finally {
      loading.value = false;
    }
  });
});
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-10">
      <header>
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
          <div class="md:flex md:items-center md:justify-between">
            <div class="min-w-0 flex-1">
              <h1 class="text-3xl font-bold leading-tight text-gray-900">
                Ödemeler
              </h1>
              <p class="mt-2 text-sm text-gray-600">
                Öğrenci ödemelerini yönetin ve takip edin
              </p>
            </div>
            <div class="mt-4 flex md:ml-4 md:mt-0">
              <button
                type="button"
                @click="isNewPaymentModalOpen = true"
                class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Yeni Ödeme
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <!-- Payment Stats -->
            <PaymentStats :payments="payments" />

            <!-- Payment Table -->
            <div class="mt-8">
              <PaymentTable
                :payments="payments"
                :loading="loading"
                :error="error"
              />
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- New Payment Modal -->
    <NewPaymentModal
      :is-open="isNewPaymentModalOpen"
      @close="isNewPaymentModalOpen = false"
      @payment-added="isNewPaymentModalOpen = false"
    />
  </div>
</template>