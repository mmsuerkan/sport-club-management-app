<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, onValue } from 'firebase/database';
import GroupPerformance from './GroupPerformance.vue';
import BranchStats from './BranchStats.vue';
import LoadingSpinner from '../common/LoadingSpinner.vue';
import ErrorMessage from '../common/ErrorMessage.vue';
import EmptyState from '../common/EmptyState.vue';

interface Branch {
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

const branches = ref<Branch[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(() => {
  const branchesRef = dbRef(db, 'branches');
  const attendanceRef = dbRef(db, 'attendance');

  Promise.all([
    new Promise(resolve => onValue(branchesRef, resolve, { onlyOnce: true })),
    new Promise(resolve => onValue(attendanceRef, resolve, { onlyOnce: true }))
  ]).then(([branchesSnapshot, attendanceSnapshot]) => {
    try {
      if (!branchesSnapshot.exists()) {
        branches.value = [];
        return;
      }

      const branchesData = branchesSnapshot.val();
      const attendanceData = attendanceSnapshot.exists() ? attendanceSnapshot.val() : {};
      const branchList: Branch[] = [];

      Object.entries(branchesData).forEach(([branchId, branchData]: [string, any]) => {
        const groups = [];
        let branchTotalStudents = 0;
        let branchTotalAttendance = 0;
        let branchTotalSessions = 0;

        if (branchData.groups) {
          Object.entries(branchData.groups).forEach(([groupId, groupData]: [string, any]) => {
            const studentCount = groupData.students ? Object.keys(groupData.students).length : 0;
            branchTotalStudents += studentCount;

            let groupAttendance = 0;
            let groupSessions = 0;

            if (attendanceData[branchId]?.[groupId]) {
              Object.values(attendanceData[branchId][groupId]).forEach((dateData: any) => {
                Object.values(dateData).forEach((timeSlotData: any) => {
                  const presentCount = Object.values(timeSlotData).filter(Boolean).length;
                  groupAttendance += presentCount;
                  groupSessions += Object.keys(timeSlotData).length;
                });
              });
            }

            const groupAttendanceRate = groupSessions > 0 
              ? (groupAttendance / groupSessions) * 100 
              : 0;

            branchTotalAttendance += groupAttendance;
            branchTotalSessions += groupSessions;

            groups.push({
              id: groupId,
              name: groupData.name,
              studentCount,
              attendanceRate: Math.round(groupAttendanceRate)
            });
          });
        }

        const branchAttendanceRate = branchTotalSessions > 0
          ? (branchTotalAttendance / branchTotalSessions) * 100
          : 0;

        branchList.push({
          id: branchId,
          name: branchData.name,
          totalStudents: branchTotalStudents,
          totalGroups: groups.length,
          attendanceRate: Math.round(branchAttendanceRate),
          groups: groups.sort((a, b) => b.attendanceRate - a.attendanceRate)
        });
      });

      branches.value = branchList.sort((a, b) => b.attendanceRate - a.attendanceRate);
    } catch (err) {
      console.error('Error processing branch performance data:', err);
      error.value = 'Şube performans verileri yüklenirken bir hata oluştu';
    } finally {
      loading.value = false;
    }
  }).catch(err => {
    console.error('Error loading branch data:', err);
    error.value = 'Veriler yüklenirken bir hata oluştu';
    loading.value = false;
  });
});
</script>

<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Şube Performansı</h3>

    <LoadingSpinner v-if="loading" />
    <ErrorMessage v-else-if="error" :message="error" />
    <EmptyState v-else-if="branches.length === 0" message="Henüz şube bulunmamaktadır" />

    <div v-else class="space-y-6">
      <div v-for="branch in branches" :key="branch.id" class="border-b pb-6 last:border-b-0">
        <BranchStats :branch="branch" />
        <GroupPerformance :groups="branch.groups" />
      </div>
    </div>
  </div>
</template>