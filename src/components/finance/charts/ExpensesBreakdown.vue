<script setup lang="ts">
import { ref, watch } from 'vue';
import { db } from '../../../firebase';
import { ref as dbRef, get } from 'firebase/database';
import { Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from 'chart.js';
import { startOfMonth, endOfMonth } from 'date-fns';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale
);

const props = defineProps<{
  dateRange: string;
  selectedMonth: Date;
}>();

const chartData = ref({
  labels: [],
  datasets: [{
    data: [],
    backgroundColor: [
      '#3B82F6', // blue
      '#10B981', // green
      '#F59E0B', // yellow
      '#EF4444', // red
      '#8B5CF6', // purple
      '#EC4899', // pink
    ],
  }]
});

const loading = ref(true);
const error = ref('');

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    }
  }
};

const loadExpensesData = async () => {
  loading.value = true;
  error.value = '';

  try {
    const start = startOfMonth(props.selectedMonth);
    const end = endOfMonth(props.selectedMonth);

    const expensesSnapshot = await get(dbRef(db, 'expenses'));
    
    const categoryTotals: Record<string, number> = {};

    if (expensesSnapshot.exists()) {
      const expenses = expensesSnapshot.val();
      Object.values(expenses).forEach((expense: any) => {
        const expenseDate = new Date(expense.date);
        if (expenseDate >= start && expenseDate <= end) {
          categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        }
      });
    }

    // Sort categories by amount
    const sortedCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a);

    chartData.value = {
      labels: sortedCategories.map(([category]) => category),
      datasets: [{
        data: sortedCategories.map(([, amount]) => amount),
        backgroundColor: [
          '#3B82F6', // blue
          '#10B981', // green
          '#F59E0B', // yellow
          '#EF4444', // red
          '#8B5CF6', // purple
          '#EC4899', // pink
        ],
      }]
    };
  } catch (err) {
    console.error('Error loading expenses data:', err);
    error.value = 'Gider verileri yüklenirken bir hata oluştu';
  } finally {
    loading.value = false;
  }
};

watch([() => props.dateRange, () => props.selectedMonth], loadExpensesData, { immediate: true });

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
};
</script>

<template>
  <div>
    <h3 class="text-lg font-medium text-gray-900 mb-4">Gider Dağılımı</h3>
    
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center h-64 text-red-500">
      {{ error }}
    </div>

    <div v-else>
      <div class="h-64">
        <Doughnut
          :data="chartData"
          :options="chartOptions"
        />
      </div>

      <!-- Legend with amounts -->
      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="(amount, index) in chartData.datasets[0].data"
          :key="chartData.labels[index]"
          class="flex items-center space-x-2"
        >
          <div
            class="w-3 h-3 rounded-full"
            :style="{ backgroundColor: chartData.datasets[0].backgroundColor[index] }"
          ></div>
          <span class="text-sm text-gray-600">{{ chartData.labels[index] }}</span>
          <span class="text-sm font-medium text-gray-900">
            {{ formatCurrency(amount) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>