<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, get } from 'firebase/database';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';

const props = defineProps<{
  studentId: string;
  branchId: string;
  groupId: string;
}>();

const loading = ref(true);
const error = ref('');
const attendanceData = ref<Record<string, boolean>>({});
const currentMonth = ref(new Date());

const loadAttendanceData = async () => {
  try {
    const start = startOfMonth(currentMonth.value);
    const end = endOfMonth(currentMonth.value);
    const days = eachDayOfInterval({ start, end });

    const attendanceRef = dbRef(
      db,
      `attendance/${props.branchId}/${props.groupId}`
    );
    const snapshot = await get(attendanceRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const monthAttendance: Record<string, boolean> = {};

      days.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        let attended = false;

        if (data[dateStr]) {
          // Check all time slots for this date
          Object.values(data[dateStr]).forEach((timeSlot: any) => {
            if (timeSlot[props.studentId]) {
              attended = true;
            }
          });
        }

        monthAttendance[dateStr] = attended;
      });

      attendanceData.value = monthAttendance;
    }
  } catch (err) {
    console.error('Error loading attendance data:', err);
    error.value = 'Failed to load attendance data';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadAttendanceData();
});

const previousMonth = () => {
  currentMonth.value = new Date(currentMonth.value.setMonth(currentMonth.value.getMonth() - 1));
  loadAttendanceData();
};

const nextMonth = () => {
  currentMonth.value = new Date(currentMonth.value.setMonth(currentMonth.value.getMonth() + 1));
  loadAttendanceData();
};

const getDaysInMonth = () => {
  const start = startOfMonth(currentMonth.value);
  const end = endOfMonth(currentMonth.value);
  return eachDayOfInterval({ start, end });
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
      <!-- Calendar Navigation -->
      <div class="flex items-center justify-between mb-4">
        <button
          @click="previousMonth"
          class="p-2 rounded-md hover:bg-gray-100"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 class="text-lg font-medium text-gray-900">
          {{ format(currentMonth, 'MMMM yyyy') }}
        </h3>
        <button
          @click="nextMonth"
          class="p-2 rounded-md hover:bg-gray-100"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-1">
        <!-- Day Headers -->
        <div
          v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
          :key="day"
          class="text-center text-sm font-medium text-gray-500 py-2"
        >
          {{ day }}
        </div>

        <!-- Calendar Days -->
        <div
          v-for="date in getDaysInMonth()"
          :key="format(date, 'yyyy-MM-dd')"
          class="aspect-square p-2 border rounded-md"
          :class="[
            attendanceData[format(date, 'yyyy-MM-dd')]
              ? 'bg-green-50 border-green-200'
              : 'bg-gray-50 border-gray-200'
          ]"
        >
          <div class="flex flex-col h-full">
            <span class="text-sm">{{ format(date, 'd') }}</span>
            <div class="flex-grow flex items-center justify-center">
              <div
                v-if="attendanceData[format(date, 'yyyy-MM-dd')]"
                class="w-2 h-2 rounded-full bg-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="mt-4 flex items-center justify-end space-x-4 text-sm text-gray-500">
        <div class="flex items-center">
          <div class="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <span>Present</span>
        </div>
        <div class="flex items-center">
          <div class="w-2 h-2 rounded-full bg-gray-300 mr-2"></div>
          <span>Absent</span>
        </div>
      </div>
    </div>
  </div>
</template>