<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, get } from 'firebase/database';
import { useTranslation } from '../../composables/useTranslation';

const { t } = useTranslation();

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  branchId: string;
  branchName: string;
  groupId: string;
  groupName: string;
  amount: number;
  date: number;
  status: 'completed' | 'pending' | 'failed';
  method: 'cash' | 'card' | 'transfer';
  reference?: string;
}

const payments = ref<Payment[]>([]);
const loading = ref(true);
const error = ref('');

const loadPayments = async () => {
  try {
    const paymentsRef = dbRef(db, 'payments');
    const paymentsSnapshot = await get(paymentsRef);
    
    if (!paymentsSnapshot.exists()) {
      payments.value = [];
      return;
    }

    const paymentsData = paymentsSnapshot.val();
    const branchesRef = dbRef(db, 'branches');
    const branchesSnapshot = await get(branchesRef);
    
    if (!branchesSnapshot.exists()) {
      throw new Error('No branch data found');
    }

    const branchesData = branchesSnapshot.val();
    const paymentsList: Payment[] = [];

    for (const [paymentId, payment] of Object.entries(paymentsData)) {
      const paymentData = payment as any;
      const branch = branchesData[paymentData.branchId];
      
      if (!branch) continue;
      
      const group = branch.groups?.[paymentData.groupId];
      if (!group) continue;
      
      const student = group.students?.[paymentData.studentId];
      if (!student) continue;

      paymentsList.push({
        id: paymentId,
        studentId: paymentData.studentId,
        studentName: student.name,
        branchId: paymentData.branchId,
        branchName: branch.name,
        groupId: paymentData.groupId,
        groupName: group.name,
        amount: paymentData.amount,
        date: paymentData.date,
        status: paymentData.status,
        method: paymentData.method,
        reference: paymentData.reference
      });
    }

    payments.value = paymentsList.sort((a, b) => b.date - a.date);
  } catch (err) {
    console.error('Error loading payment records:', err);
    error.value = t('payments.errorLoading');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadPayments();
});

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString();
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-10">
      <header>
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            {{ t('payments.history') }}
          </h1>
          <p class="mt-1 text-sm text-gray-500">{{ t('payments.viewHistory') }}</p>
        </div>
      </header>

      <main>
        <div class="mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <div class="bg-white shadow rounded-lg p-6">
              <div v-if="loading" class="text-center py-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
              
              <div v-else-if="error" class="text-red-500 text-center py-4">
                {{ error }}
              </div>
              
              <div v-else-if="payments.length === 0" class="text-center py-4 text-gray-500">
                {{ t('payments.noRecords') }}
              </div>
              
              <div v-else>
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          {{ t('common.date') }}
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          {{ t('common.student') }}
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          {{ t('common.branch') }}
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          {{ t('common.group') }}
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          {{ t('common.amount') }}
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          {{ t('common.method') }}
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          {{ t('common.status') }}
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          {{ t('common.reference') }}
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr v-for="payment in payments" :key="payment.id">
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {{ formatDate(payment.date) }}
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {{ payment.studentName }}
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {{ payment.branchName }}
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {{ payment.groupName }}
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                          {{ formatCurrency(payment.amount) }}
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {{ t(`payments.methods.${payment.method}`) }}
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm">
                          <span :class="[
                            getStatusClass(payment.status),
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
                          ]">
                            {{ t(`payments.status.${payment.status}`) }}
                          </span>
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {{ payment.reference || '-' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>