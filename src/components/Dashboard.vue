<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { ref as dbRef, onValue } from 'firebase/database';
import DashboardStats from './stats/DashboardStats.vue';
import PaymentStats from './payments/PaymentStats.vue';
import BranchPerformance from './branch/BranchPerformance.vue';

interface Payment {
  id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: number;
}

const totalGroups = ref(0);
const totalStudents = ref(0);
const averageAttendance = ref(0);
const payments = ref<Payment[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(() => {
  // Load payments data
  const paymentsRef = dbRef(db, 'payments');
  onValue(paymentsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      payments.value = Object.entries(data).map(([id, payment]: [string, any]) => ({
        id,
        amount: payment.amount,
        status: payment.status,
        date: payment.date
      }));
    } else {
      payments.value = [];
    }
    loading.value = false;
  }, (err) => {
    console.error('Error loading payments:', err);
    error.value = 'Veriler yüklenirken bir hata oluştu';
    loading.value = false;
  });

  // Load branch statistics
  const branchesRef = dbRef(db, 'branches');
  onValue(branchesRef, (snapshot) => {
    if (snapshot.exists()) {
      const branches = snapshot.val();
      let studentCount = 0;
      let groupCount = 0;
      
      Object.values(branches).forEach((branch: any) => {
        if (branch.groups) {
          groupCount += Object.keys(branch.groups).length;
          Object.values(branch.groups).forEach((group: any) => {
            if (group.students) {
              studentCount += Object.keys(group.students).length;
            }
          });
        }
      });
      
      totalGroups.value = groupCount;
      totalStudents.value = studentCount;
      averageAttendance.value = 100; // Default value, update with actual calculation
    }
  });
});
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-10">
      <header>
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            Panel
          </h1>
          <p class="mt-1 text-sm text-gray-500">Yoklama ve ödeme genel bakışı</p>
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

            <div v-if="loading" class="text-center py-4">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>

            <div v-else-if="error" class="text-red-500 text-center py-4">
              {{ error }}
            </div>

            <div v-else class="space-y-6">
              <PaymentStats :payments="payments" />
              <BranchPerformance />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>