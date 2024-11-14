<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, get } from 'firebase/database';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import DateRangeFilter from './filters/DateRangeFilter.vue';

const dateRange = ref('month');
const selectedMonth = ref(new Date());
const loading = ref(true);
const error = ref('');

const financialData = ref({
  income: [] as any[],
  expenses: [] as any[],
  totalIncome: 0,
  totalExpenses: 0,
  netIncome: 0
});

const handleDateRangeChange = (range: string) => {
  dateRange.value = range;
  loadFinancialData();
};

const handleMonthChange = (date: Date) => {
  selectedMonth.value = date;
  loadFinancialData();
};

const loadFinancialData = async () => {
  loading.value = true;
  error.value = '';

  try {
    const start = startOfMonth(selectedMonth.value);
    const end = endOfMonth(selectedMonth.value);

    const [paymentsSnapshot, expensesSnapshot] = await Promise.all([
      get(dbRef(db, 'payments')),
      get(dbRef(db, 'expenses'))
    ]);

    const income: any[] = [];
    const expenses: any[] = [];
    let totalIncome = 0;
    let totalExpenses = 0;

    if (paymentsSnapshot.exists()) {
      const payments = paymentsSnapshot.val();
      Object.entries(payments).forEach(([id, payment]: [string, any]) => {
        const paymentDate = new Date(payment.date);
        if (paymentDate >= start && paymentDate <= end && payment.status === 'completed') {
          income.push({
            id,
            date: payment.date,
            description: `${payment.studentName} - ${payment.branchName}`,
            amount: payment.amount,
            method: payment.method
          });
          totalIncome += payment.amount;
        }
      });
    }

    if (expensesSnapshot.exists()) {
      const expensesData = expensesSnapshot.val();
      Object.entries(expensesData).forEach(([id, expense]: [string, any]) => {
        const expenseDate = new Date(expense.date);
        if (expenseDate >= start && expenseDate <= end) {
          expenses.push({
            id,
            date: expense.date,
            category: expense.category,
            description: expense.description,
            amount: expense.amount
          });
          totalExpenses += expense.amount;
        }
      });
    }

    financialData.value = {
      income: income.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      expenses: expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses
    };
  } catch (err) {
    console.error('Error loading financial data:', err);
    error.value = 'Finansal veriler yüklenirken bir hata oluştu';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadFinancialData();
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('tr-TR');
};

const generatePDF = () => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('Finansal Rapor', 14, 20);
  
  // Date Range
  doc.setFontSize(12);
  doc.text(`${format(selectedMonth.value, 'MMMM yyyy')}`, 14, 30);
  
  // Summary
  doc.setFontSize(14);
  doc.text('Özet', 14, 40);
  
  const summaryData = [
    ['Toplam Gelir', formatCurrency(financialData.value.totalIncome)],
    ['Toplam Gider', formatCurrency(financialData.value.totalExpenses)],
    ['Net Durum', formatCurrency(financialData.value.netIncome)]
  ];
  
  autoTable(doc, {
    startY: 45,
    head: [['Açıklama', 'Tutar']],
    body: summaryData,
    theme: 'striped'
  });
  
  // Income
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Gelirler', 14, 20);
  
  const incomeData = financialData.value.income.map(item => [
    formatDate(item.date),
    item.description,
    formatCurrency(item.amount),
    item.method
  ]);
  
  autoTable(doc, {
    startY: 25,
    head: [['Tarih', 'Açıklama', 'Tutar', 'Ödeme Yöntemi']],
    body: incomeData,
    theme: 'striped'
  });
  
  // Expenses
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Giderler', 14, 20);
  
  const expenseData = financialData.value.expenses.map(item => [
    formatDate(item.date),
    item.category,
    item.description,
    formatCurrency(item.amount)
  ]);
  
  autoTable(doc, {
    startY: 25,
    head: [['Tarih', 'Kategori', 'Açıklama', 'Tutar']],
    body: expenseData,
    theme: 'striped'
  });

  doc.save(`finansal_rapor_${format(selectedMonth.value, 'yyyy-MM')}.pdf`);
};

