<script setup lang="ts">
import { ref } from 'vue';
import { auth } from '../../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const loading = ref(false);
const error = ref('');
const success = ref(false);

const resetPassword = async () => {
  if (!email.value) {
    error.value = 'Lütfen e-posta adresinizi girin';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = false;

  try {
    await sendPasswordResetEmail(auth, email.value);
    success.value = true;
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  } catch (err: any) {
    console.error('Password reset error:', err);
    if (err.code === 'auth/user-not-found') {
      error.value = 'Bu e-posta adresiyle kayıtlı bir hesap bulunamadı';
    } else {
      error.value = 'Şifre sıfırlama işlemi başarısız oldu';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img 
        src="https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Anadolu_Efes_SK_logo.svg/300px-Anadolu_Efes_SK_logo.svg.png" 
        alt="Logo" 
        class="mx-auto h-24 w-auto"
      />
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Şifrenizi Sıfırlayın
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="resetPassword" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              E-posta adresi
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div v-if="error" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  {{ error }}
                </h3>
              </div>
            </div>
          </div>

          <div v-if="success" class="rounded-md bg-green-50 p-4">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">
                  Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.
                </h3>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {{ loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder' }}
            </button>
          </div>

          <div class="text-sm text-center">
            <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
              Giriş sayfasına dön
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>