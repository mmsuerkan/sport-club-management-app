<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { db } from '../../../firebase';
import { ref as dbRef, get } from 'firebase/database';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  ScaleIcon,
  ClockIcon
} from '@heroicons/vue/24/outline';

const props = defineProps<{
  dateRange: string;
  selectedMonth: Date;
}>();

const metrics = ref({
  totalRevenue: 0,
  totalExpenses: 0,
  netIncome: 0,
  pendingPayments: 0,
  revenueGrowth: 0,
  expenseGrowth: 0
});

const loading = ref(true);
const error = ref('');

const loadMetrics = async () => {
  loading.value = true;
  error.value = '';

  try {
    const currentStart = startOfMonth(props.selectedMonth);
    const currentEnd = endOfMonth(props.selectedMonth);
    const previousStart = startOfMonth(subMonths(props.selectedMonth, 1));
    const previousEnd = endOfMonth(subMonths(props.selectedMonth, 1));

    const [paymentsSnapshot, expensesSnapshot] = await Promise.all([
      get(dbRef(db, 'payments')),
      get(dbRef(db, 'expenses'))
    ]);

    let currentRevenue = 0;
    let previousRevenue = 0;
    let currentExpenses = 0;
    let previousExpenses = 0;
    let pendingPayments = 0;

    // Process payments
    if (paymentsSnapshot.exists()) {
      const payments = paymentsSnapshot.val();
      Object.values(payments).forEach((payment: any) => {
        const paymentDate = new Date(payment.date);
        if (paymentDate >= currentStart && paymentDate <= currentEnd) {
          if (payment.status === 'completed') {
            currentRevenue += payment.amount;
          } else if (payment.status === 'pending') {
            pendingPayments += payment.amount;
          }
        } else if (paymentDate >= previousStart && paymentDate <= previousEnd && payment.status === 'completed') {
          previousRevenue += payment.amount;
        }
      });
    }

    // Process expenses
    if (expensesSnapshot.exists()) {
      const expenses = expensesSnapshot.val();
      Object.values(expenses).forEach((expense: any) => {
        const expenseDate = new Date(expense.date);
        if (expenseDate >= currentStart && expenseDate <= currentEnd) {
          currentExpenses += expense.amount;
        } else if (expenseDate >= previousStart && expenseDate <= previousEnd) {
          previousExpenses += expense.amount;
        }
      });
    }

    // Calculate growth rates
    const revenueGrowth = previousRevenue === 0 ? 100 : ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    const expenseGrowth = previousExpenses === 0 ? 100 : ((currentExpenses - previousExpenses) / previousExpenses) * 100;

    metrics.value = {
      totalRevenue: currentRevenue,
      totalExpenses: currentExpenses,
      netIncome: currentRevenue - currentExpenses,
      pendingPayments,
      revenueGrowth,
      expenseGrowth
    };
  } catch (err) {
    console.error('Error loading metrics:', err);
    error.value = 'Veriler yüklenirken bir hata oluştu';
  } finally {
    loading.value = false;
  }
};

watch([() => props.dateRange, () => props.selectedMonth], loadMetrics, { immediate: true });

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
};
</script>

<template>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    <!-- Total Revenue -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <BanknotesIcon class="h-6 w-6 text-gray-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Toplam Gelir
              </dt>
              <dd class="flex items-baseline">
                <div class="text-2xl font-semibold text-gray-900">
                  {{ formatCurrency(metrics.totalRevenue) }}
                </div>
                <div
                  :class="[
                    metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600',
                    'ml-2 flex items-baseline text-sm font-semibold'
                  ]"
                >
                  <component
                    :is="metrics.revenueGrowth >= 0 ? ArrowUpIcon : ArrowDownIcon"
                    class="h-4 w-4 flex-shrink-0 self-center"
                  />
                  <span class="ml-1">{{ Math.abs(metrics.revenueGrowth).toFixed(1) }}%</span>
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Total Expenses -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ReceiptPercentIcon class="h-6 w-6 text-gray-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Toplam Gider
              </dt>
              <dd class="flex items-baseline">
                <div class="text-2xl font-semibold text-gray-900">
                  {{ formatCurrency(metrics.totalExpenses) }}
                </div>
                <div
                  :class="[
                    metrics.expenseGrowth <= 0 ? 'text-green-600' : 'text-red-600',
                    'ml-2 flex items-baseline text-sm font-semibold'
                  ]"
                >
                  <component
                    :is="metrics.expenseGrowth <= 0 ? ArrowDownIcon : ArrowUpIcon"
                    class="h-4 w-4 flex-shrink-0 self-center"
                  />
                  <span class="ml-1">{{ Math.abs(metrics.expenseGrowth).toFixed(1) }}%</span>
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Net Income -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ScaleIcon class="h-6 w-6 text-gray-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Net Durum
              </dt>
              <dd class="flex items-baseline">
                <div
                  class="text-2xl font-semibold"
                  :class="metrics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'"
                >
                  {{ formatCurrency(metrics.netIncome) }}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Pending Payments -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ClockIcon class="h-6 w-6 text-gray-400" />
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                Bekleyen Ödemeler
              </dt>
              <dd class="flex items-baseline">
                <div class="text-2xl font-semibold text-yellow-600">
                  {{ formatCurrency(metrics.pendingPayments) }}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>