<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, get } from 'firebase/database';
import BranchPerformance from '../branch/BranchPerformance.vue';

interface BranchStats {
  id: string;
  name: string;
  totalStudents: number;
  totalGroups: number;
  attendanceRate: number;
  groups: {
    id: string;
    name: string;
    studentCount: number;
    attendanceRate: number;
  }[];
}

const loading = ref(true);
const error = ref('');
const branchStats = ref<BranchStats[]>([]);

const calculateGroupAttendanceRate = (attendanceData: any) => {
  let totalPresent = 0;
  let totalCount = 0;

  if (!attendanceData) return 0;

  Object.entries(attendanceData).forEach(([, dateData]: [string, any]) => {
    Object.entries(dateData).forEach(([, timeSlotData]: [string, any]) => {
      const presentCount = Object.values(timeSlotData).filter(Boolean).length;
      totalPresent += presentCount;
      totalCount += Object.keys(timeSlotData).length;
    });
  });

  return totalCount > 0 ? (totalPresent / totalCount) * 100 : 0;
};

onMounted(async () => {
  try {
    const [attendanceSnapshot, branchesSnapshot] = await Promise.all([
      get(dbRef(db, 'attendance')),
      get(dbRef(db, 'branches'))
    ]);

    if (!branchesSnapshot.exists()) {
      loading.value = false;
      return;
    }

    const branches = branchesSnapshot.val();
    const attendance = attendanceSnapshot.exists() ? attendanceSnapshot.val() : {};

    // Calculate branch statistics
    branchStats.value = await Promise.all(
      Object.entries(branches).map(async ([branchId, branchData]: [string, any]) => {
        const branchGroups = branchData.groups || {};
        const groups = await Promise.all(
          Object.entries(branchGroups).map(async ([groupId, group]: [string, any]) => {
            const studentCount = group.students ? Object.keys(group.students).length : 0;
            const groupAttendance = attendance[branchId]?.[groupId];
            const attendanceRate = calculateGroupAttendanceRate(groupAttendance);

            return {
              id: groupId,
              name: group.name,
              studentCount,
              attendanceRate: Math.round(attendanceRate)
            };
          })
        );

        const branchStudentCount = groups.reduce((acc, group) => acc + group.studentCount, 0);
        const branchAttendanceRate = groups.length > 0
          ? groups.reduce((acc, group) => acc + group.attendanceRate, 0) / groups.length
          : 0;

        return {
          id: branchId,
          name: branchData.name,
          totalStudents: branchStudentCount,
          totalGroups: groups.length,
          attendanceRate: Math.round(branchAttendanceRate),
          groups: groups.sort((a, b) => b.attendanceRate - a.attendanceRate)
        };
      })
    );

  } catch (err) {
    console.error('Error loading branch statistics:', err);
    error.value = 'Failed to load branch statistics';
  } finally {
    loading.value = false;
  }
});

const sortedBranchStats = computed(() => {
  return [...branchStats.value].sort((a, b) => b.attendanceRate - a.attendanceRate);
});

// Emit total statistics for the dashboard header
const emit = defineEmits(['statistics']);
watch(branchStats, (stats) => {
  const totalGroups = stats.reduce((acc, branch) => acc + branch.totalGroups, 0);
  const totalStudents = stats.reduce((acc, branch) => acc + branch.totalStudents, 0);
  const averageAttendance = stats.length > 0
    ? Math.round(stats.reduce((acc, branch) => acc + branch.attendanceRate, 0) / stats.length)
    : 0;

  emit('statistics', { totalGroups, totalStudents, averageAttendance });
}, { immediate: true });
</script>

<template>
  <div v-if="loading" class="text-center py-4">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
  </div>

  <div v-else-if="error" class="text-red-500 text-center py-4">
    {{ error }}
  </div>

  <div v-else>
    <BranchPerformance :branches="sortedBranchStats" />
  </div>
</template>