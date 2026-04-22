const express = require('express');
const router = express.Router();

router.post('/suggest', async (req, res) => {
  const { tasks } = req.body;

  if (!tasks || tasks.length === 0) {
    return res.json({ suggestion: 'Henüz görev eklenmemiş.' });
  }

  const priorityMap = {
    critical: 'kritik',
    high: 'yüksek',
    medium: 'orta',
    low: 'düşük',
    minimal: 'çok düşük'
  };

  const oncelikPuan = { critical: 0, high: 1, medium: 2, low: 3, minimal: 4 };

  const tamamlanmamis = tasks.filter(t => t.completed === 0);

  if (tamamlanmamis.length === 0) {
    return res.json({ suggestion: 'Tüm görevleri tamamladın, tebrikler! 🎉' });
  }

  // Akıllı sıralama: deadline yakınlığı > öncelik > süre
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);

  const skorHesapla = (t) => {
    let skor = 0;

    // Deadline skoru (yakın deadline = düşük skor = önce gelir)
    if (t.deadline) {
      const deadlineDate = new Date(t.deadline);
      deadlineDate.setHours(0, 0, 0, 0);
      const gunFarki = Math.floor((deadlineDate - bugun) / (1000 * 60 * 60 * 24));
      if (gunFarki <= 0) skor -= 1000;      // bugün veya geçmiş
      else if (gunFarki === 1) skor -= 800; // yarın
      else if (gunFarki <= 3) skor -= 600;  // 3 gün içinde
      else if (gunFarki <= 7) skor -= 400;  // bu hafta
      else skor -= 200;                      // daha uzak
    }

    // Öncelik skoru
    skor += (oncelikPuan[t.priority] || 2) * 100;

    // Tahmini süre skoru (kısa süre = biraz önce)
    if (t.estimated_hours > 0) {
      skor += Math.min(t.estimated_hours / 60, 5) * 10;
    }

    return skor;
  };

  const sirali = [...tamamlanmamis].sort((a, b) => skorHesapla(a) - skorHesapla(b));
  const secilenGorev = sirali[0];

  // Neden metinleri
  const bugunStr = bugun.toISOString().split('T')[0];
  const yarinStr = new Date(bugun.getTime() + 86400000).toISOString().split('T')[0];

  let neden = '';
  if (secilenGorev.deadline === bugunStr) {
    neden = 'Son tarihi bugün, bekleyemez!';
  } else if (secilenGorev.deadline === yarinStr) {
    neden = 'Son tarihi yarın, zaman daralıyor!';
  } else if (secilenGorev.deadline) {
    neden = `Son tarihi ${secilenGorev.deadline} olduğu için erken başlanmalı.`;
  } else if (secilenGorev.priority === 'critical') {
    neden = 'Kritik öncelikli olduğu için hemen ilgilenilmeli.';
  } else if (secilenGorev.priority === 'high') {
    neden = 'Yüksek öncelikli olduğu için erken tamamlanmalı.';
  } else if (secilenGorev.priority === 'medium') {
    neden = 'Sırası geldi, artık yapma zamanı!';
  } else {
    neden = 'Diğer görevlere göre daha acil.';
  }

  // Motivasyon cümleleri
  const motivasyonlar = [
    'Hadi başla, ilk adım en zoru! 🚀',
    'Bunu bitirince kendini çok iyi hissedeceksin! 💪',
    'Odaklan ve bitir, sonrasına bak! 🎯',
    'Az kaldı, yapabilirsin! ⚡',
    'Bugün yap, yarına bırakma! 🔥',
    'Başladığında yarısı bitti sayılır! 😄',
    'Küçük adımlar büyük sonuçlar doğurur! 🌟',
    'Şu an zor gelse de bitince değer! 💫',
    'Kendin için yap, gurur duyacaksın! 🏆',
    'Bir kahve al ve başla! ☕',
    'Erteleme modunu kapat, çalışma modunu aç! 💻',
    'Bu görevi bitiren sen misin? Evet sensin! 😎',
    'Haydi, sen yapabilirsin! 🙌',
    'Biraz ter biraz zafer! 💦',
    'Şimdi başlarsan akşam rahat edersin! 🌙',
  ];
  const motivasyon = motivasyonlar[Math.floor(Math.random() * motivasyonlar.length)];

  const oneri = `${secilenGorev.title} görevini önce tamamlamanı öneririm. ${neden} ${motivasyon}`;

  res.json({ suggestion: oneri });
});

module.exports = router;