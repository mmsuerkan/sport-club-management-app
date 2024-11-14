<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, get } from 'firebase/database';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import AttendanceChart from '../stats/AttendanceChart.vue';

const loading = ref(true);
const error = ref('');

const dailyAttendanceData = ref({
  labels: [],
  datasets: [{
    label: 'Daily Attendance Rate (%)',
    data: [],
    fill: false,
    borderColor: '#4F46E5',
    tension: 0.1
  }]
});

onMounted(async () => {
  try {
    const attendanceRef = dbRef(db, 'attendance');
    const attendanceSnapshot = await get(attendanceRef);

    if (!attendanceSnapshot.exists()) {
      loading.value = false;
      return;
    }

    const attendance = attendanceSnapshot.val();
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    // Initialize daily attendance tracking
    const dailyAttendance: { [key: string]: { present: number; total: number } } = {};
    last7Days.forEach(date => {
      dailyAttendance[format(date, 'yyyy-MM-dd')] = { present: 0, total: 0 };
    });

    // Process attendance data
    Object.entries(attendance).forEach(([, branchData]: [string, any]) => {
      Object.entries(branchData).forEach(([, groupData]: [string, any]) => {
        Object.entries(groupData).forEach(([date, dateData]: [string, any]) => {
          Object.entries(dateData).forEach(([, timeSlotData]: [string, any]) => {
            const presentCount = Object.values(timeSlotData).filter(Boolean).length;
            const totalCount = Object.keys(timeSlotData).length;

            if (dailyAttendance[date]) {
              dailyAttendance[date].present += presentCount;
              dailyAttendance[date].total += totalCount;
            }
          });
        });
      });
    });

    // Prepare chart data
    dailyAttendanceData.value.labels = last7Days.map(date => format(date, 'MMM d'));
    dailyAttendanceData.value.datasets[0].data = last7Days.map(date => {
      const key = format(date, 'yyyy-MM-dd');
      const data = dailyAttendance[key];
      return data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;
    });

  } catch (err) {
    console.error('Error loading daily attendance data:', err);
    error.value = 'Failed to load daily attendance data';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-if="loading" class="text-center py-4">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
  </div>

  <div v-else-if="error" class="text-red-500 text-center py-4">
    {{ error }}
  </div>

  <div v-else>
    <AttendanceChart :chart-data="dailyAttendanceData" />
  </div>
</template>