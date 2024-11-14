<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { db } from '../../../firebase';
import { ref as dbRef, get } from 'firebase/database';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
} from 'chart.js';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale
);

const props = defineProps<{
  dateRange: string;
  selectedMonth: Date;
}>();

const chartData = ref({
  labels: [],
  datasets: [
    {
      label: 'Gelir',
      data: [],
      borderColor: '#10B981',
      tension: 0.4
    },
    {
      label: 'Gider',
      data: [],
      borderColor: '#EF4444',
      tension: 0.4
    }
  ]
});

const loading = ref(true);
const error = ref('');

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: number) => `₺${value.toLocaleString()}`
      }
    }
  }
};

const loadChartData = async () => {
  loading.value = true;
  error.value = '';

  try {
    const start = startOfMonth(props.selectedMonth);
    const end = endOfMonth(props.selectedMonth);
    const days = eachDayOfInterval({ start, end });

    const [paymentsSnapshot, expensesSnapshot] = await Promise.all([
      get(dbRef(db, 'payments')),
      get(dbRef(db, 'expenses'))
    ]);

    const dailyRevenue: Record<string, number> = {};
    const dailyExpenses: Record<string, number> = {};

    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      dailyRevenue[dateStr] = 0;
      dailyExpenses[dateStr] = 0;
    });

    if (paymentsSnapshot.exists()) {
      const payments = paymentsSnapshot.val();
      Object.values(payments).forEach((payment: any) => {
        if (payment.status === 'completed') {
          const dateStr = format(new Date(payment.date), 'yyyy-MM-dd');
          if (dailyRevenue[dateStr] !== undefined) {
            dailyRevenue[dateStr] += payment.amount;
          }
        }
      });
    }

    if (expensesSnapshot.exists()) {
      const expenses = expensesSnapshot.val();
      Object.values(expenses).forEach((expense: any) => {
        const dateStr = format(new Date(expense.date), 'yyyy-MM-dd');
        if (dailyExpenses[dateStr] !== undefined) {
          dailyExpenses[dateStr] += expense.amount;
        }
      });
    }

    chartData.value = {
      labels: days.map(day => format(day, 'd MMM')),
      datasets: [
        {
          label: 'Gelir',
          data: Object.values(dailyRevenue),
          borderColor: '#10B981',
          tension: 0.4
        },
        {
          label: 'Gider',
          data: Object.values(dailyExpenses),
          borderColor: '#EF4444',
          tension: 0.4
        }
      ]
    };
  } catch (err) {
    console.error('Error loading chart data:', err);
    error.value = 'Grafik verileri yüklenirken bir hata oluştu';
  } finally {
    loading.value = false;
  }
};

watch([() => props.dateRange, () => props.selectedMonth], loadChartData, { immediate: true });
</script>

<template>
  <div>
    <h3 class="text-lg font-medium text-gray-900 mb-4">Gelir ve Gider Grafiği</h3>
    
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center h-64 text-red-500">
      {{ error }}
    </div>

    <div v-else class="h-64">
      <Line
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>