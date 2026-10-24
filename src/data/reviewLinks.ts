/** Every screen and case, for the #review hub. Each token is also a deep link (#token). */
export const REVIEW_GROUPS: { title: string; links: { token: string; label: string; note: string }[] }[] = [
  {
    title: "Pra-acara",
    links: [
      { token: "rsvp", label: "RSVP", note: "Ya / Tidak bisa hadir (dengan konfirmasi)" },
      { token: "terima-kasih", label: "Terima kasih", note: "Setelah pilih Tidak, bisa ganti jadi hadir" },
      { token: "countdown", label: "Countdown", note: "Hitung mundur + batal hadir" },
      { token: "test-day", label: "RSVP saat Test Day", note: "Countdown mati: Ya langsung ke Mulai" },
      { token: "mulai", label: "Mulai (hari H)", note: "Mulai masuk Potara" },
    ],
  },
  {
    title: "Masuk ke Potara",
    links: [
      { token: "check-in", label: "Check-in berhasil", note: "QR terbaca otomatis (simulasi)" },
      { token: "check-in-qr-salah", label: "QR salah", note: "Bukan QR pintu Potara" },
      { token: "check-in-kamera", label: "Kamera ditolak", note: "Pakai kode pintu (1108) / panitia" },
      { token: "check-in-offline", label: "Check-in offline", note: "Tidak ada koneksi" },
      { token: "pintu", label: "Pintu keycard", note: "Animasi pintu terbuka" },
      { token: "narasi", label: "Narasi", note: "4 slide, tap / lewati" },
      { token: "karakter", label: "Buat karakter", note: "Baju, celana, aksesoris (placeholder)" },
    ],
  },
  {
    title: "Ruangan (main area)",
    links: [
      { token: "ruangan", label: "Pertama masuk", note: "Tamu pertama → ada yang hadir → pindah ruangan" },
      { token: "ruangan-ramai", label: "Ramai", note: "Beberapa tamu hadir + 12 orang hadir" },
      { token: "ruangan-segera", label: "Acara segera mulai", note: "Notifikasi 5 menit lagi" },
      { token: "ruangan-jeda", label: "Jeda antar sesi", note: "Agenda: berikutnya dalam X menit" },
      { token: "ruangan-berubah", label: "Rundown berubah", note: "Notifikasi perubahan jadwal" },
      { token: "ruangan-hadiah", label: "Pengingat hadiah", note: "5 kartu, hadiah belum ditukar" },
      { token: "ruangan-selesai", label: "Acara selesai", note: "Feedback terbuka" },
      { token: "ruangan-offline", label: "Offline", note: "Banner offline" },
    ],
  },
  {
    title: "Agenda",
    links: [
      { token: "agenda", label: "Timeline", note: "Kolom jam, durasi, garis sekarang" },
      { token: "agenda-berubah", label: "Ada perubahan", note: "Tag Diubah" },
      { token: "agenda-selesai", label: "Semua selesai", note: "Ajakan isi feedback" },
    ],
  },
  {
    title: "Feedback per acara",
    links: [
      { token: "feedback-acara", label: "Feedback Talkshow", note: "Wajib setelah acara selesai, lalu notifikasi pindah ruangan" },
      { token: "feedback-acara-gagal", label: "Gagal terkirim", note: "Offline saat kirim" },
    ],
  },
  {
    title: "Tanya pembicara",
    links: [
      { token: "tanya", label: "Tanya pembicara", note: "Kirim (bisa anonim), edit / batal kirim, status, pertanyaan tamu lain" },
      { token: "tanya-kosong", label: "Belum ada pertanyaan", note: "Empty state" },
      { token: "tanya-ditutup", label: "Sesi ditutup MC", note: "Tidak bisa kirim lagi" },
      { token: "tanya-gagal", label: "Gagal terkirim", note: "Offline saat kirim" },
      { token: "tanya-keburu-dibaca", label: "Edit keburu dibaca", note: "Edit pertanyaanmu → MC sudah membacanya" },
    ],
  },
  {
    title: "Kenalan",
    links: [
      { token: "kenalan", label: "Grid tamu", note: "3/5 kartu" },
      { token: "kenalan-kosong", label: "Belum ada tamu", note: "Empty state" },
      { token: "kenalan-kartu", label: "Kartu pertanyaan", note: "Tanya → scan QR (kode Nanda: 1357)" },
      { token: "kenalan-qr", label: "QR-ku", note: "QR + kode untuk discan tamu lain" },
      { token: "kenalan-hampir", label: "4/5 kartu", note: "Simpan 1 kartu lagi → popup hadiah" },
      { token: "kenalan-hadiah", label: "Hadiah menunggu", note: "Tukar nanti" },
      { token: "voucher", label: "Voucher", note: "PIN panitia: 2026" },
      { token: "kenalan-selesai", label: "Hadiah sudah diambil", note: "Status akhir" },
    ],
  },
  {
    title: "Feedback",
    links: [
      { token: "feedback", label: "Form feedback", note: "Rating, kesan, pesan" },
      { token: "memory-card", label: "Memory card", note: "Bagikan ke Instagram" },
    ],
  },
  {
    title: "Sistem",
    links: [
      { token: "memuat", label: "Memuat", note: "Loading" },
      { token: "error", label: "Error", note: "Coba lagi" },
      { token: "offline", label: "Offline penuh", note: "Koneksi terputus" },
    ],
  },
];
