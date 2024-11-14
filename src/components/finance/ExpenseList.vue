<script setup lang="ts">
import { ref } from 'vue';
import { db } from '../../firebase';
import { ref as dbRef, update } from 'firebase/database';

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  receipt?: string;
}

const props = defineProps<{
  expenses: Expense[];
  loading: boolean;
  error: string;
}>();

const updateStatus = async (expenseId: string, newStatus: 'approved' | 'rejected') => {
  try {
    await update(dbRef(db, `expenses/${expenseId}`), {
      status: newStatus,
      updatedAt: Date.now()
    });
  } catch (err) {
    console.error('Error updating expense status:', err);
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'approved':
      return 'Onaylandı';
    case 'rejected':
      return 'Reddedildi';
    default:
      return 'Beklemede';
  }
};
</script>

<template>
  <div class="bg-white shadow rounded-lg overflow-hidden">
    <div v-if="loading" class="text-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
    </div>

    <div v-else-if="error" class="text-red-500 text-center py-4">
      {{ error }}
    </div>

    <div v-else-if="expenses.length === 0" class="text-center py-4 text-gray-500">
      Henüz gider kaydı bulunmamaktadır
    </div>

    <div v-else>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-300">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                Tarih
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Kategori
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Açıklama
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Tutar
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Durum
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="expense in expenses" :key="expense.id">
              <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                {{ new Date(expense.date).toLocaleDateString('tr-TR') }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {{ expense.category }}
              </td>
              <td class="px-3 py-4 text-sm text-gray-500">
                {{ expense.description }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                {{ formatCurrency(expense.amount) }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm">
                <span :class="[
                  getStatusColor(expense.status),
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
                ]">
                  {{ getStatusText(expense.status) }}
                </span>
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm">
                <div class="flex items-center space-x-2">
                  <button
                    v-if="expense.status === 'pending'"
                    @click="updateStatus(expense.id, 'approved')"
                    class="text-green-600 hover:text-green-900"
                  >
                    Onayla
                  </button>
                  <button
                    v-if="expense.status === 'pending'"
                    @click="updateStatus(expense.id, 'rejected')"
                    class="text-red-600 hover:text-red-900"
                  >
                    Reddet
                  </button>
                  <a
                    v-if="expense.receipt"
                    :href="expense.receipt"
                    target="_blank"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    Fiş/Fatura
                  </a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>