<script setup lang="ts">
import { ref } from 'vue';
import DashboardStats from '../stats/DashboardStats.vue';
import DailyAttendance from './DailyAttendance.vue';
import BranchStatistics from './BranchStatistics.vue';

const totalGroups = ref(0);
const totalStudents = ref(0);
const averageAttendance = ref(0);

const handleStatistics = (stats: { 
  totalGroups: number; 
  totalStudents: number; 
  averageAttendance: number; 
}) => {
  totalGroups.value = stats.totalGroups;
  totalStudents.value = stats.totalStudents;
  averageAttendance.value = stats.averageAttendance;
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-10">
      <header>
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            Dashboard
          </h1>
          <p class="mt-1 text-sm text-gray-500">Attendance analytics and insights</p>
        </div>
      </header>

      <main>
        <div class="mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <DashboardStats
              :total-groups="totalGroups"
              :average-attendance="averageAttendance"
              :total-students="totalStudents"
            />

            <div class="space-y-6">
              <DailyAttendance />
              <BranchStatistics @statistics="handleStatistics" />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>