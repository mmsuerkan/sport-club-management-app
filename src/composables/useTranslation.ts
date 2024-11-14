import { ref } from 'vue';

const translations = {
  tr: {
    common: {
      dashboard: 'Panel',
      branches: 'Şubeler',
      groups: 'Gruplar',
      students: 'Öğrenciler',
      payments: 'Ödemeler',
      paymentHistory: 'Ödeme Geçmişi',
      development: 'Öğrenci Gelişimi',
      date: 'Tarih',
      time: 'Saat',
      student: 'Öğrenci',
      branch: 'Şube',
      group: 'Grup',
      amount: 'Tutar',
      method: 'Ödeme Yöntemi',
      status: 'Durum',
      reference: 'Referans',
      close: 'Kapat',
      cancel: 'İptal',
      processing: 'İşleniyor...',
      selectBranch: 'Şube Seçin',
      selectGroup: 'Grup Seçin',
      selectStudent: 'Öğrenci Seçin',
      searchStudents: 'Öğrenci Ara...',
      noStudentsFound: 'Öğrenci bulunamadı',
      save: 'Kaydet',
      edit: 'Düzenle',
      delete: 'Sil',
      loading: 'Yükleniyor...',
      noData: 'Veri bulunamadı',
      error: 'Hata oluştu',
      success: 'İşlem başarılı'
    },
    development: {
      title: 'Öğrenci Gelişim Paneli',
      subtitle: 'Öğrenci performans ve gelişim takibi',
      selectStudent: 'Lütfen bir öğrenci seçin',
      performanceOverview: 'Performans Özeti',
      skillTracking: 'Yetenek Takibi',
      attendanceParticipation: 'Katılım ve Devam',
      goalsTracking: 'Hedefler',
      healthMetrics: 'Sağlık Metrikleri',
      coachFeedback: 'Antrenör Geribildirimi',
      overallScore: 'Genel Puan',
      improvementRate: 'Gelişim Oranı',
      attendanceRate: 'Katılım Oranı',
      currentLevel: 'Mevcut Seviye',
      targetLevel: 'Hedef Seviye',
      improvement: 'Gelişim',
      noFeedback: 'Geribildirim bulunamadı',
      noGoals: 'Hedef bulunamadı',
      noHealthData: 'Sağlık verisi bulunamadı',
      goals: {
        title: 'Hedefler',
        achieved: 'Tamamlandı',
        inProgress: 'Devam Ediyor',
        upcoming: 'Yaklaşan',
        targetDate: 'Hedef Tarih',
        progress: 'İlerleme'
      },
      health: {
        weight: 'Kilo',
        height: 'Boy',
        bmi: 'VKİ',
        physicalAssessment: 'Fiziksel Değerlendirme',
        injuries: 'Sakatlık Geçmişi',
        active: 'Aktif',
        recovered: 'İyileşti',
        assessment: {
          type: 'Değerlendirme Türü',
          score: 'Puan',
          notes: 'Notlar'
        }
      },
      feedback: {
        coach: 'Antrenör',
        rating: 'Değerlendirme',
        notes: 'Notlar',
        strengths: 'Güçlü Yönler',
        improvements: 'Gelişim Alanları',
        date: 'Tarih'
      },
      calendar: {
        present: 'Katıldı',
        absent: 'Katılmadı',
        weekDays: {
          sun: 'Paz',
          mon: 'Pzt',
          tue: 'Sal',
          wed: 'Çar',
          thu: 'Per',
          fri: 'Cum',
          sat: 'Cmt'
        }
      },
      errors: {
        loadingPerformance: 'Performans verileri yüklenirken hata oluştu',
        loadingSkills: 'Yetenek verileri yüklenirken hata oluştu',
        loadingGoals: 'Hedefler yüklenirken hata oluştu',
        loadingHealth: 'Sağlık verileri yüklenirken hata oluştu',
        loadingFeedback: 'Geribildirimler yüklenirken hata oluştu'
      }
    },
    attendance: {
      takeAttendance: 'Yoklama Al',
      viewRecords: 'Yoklama Kayıtları',
      records: 'Yoklama Kayıtları',
      noRecords: 'Yoklama kaydı bulunamadı',
      present: 'Mevcut',
      absent: 'Yok',
      rate: 'Katılım Oranı'
    },
    payments: {
      newPayment: 'Yeni Ödeme',
      processPayment: 'Ödemeyi İşle',
      history: 'Ödeme Geçmişi',
      viewHistory: 'Tüm ödeme kayıtlarını görüntüle',
      noRecords: 'Ödeme kaydı bulunamadı',
      methods: {
        cash: 'Nakit',
        card: 'Kart',
        transfer: 'Havale'
      },
      status: {
        completed: 'Tamamlandı',
        pending: 'Beklemede',
        failed: 'Başarısız'
      }
    },
    errors: {
      loadingAttendance: 'Yoklama kayıtları yüklenirken hata oluştu',
      loadingStudents: 'Öğrenci listesi yüklenirken hata oluştu',
      savingAttendance: 'Yoklama kaydedilirken hata oluştu',
      generic: 'Bir hata oluştu'
    }
  }
};

const currentLocale = ref('tr');

export function useTranslation() {
  const t = (key: string) => {
    const keys = key.split('.');
    let value = translations[currentLocale.value];
    
    for (const k of keys) {
      if (!value[k]) return key;
      value = value[k];
    }
    
    return value;
  };

  return {
    t,
    currentLocale
  };
}