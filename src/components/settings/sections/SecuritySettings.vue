<script setup lang="ts">
import { ref } from 'vue';
import { auth } from '../../../firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const emit = defineEmits(['setting-change']);

const settings = ref({
  twoFactorEnabled: false,
  sessionTimeout: '30',
  passwordExpiry: '90',
  loginAttempts: '5'
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const loading = ref(false);
const error = ref('');
const success = ref('');

const handleChange = () => {
  emit('setting-change');
};

const updatePasswordSettings = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    error.value = 'Yeni şifreler eşleşmiyor';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('Kullanıcı bulunamadı');

    // Reauthenticate user
    const credential = EmailAuthProvider.credential(
      user.email,
      passwordForm.value.currentPassword
    );
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, passwordForm.value.newPassword);

    success.value = 'Şifre başarıyla güncellendi';
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  } catch (err: any) {
    console.error('Error updating password:', err);
    error.value = err.code === 'auth/wrong-password' 
      ? 'Mevcut şifre yanlış'
      : 'Şifre güncellenirken bir hata oluştu';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-lg font-medium leading-6 text-gray-900">Güvenlik Ayarları</h3>
      <p class="mt-1 text-sm text-gray-500">
        Hesap güvenliği ve giriş tercihlerinizi yapılandırın
      </p>
    </div>

    <div class="space-y-6">
      <!-- Two Factor Authentication -->
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-sm font-medium text-gray-900">İki Faktörlü Doğrulama</h4>
          <p class="text-xs text-gray-500">Hesabınıza ekstra güvenlik katmanı ekleyin</p>
        </div>
        <button
          type="button"
          @click="settings.twoFactorEnabled = !settings.twoFactorEnabled; handleChange()"
          :class="[
            settings.twoFactorEnabled ? 'bg-indigo-600' : 'bg-gray-200',
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          ]"
        >
          <span
            :class="[
              settings.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0',
              'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
            ]"
          />
        </button>
      </div>

      <!-- Session Settings -->
      <div>
        <h4 class="text-sm font-medium text-gray-900 mb-4">Oturum Ayarları</h4>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Oturum Zaman Aşımı (dakika)
            </label>
            <select
              v-model="settings.sessionTimeout"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              @change="handleChange"
            >
              <option value="15">15 dakika</option>
              <option value="30">30 dakika</option>
              <option value="60">1 saat</option>
              <option value="120">2 saat</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">
              Şifre Geçerlilik Süresi (gün)
            </label>
            <select
              v-model="settings.passwordExpiry"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              @change="handleChange"
            >
              <option value="30">30 gün</option>
              <option value="60">60 gün</option>
              <option value="90">90 gün</option>
              <option value="180">180 gün</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">
              Maksimum Başarısız Giriş Denemesi
            </label>
            <select
              v-model="settings.loginAttempts"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              @change="handleChange"
            >
              <option value="3">3 deneme</option>
              <option value="5">5 deneme</option>
              <option value="10">10 deneme</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Password Change -->
      <div>
        <h4 class="text-sm font-medium text-gray-900 mb-4">Şifre Değiştir</h4>
        
        <form @submit.prevent="updatePasswordSettings" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Mevcut Şifre
            </label>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">
              Yeni Şifre
            </label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">
              Yeni Şifre (Tekrar)
            </label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div v-if="error" class="text-sm text-red-600">
            {{ error }}
          </div>

          <div v-if="success" class="text-sm text-green-600">
            {{ success }}
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading" ```html
              type="submit"
              :disabled="loading"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {{ loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>