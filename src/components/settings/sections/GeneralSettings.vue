<script setup lang="ts">
import { ref } from 'vue';
import { db } from '../../../firebase';
import { ref as dbRef, update } from 'firebase/database';

const emit = defineEmits(['setting-change']);

const settings = ref({
  clubName: 'Sport Club',
  address: '',
  phone: '',
  email: '',
  taxId: '',
  currency: 'TRY',
  language: 'tr',
  timezone: 'Europe/Istanbul'
});

const currencies = [
  { value: 'TRY', label: 'Türk Lirası (₺)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' }
];

const languages = [
  { value: 'tr', label: 'Türkçe' },
  { value: 'en', label: 'English' }
];

const timezones = [
  { value: 'Europe/Istanbul', label: 'İstanbul (UTC+3)' },
  { value: 'Europe/London', label: 'London (UTC+0)' }
];

const handleChange = () => {
  emit('setting-change');
};
</script>

<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-medium leading-6 text-gray-900">Genel Ayarlar</h3>
      <p class="mt-1 text-sm text-gray-500">
        Temel kurum bilgilerini ve tercihlerini yapılandırın
      </p>
    </div>

    <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
      <!-- Club Name -->
      <div class="sm:col-span-4">
        <label class="block text-sm font-medium text-gray-700">
          Kurum Adı
        </label>
        <div class="mt-1">
          <input
            v-model="settings.clubName"
            type="text"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            @change="handleChange"
          />
        </div>
      </div>

      <!-- Address -->
      <div class="sm:col-span-6">
        <label class="block text-sm font-medium text-gray-700">
          Adres
        </label>
        <div class="mt-1">
          <textarea
            v-model="settings.address"
            rows="3"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            @change="handleChange"
          />
        </div>
      </div>

      <!-- Contact Info -->
      <div class="sm:col-span-3">
        <label class="block text-sm font-medium text-gray-700">
          Telefon
        </label>
        <div class="mt-1">
          <input
            v-model="settings.phone"
            type="tel"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            @change="handleChange"
          />
        </div>
      </div>

      <div class="sm:col-span-3">
        <label class="block text-sm font-medium text-gray-700">
          E-posta
        </label>
        <div class="mt-1">
          <input
            v-model="settings.email"
            type="email"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            @change="handleChange"
          />
        </div>
      </div>

      <!-- Tax ID -->
      <div class="sm:col-span-3">
        <label class="block text-sm font-medium text-gray-700">
          Vergi Numarası
        </label>
        <div class="mt-1">
          <input
            v-model="settings.taxId"
            type="text"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            @change="handleChange"
          />
        </div>
      </div>

      <!-- Preferences -->
      <div class="sm:col-span-2">
        <label class="block text-sm font-medium text-gray-700">
          Para Birimi
        </label>
        <div class="mt-1">
          <select
            v-model="settings.currency"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            @change="handleChange"
          >
            <option v-for="currency in currencies" :key="currency.value" :value="currency.value">
              {{ currency.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="sm:col-span-2">
        <label class="block text-sm font-medium text-gray-700">
          Dil
        </label>
        <div class="mt-1">
          <select
            v-model="settings.language"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            @change="handleChange"
          >
            <option v-for="language in languages" :key="language.value" :value="language.value">
              {{ language.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="sm:col-span-2">
        <label class="block text-sm font-medium text-gray-700">
          Saat Dilimi
        </label>
        <div class="mt-1">
          <select
            v-model="settings.timezone"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            @change="handleChange"
          >
            <option v-for="timezone in timezones" :key="timezone.value" :value="timezone.value">
              {{ timezone.label }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>