const exportToExcel = () => {
  const workbook = XLSX.utils.book_new();
  
  // Summary Sheet
  const summaryData = [
    ['Finansal Özet'],
    [],
    ['Açıklama', 'Tutar'],
    ['Toplam Gelir', financialData.value.totalIncome],
    ['Toplam Gider', financialData.value.totalExpenses],
    ['Net Durum', financialData.value.netIncome]
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Özet');
  
  // Income Sheet
  const incomeData = [
    ['Gelirler'],
    [],
    ['Tarih', 'Açıklama', 'Tutar', 'Ödeme Yöntemi'],
    ...financialData.value.income.map(item => [
      formatDate(item.date),
      item.description,
      item.amount,
      item.method
    ])
  ];
  
  const incomeSheet = XLSX.utils.aoa_to_sheet(incomeData);
  XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Gelirler');
  
  // Expenses Sheet
  const expenseData = [
    ['Giderler'],
    [],
    ['Tarih', 'Kategori', 'Açıklama', 'Tutar'],
    ...financialData.value.expenses.map(item => [
      formatDate(item.date),
      item.category,
      item.description,
      item.amount
    ])
  ];
  
  const expenseSheet = XLSX.utils.aoa_to_sheet(expenseData);
  XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Giderler');
  
  XLSX.writeFile(workbook, `finansal_rapor_${format(selectedMonth.value, 'yyyy-MM')}.xlsx`);
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
                Finansal Raporlar
              </h1>
              <p class="mt-2 text-sm text-gray-600">
                Gelir ve gider raporlarını görüntüleyin ve dışa aktarın
              </p>
            </div>
            <div class="mt-4 flex md:ml-4 md:mt-0 space-x-4">
              <DateRangeFilter
                :selected-range="dateRange"
                :selected-month="selectedMonth"
                @range-change="handleDateRangeChange"
                @month-change="handleMonthChange"
              />
              <button
                @click="generatePDF"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                PDF İndir
              </button>
              <button
                @click="exportToExcel"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                Excel İndir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <div v-if="loading" class="text-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>

            <div v-else-if="error" class="text-center py-12 text-red-500">
              {{ error }}
            </div>

            <div v-else>
              <!-- Summary Cards -->
              <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
                <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="px-4 py-5 sm:p-6">
                    <dt class="text-sm font-medium text-gray-500 truncate">Toplam Gelir</dt>
                    <dd class="mt-1 text-3xl font-semibold text-green-600">
                      {{ formatCurrency(financialData.totalIncome) }}
                    </dd>
                  </div>
                </div>
                <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="px-4 py-5 sm:p-6">
                    <dt class="text-sm font-medium text-gray-500 truncate">Toplam Gider</dt>
                    <dd class="mt-1 text-3xl font-semibold text-red-600">
                      {{ formatCurrency(financialData.totalExpenses) }}
                    </dd>
                  </div>
                </div>
                <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="px-4 py-5 sm:p-6">
                    <dt class="text-sm font-medium text-gray-500 truncate">Net Durum</dt>
                    <dd class="mt-1 text-3xl font-semibold" 
                        :class="financialData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'">
                      {{ formatCurrency(financialData.netIncome) }}
                    </dd>
                  </div>
                </div>
              </div>

              <!-- Income Table -->
              <div class="bg-white shadow rounded-lg mb-8">
                <div class="px-4 py-5 sm:px-6">
                  <h2 class="text-lg font-medium text-gray-900">Gelirler</h2>
                </div>
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tarih
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Açıklama
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tutar
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ödeme Yöntemi
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="item in financialData.income" :key="item.id">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ formatDate(item.date) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ item.description }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {{ formatCurrency(item.amount) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ item.method }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Expenses Table -->
              <div class="bg-white shadow rounded-lg">
                <div class="px-4 py-5 sm:px-6">
                  <h2 class="text-lg font-medium text-gray-900">Giderler</h2>
                </div>
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tarih
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kategori
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Açıklama
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tutar
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="item in financialData.expenses" :key="item.id">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ formatDate(item.date) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ item.category }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ item.description }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                          {{ formatCurrency(item.amount) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>