<script setup lang="ts">
import { useRouter } from 'vue-router';
import { 
  ArrowLeftIcon,
  HomeIcon,
  BuildingOfficeIcon,
  ClipboardDocumentCheckIcon,
  CreditCardIcon,
  ChartBarIcon,
  BellIcon,
  QuestionMarkCircleIcon
} from '@heroicons/vue/24/outline';

const router = useRouter();

const goBack = () => {
  router.push('/');
};

const goToHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto relative">
      <!-- Back Button -->
      <button
        @click="goBack"
        class="absolute -left-16 top-0 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-white hover:shadow-md transition-all duration-200"
        title="Geri Dön"
      >
        <ArrowLeftIcon class="w-6 h-6" />
      </button>

      <!-- Return to Homepage Button -->
      <button
        @click="goToHome"
        class="absolute right-0 top-0 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 hover:text-gray-900 focus:z-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
      >
        <HomeIcon class="w-5 h-5 mr-2" />
        Ana Sayfaya Dön
      </button>

      <!-- Header -->
      <div class="text-center mb-16">
        <div class="inline-block p-4 bg-white rounded-full shadow-md mb-6">
          <QuestionMarkCircleIcon class="w-12 h-12 text-indigo-600" />
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Yardım Merkezi</h1>
        <p class="text-xl text-gray-600">Sport Club yönetim sistemi kullanım kılavuzu</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Dashboard -->
        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <div class="p-3 bg-indigo-100 rounded-lg">
                <HomeIcon class="w-6 h-6 text-indigo-600" />
              </div>
              <h2 class="text-xl font-semibold text-gray-900 ml-4">Panel</h2>
            </div>
            <p class="text-gray-600 mb-4">
              Panel ekranında istatistikleri görüntüleyin:
            </p>
            <ul class="space-y-3">
              <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                Toplam grup sayısı
              </li>
              <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                Aktif öğrenci sayısı
              </li>
              <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                Ortalama katılım oranı
              </li>
            </ul>
          </div>
        </div>

        <!-- Branches -->
        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <div class="p-3 bg-blue-100 rounded-lg">
                <BuildingOfficeIcon class="w-6 h-6 text-blue-600" />
              </div>
              <h2 class="text-xl font-semibold text-gray-900 ml-4">Şubeler</h2>
            </div>
            <p class="text-gray-600 mb-4">
              Şubelerinizi ve gruplarınızı yönetin:
            </p>
            <ul class="space-y-3">
              <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Yeni şube ekleme
              </li>
              <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Şube düzenleme ve silme
              </li>
              <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Grup yönetimi
              </li>
            </ul>
          </div>
        </div>

        <!-- Attendance -->
        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <div class="p-3 bg-green-100 rounded-lg">
                <ClipboardDocumentCheckIcon class="w-6 h-6 text-green-600" />
              </div>
              <h2 class="text-xl font-semibold text-gray-900 ml-4">Yoklama</h2>
            </div>
            <p class="text-gray-600 mb-4">
              Öğrenci yoklamalarını takip edin:
            </p>
            <ul class="space-y-3">
              <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Günlük yoklama alma
              </li>
              <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Geçmiş yoklamalar
              </li>
              <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Katılım raporları
              </li>
            </ul>
          </div>
        </div>

        <!-- Payments -->
        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <div class="p-3 bg-purple-100 rounded-lg">
                <CreditCardIcon class="w-6 h-6 text-purple-600" />
              </div>
              <h2 class="text-xl font-semibold text-gray-900 ml-4">Ödemeler</h2>
            </div>
            <p class="text-gray-600 mb-4">
              Öğrenci ödemelerini yönetin:
            </p>
            <ul class="space-y-3">
              <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Yeni ödeme kaydetme
              </li>
              <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Ödeme geçmişi
              </li>
              <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Durum takibi
              </li>
            </ul>
          </div>
        </div>

        <!-- Development -->
        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <div class="p-3 bg-yellow-100 rounded-lg">
                <ChartBarIcon class="w-6 h-6 text-yellow-600" />
              </div>
              <h2 class="text-xl font-semibold text-gray-900 ml-4">Öğrenci Gelişimi</h2>
            </div>
            <p class="text-gray-600 mb-4">
              Gelişim takibi yapın:
            </p>
            <ul class="space-y-3">
              <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                Performans değerlendirme
              </li>
              <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                Yetenek takibi
              </li>
              <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                Sağlık metrikleri
              </li>
            </ul>
          </div>
        </div>

        <!-- Notifications -->
        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <div class="p-3 bg-red-100 rounded-lg">
                <BellIcon class="w-6 h-6 text-red-600" />
              </div>
              <h2 class="text-xl font-semibold text-gray-900 ml-4">Bildirimler</h2>
            </div>
            <p class="text-gray-600 mb-4">
              Bildirimleri yönetin:
            </p>
            <ul class="space-y-3">
              <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Bildirim oluşturma
              </li>
              <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Bildirim geçmişi
              </li>
              <li class="flex items-center text-gray-600">
                <span class="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Hedef kitle seçimi
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Support Section -->
      <div class="mt-12 bg-white rounded-xl shadow-md p-8 text-center">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Yardıma mı ihtiyacınız var?</h2>
        <p class="text-gray-600 mb-6">
          Daha fazla yardım için destek ekibimizle iletişime geçebilirsiniz
        </p>
        <a 
          href="mailto:support@sportclub.com"
          class="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          İletişime Geçin
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid {
  scroll-margin-top: 2rem;
}

@media (min-width: 768px) {
  .grid {
    scroll-margin-top: 4rem;
  }
}
</style>