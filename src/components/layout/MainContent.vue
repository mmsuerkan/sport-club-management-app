<script setup lang="ts">
import Dashboard from '../Dashboard.vue';
import PaymentDashboard from '../payments/PaymentDashboard.vue';
import PaymentHistory from '../payments/PaymentHistory.vue';
import DuePayments from '../payments/DuePayments.vue';
import DevelopmentDashboard from '../development/DevelopmentDashboard.vue';
import AllGroupsList from '../AllGroupsList.vue';
import AllStudentsList from '../AllStudentsList.vue';
import AttendanceTracker from '../AttendanceTracker.vue';
import AttendanceRecordsList from '../AttendanceRecordsList.vue';
import BranchManagement from '../branch/BranchManagement.vue';
import NotificationDashboard from '../notifications/NotificationDashboard.vue';
import InstructorsDashboard from '../instructors/InstructorsDashboard.vue';
import FinanceOverview from '../finance/FinanceOverview.vue';
import ExpenseManagement from '../finance/ExpenseManagement.vue';
import BudgetPlanning from '../finance/BudgetPlanning.vue';
import FinancialReports from '../finance/FinancialReports.vue';

defineProps<{
  currentPath: string;
  selectedBranch: { id: string; name: string; } | null;
}>();

const emit = defineEmits(['branchSelect', 'resetBranch']);
</script>

<template>
  <div class="pt-16 min-h-screen">
    <div class="py-10">
      <Dashboard v-if="currentPath === 'dashboard'" />
      <BranchManagement
        v-else-if="currentPath === 'branches'"
        :selected-branch="selectedBranch"
        @select-branch="$emit('branchSelect', $event)"
        @reset-branch="$emit('resetBranch')"
      />
      <AllGroupsList v-else-if="currentPath === 'groups'" />
      <AllStudentsList v-else-if="currentPath === 'students'" />
      <InstructorsDashboard v-else-if="currentPath === 'instructors'" />
      <AttendanceTracker v-else-if="currentPath === 'attendance'" />
      <AttendanceRecordsList v-else-if="currentPath === 'attendance-records'" />
      <PaymentDashboard v-else-if="currentPath === 'payments'" />
      <PaymentHistory v-else-if="currentPath === 'payment-history'" />
      <DuePayments v-else-if="currentPath === 'due-payments'" />
      <FinanceOverview v-else-if="currentPath === 'finance-overview'" />
      <ExpenseManagement v-else-if="currentPath === 'expenses'" />
      <BudgetPlanning v-else-if="currentPath === 'budget'" />
      <FinancialReports v-else-if="currentPath === 'financial-reports'" />
      <DevelopmentDashboard v-else-if="currentPath === 'development'" />
      <NotificationDashboard v-else-if="currentPath === 'notifications'" />
    </div>
  </div>
</template>