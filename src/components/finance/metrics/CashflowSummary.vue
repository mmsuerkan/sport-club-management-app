<script setup lang="ts">
import { ref, watch } from 'vue';
import { db } from '../../../firebase';
import { ref as dbRef, get } from 'firebase/database';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
  dateRange: string;
  selectedMonth: Date;
}>();

interface CashflowItem {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

const cashflowData = ref<CashflowItem[]>([]);
const loading = ref(true);
const error = ref('');

const loadCashflowData = async () => {
  loading.value = true;
  error.value = '';

  try {
    const start = startOfMonth(props.selectedMonth);
    const end = endOfMonth(props.selectedMonth);

    const [paymentsSnapshot, expensesSnapshot] = await Promise.all([
      get(dbRef(db, 'payments')),
      get(dbRef(db, 'expenses'))
    ]);

    const dailyCashflow: Record<string, CashflowItem> = {};

    // Initialize daily records
    let currentDate = start;
    while (currentDate <= end) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      dailyCashflow[dateStr] = {
        date: dateStr,
        income: 0,
        expense: 0,
        balance: 0
      };
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    // Process payments
    if (paymentsSnapshot.exists()) {
      const payments = paymentsSnapshot.val();
      Object.values(payments).forEach((payment: any) => {
        if (payment.status === 'completed') {
          const dateStr = format(new Date(payment.date), 'yyyy-MM-dd');
          if (dailyCashflow[dateStr]) {
            dailyCashflow[dateStr].income += payment.amount;
          }
        }
      });
    }

    // Process expenses
    if (expensesSnapshot.exists()) {
      const expenses = expensesSnapshot.val();
      Object.values(expenses).forEach((expense: any) => {
        const dateStr = format(new Date(expense.date), 'yyyy-MM-dd');
        if (dailyCashflow[dateStr]) {
          dailyCashflow[dateStr].expense += expense.amount;
        }
      });
    }

    // Calculate running balance
    let runningBalance = 0;
    cashflowData.value = Object.values(dailyCashflow)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => {
        runningBalance += item.income - item.expense;
        return {
          ...item,
          balance: runningBalance
        };
      });

  } catch (err) {
    console.error('Error loading cashflow data:', err);
    error.value = 'Nakit akışı verileri yüklenirken bir hata oluştu';
  } finally {
    loading.value = false;
  }
};

watch([() => props.dateRange, () => props.selectedMonth], loadCashflowData, { immediate: true });

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short'
  });
};
</script>

<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Nakit Akışı Özeti</h3>
    
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center h-64 text-red-500">
      {{ error }}
    </div>

    <div v-else>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarih
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gelir
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gider
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Günlük Bakiye
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kümülatif Bakiye
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in cashflowData" :key="item.date">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(item.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                {{ formatCurrency(item.income) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                {{ formatCurrency(item.expense) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex items-center">
                  <component
                    :is="item.income - item.expense >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon"
                    class="h-4 w-4 mr-1"
                    :class="item.income - item.expense >= 0 ? 'text-green-500' : 'text-red-500'"
                  />
                  <span :class="item.income - item.expense >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ formatCurrency(item.income - item.expense) }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" 
                  :class="item.balance >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(item.balance) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>