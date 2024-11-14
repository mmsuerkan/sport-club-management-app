<script setup lang="ts">
import { ref } from 'vue';
import FinancialMetrics from './metrics/FinancialMetrics.vue';
import RevenueChart from './charts/RevenueChart.vue';
import ExpensesBreakdown from './charts/ExpensesBreakdown.vue';
import CashflowSummary from './metrics/CashflowSummary.vue';
import DateRangeFilter from './filters/DateRangeFilter.vue';

const dateRange = ref('month'); // month, quarter, year
const selectedMonth = ref(new Date());

const handleDateRangeChange = (range: string) => {
  dateRange.value = range;
};

const handleMonthChange = (date: Date) => {
  selectedMonth.value = date;
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="py-10">
      <header>
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
          <div class="md:flex md:items-center md:justify-between">
            <div class="min-w-0 flex-1">
              <h1 class="text-3xl font-bold leading-tight text-gray-900">
                Finansal Genel Bakış
              </h1>
              <p class="mt-2 text-sm text-gray-600">
                Gelir, gider ve nakit akışı yönetimi
              </p>
            </div>
            <div class="mt-4 flex md:ml-4 md:mt-0">
              <DateRangeFilter
                :selected-range="dateRange"
                :selected-month="selectedMonth"
                @range-change="handleDateRangeChange"
                @month-change="handleMonthChange"
              />
            </div>
          </div>
        </div>
      </header>

      <main>
        <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <!-- Key Metrics -->
            <FinancialMetrics
              :date-range="dateRange"
              :selected-month="selectedMonth"
            />

            <div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <!-- Revenue Chart -->
              <div class="bg-white rounded-lg shadow p-6">
                <RevenueChart
                  :date-range="dateRange"
                  :selected-month="selectedMonth"
                />
              </div>

              <!-- Expenses Breakdown -->
              <div class="bg-white rounded-lg shadow p-6">
                <ExpensesBreakdown
                  :date-range="dateRange"
                  :selected-month="selectedMonth"
                />
              </div>
            </div>

            <!-- Cashflow Summary -->
            <div class="mt-8">
              <CashflowSummary
                :date-range="dateRange"
                :selected-month="selectedMonth"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>