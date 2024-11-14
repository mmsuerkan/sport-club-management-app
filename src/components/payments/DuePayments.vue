<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, onValue } from 'firebase/database';
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
  date: string;
  status: 'pending';
  method: 'cash' | 'card' | 'transfer';
  reference?: string;
}

const payments = ref<Payment[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(() => {
  const paymentsRef = dbRef(db, 'payments');
  onValue(paymentsRef, (snapshot) => {
    loading.value = true;
    try {
      if (snapshot.exists()) {
        const data = snapshot.val();
        payments.value = Object.entries(data)
          .map(([id, payment]: [string, any]) => ({
            id,
            ...payment
          }))
          .filter(payment => payment.status === 'pending')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else {
        payments.value = [];
      }
    } catch (err) {
      console.error('Error loading payments:', err);
      error.value = t('errors.loadingPayments');
    } finally {
      loading.value = false;
    }
  });
});

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
  <div class="min-h-screen bg-gray-100">
    <div class="py-10">
      <header>
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            Bekleyen Ödemeler
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            Bekleyen ödemeleri görüntüleyin ve yönetin
          </p>
        </div>
      </header>

      <main>
        <div class="mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <div class="bg-white shadow rounded-lg overflow-hidden">
              <div v-if="loading" class="text-center py-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>

              <div v-else-if="error" class="text-red-500 text-center py-4">
                {{ error }}
              </div>

              <div v-else-if="payments.length === 0" class="text-center py-4 text-gray-500">
                Bekleyen ödeme bulunmamaktadır
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
                          Ödeme Yöntemi
                        </th>
                        <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Referans
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
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                          {{ formatCurrency(payment.amount) }}
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {{ formatDate(payment.date) }}
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {{ payment.method === 'cash' ? 'Nakit' : 
                             payment.method === 'card' ? 'Kart' : 'Havale' }}
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