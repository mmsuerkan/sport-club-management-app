<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
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
  studentId: string;
}>();

const loading = ref(true);
const error = ref('');
const performanceData = ref({
  overallScore: 0,
  improvementRate: 0,
  attendanceRate: 0,
  skillsProgress: []
});

const chartData = ref({
  labels: [],
  datasets: [{
    label: 'Overall Performance',
    data: [],
    fill: false,
    borderColor: '#4F46E5',
    tension: 0.1
  }]
});

onMounted(async () => {
  try {
    const performanceRef = dbRef(db, `studentPerformance/${props.studentId}`);
    const snapshot = await get(performanceRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      performanceData.value = data;

      // Prepare chart data
      chartData.value.labels = data.skillsProgress.map((_, index) => `Week ${index + 1}`);
      chartData.value.datasets[0].data = data.skillsProgress;
    }
  } catch (err) {
    console.error('Error loading performance data:', err);
    error.value = 'Failed to load performance data';
  } finally {
    loading.value = false;
  }
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  }
};
</script>

<template>
  <div>
    <div v-if="loading" class="text-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
    </div>

    <div v-else-if="error" class="text-red-500 text-center py-4">
      {{ error }}
    </div>

    <div v-else>
      <!-- Key Stats -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">Overall Score</dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ performanceData.overallScore }}%
            </dd>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">Improvement Rate</dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ performanceData.improvementRate }}%
            </dd>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">Attendance Rate</dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ performanceData.attendanceRate }}%
            </dd>
          </div>
        </div>
      </div>

      <!-- Performance Graph -->
      <div class="h-80">
        <Line
          :data="chartData"
          :options="chartOptions"
        />
      </div>
    </div>
  </div>
</template>