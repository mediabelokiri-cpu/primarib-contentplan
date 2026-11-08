import {
  AiProviderAdapter,
  UnifiedAiRequest,
  UnifiedAiResponse,
} from "../types";

export class MockFallbackAdapter implements AiProviderAdapter {
  providerCode = "FALLBACK_MOCK" as const;

  isAvailable(): boolean {
    return true; // Always available as emergency deterministic fallback
  }

  async generate(
    request: UnifiedAiRequest,
    modelCode = "primarib-hybrid-fallback"
  ): Promise<UnifiedAiResponse> {
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 450)); // realistic latency simulation

    const promptText = request.prompt || "";
    const promptLower = promptText.toLowerCase();
    const task = request.taskCode;

    // Extract target program specifically if mentioned
    const targetMatch = promptText.match(/Wilayah Target:\s*"([^"]+)"/i);
    const targetStr = (targetMatch ? targetMatch[1] : promptText).toLowerCase();

    const isPolri =
      targetStr.includes("polri") ||
      targetStr.includes("akpol") ||
      targetStr.includes("bintara");
    const isSekdin =
      targetStr.includes("sekdin") ||
      targetStr.includes("stan") ||
      targetStr.includes("ipdn") ||
      targetStr.includes("kedinasan");
    const isCpns = !isPolri && !isSekdin;

    // Extract keyword specifically if mentioned
    const keywordMatch = promptText.match(/Topik \/ Kata Kunci Khusus:\s*"([^"]+)"/i);
    const customKeyword = keywordMatch ? keywordMatch[1].trim() : "";

    let generatedOutput = "";

    if (task === "IDEA_GENERATION") {
      const progLabel = isPolri ? "Polri" : isSekdin ? "Sekolah Kedinasan" : "CPNS";
      const topic1 = customKeyword
        ? `${customKeyword}: Solusi Belajar Intensif Lolos Seleksi ${progLabel}`
        : isPolri
        ? "Strategi Menaklukkan Tes Kecermatan Angka Hilang Polri Tanpa Blank"
        : isSekdin
        ? "Peta Rasio Keketatan PKN STAN vs IPDN 2026: Mana Peluang Terbesarmu?"
        : "Bongkar Trik Cepat TIU Silogisme HOTS 20 Detik Langsung Ketemu Jawaban!";

      const topic2 = customKeyword
        ? `Keunggulan Program ${customKeyword} di Prima RIB Dibanding Belajar Mandiri`
        : isPolri
        ? "3 Kesalahan Fatal Saat Uji Kesamaptaan Jasmani yang Bikin Nilai Drop"
        : isSekdin
        ? "Syarat Nilai Rapor & Mata Minus Masuk Sekolah Kedinasan 2026"
        : "Cara Manajemen Waktu 100 Menit 110 Soal CAT BKN Tanpa Panik";

      const topic3 = customKeyword
        ? `Review Fasilitas Simulasi CAT & Mentor Ahli untuk ${customKeyword}`
        : isPolri
        ? "Bongkar Rahasia Penilaian Tes Psikologi Polri: Jangan Sampai Kena TMS"
        : isSekdin
        ? "Bocoran Materi Tes SKD Kedinasan: Passing Grade Tertinggi Tiap Instansi"
        : "Tips Tembus Skor SKD 450+ dengan Metode Eliminasi Fast-Think Prima RIB";

      const topic4 = customKeyword
        ? `Promo Spesial Terbatas: Diskon Kelas Intensif ${customKeyword} Minggu Ini`
        : isPolri
        ? "Kisah Sukses Siswa Prima RIB: Dari Nol Fisik Hingga Lolos Ranking 1 Bintara"
        : isSekdin
        ? "Bedah Format Soal TPA & TBI SPMB PKN STAN Versi Terbaru"
        : "5 Aturan Resmi BKN Seputar Ujian CAT yang Jarang Diketahui Peserta";

      if (request.responseFormat === "json") {
        generatedOutput = JSON.stringify(
          {
            ideas: [
              {
                title: topic1,
                hook: customKeyword
                  ? `Mau lolos ${progLabel} tapi bingung mulai dari mana? Simak info penting ini!`
                  : "Banyak yang gagal di tahap ini karena belum tahu pola rahasianya!",
                angle: "Edukatif & Solutif",
                format: "Reels Video",
                objective: "Engagement & Edukasi",
                cta: "Simpan video ini & share ke pejuang lainnya!",
                strategicReason: "Topik spesifik dengan minat pencarian dan interaksi tertinggi.",
                strategicReasoning:
                  "Topik ini memiliki tingkat pencarian tinggi menjelang pembukaan seleksi resmi.",
              },
              {
                title: topic2,
                hook: "Jangan sampai persiapan berbulan-bulan gugur gara-gara hal sepele ini!",
                angle: "Pencegahan Kesalahan (FOMO)",
                format: "Carousel 5 Slide",
                objective: "Simpan & Edukasi",
                cta: "Ketik 'MAU' di komentar untuk dapat panduan lengkapnya!",
                strategicReason: "Membangun rasa urgensi dan kebutuhan bimbingan intensif.",
                strategicReasoning: "Memanfaatkan psikologi pencegahan kegagalan calon pendaftar.",
              },
              {
                title: topic3,
                hook: "Ini alasan kenapa siswa Prima RIB jauh lebih tenang saat hari H ujian!",
                angle: "Social Proof & Fasilitas",
                format: "Reels Video",
                objective: "Brand Awareness",
                cta: "Kunjungi bio kami untuk booking jadwal simulasi gratis!",
                strategicReason: "Meningkatkan kredibilitas bimbel dan rasa percaya calon siswa.",
                strategicReasoning: "Meningkatkan kredibilitas bimbel dan rasa percaya calon siswa.",
              },
              {
                title: topic4,
                hook: "Siapa cepat dia dapat, kuota kelas intensif terbatas untuk angkatan ini!",
                angle: "Penawaran Khusus & Promo",
                format: "Single Post",
                objective: "Konversi Siswa Baru",
                cta: "Klik link di bio untuk klaim potongan harga spesial hari ini!",
                strategicReason: "Mendorong konversi langsung menjadi pendaftar bimbingan.",
                strategicReasoning: "Mendorong konversi langsung menjadi pendaftar bimbingan.",
              },
            ],
          },
          null,
          2
        );
      } else {
        generatedOutput = `💡 **Rekomendasi Ide Konten Prima RIB:**\n\n1. **${topic1}**\n- Hook: "Banyak yang gagal di tahap ini karena belum tahu pola rahasianya!"\n- Format: Reels Video 45s\n- CTA: "Simpan video ini & share ke sesama pejuang!"`;
      }
    } else if (task === "SCRIPT_WRITING" || task === "COPYWRITING") {
      const isCarousel = promptLower.includes("carousel") || promptLower.includes("karusel") || promptLower.includes("slide");
      const isSinglePost = promptLower.includes("single") || promptLower.includes("feed foto");

      if (request.responseFormat === "json") {
        if (isCarousel) {
          generatedOutput = JSON.stringify(
            {
              format: "CAROUSEL",
              title: isPolri
                ? "5 Kesalahan Fatal Saat Tes Fisik Samapta Polri"
                : isSekdin
                ? "Panduan Lolos Seleksi Administrasi Sekdin 2026"
                : "5 Jurus Anti Lemas Menghadapi Soal HOTS TKP CPNS",
              hook: "Slide 1: Hati-hati! 73% peserta gugur di tahap ini bukan karena kurang pintar, tapi salah strategi!",
              slides: [
                {
                  slide_number: 1,
                  slide_type: "COVER",
                  headline: "STOP Lakukan Ini Kalau Nggak Mau Gugur Administrasi!",
                  body: "Swipe ke kiri untuk cek 5 ceklis wajib sebelum submit dokumen resmi.",
                  visual_direction: "Foto mahasiswa berseragam kedinasan dengan overlay teks kontras Navy #284078 & Gold #DDB02E",
                },
                {
                  slide_number: 2,
                  slide_type: "CONTENT",
                  headline: "1. Sinkronisasi NIK Dukcapil",
                  body: "Pastikan data di KTP & Kartu Keluarga 100% sinkron di database pusat. Selisih 1 huruf di nama bisa otomatis ditolak sistem SSCASN.",
                  visual_direction: "Ilustrasi KTP dengan checklist hijau dan icon warning merah.",
                },
                {
                  slide_number: 3,
                  slide_type: "CONTENT",
                  headline: "2. Akreditasi Kampus/Sekolah Sesuai Tahun Kelulusan",
                  body: "Gunakan surat ketetapan BAN-PT atau Kemdikbud saat tahun kamu lulus, bukan akreditasi terbaru saat ini.",
                  visual_direction: "Screenshot dokumen sertifikat akreditasi berstempel resmi.",
                },
                {
                  slide_number: 4,
                  slide_type: "CONTENT",
                  headline: "3. Format Surat Pernyataan Bebas Narkoba & Tato",
                  body: "Perhatikan format materai 10.000 dan tanda tangan basah vs e-meterai sesuai arahan instansi yang dilamar.",
                  visual_direction: "Infografis letak penempelan e-meterai yang benar agar tidak tumpang tindih.",
                },
                {
                  slide_number: 5,
                  slide_type: "CTA",
                  headline: "Mau Dicek Berkas & Konsultasi Gratis?",
                  body: "Bimbel Prima RIB sediakan pendampingan berkas 1-on-1 sampai tuntas. Simpan carousel ini & klik link di bio!",
                  visual_direction: "Foto Lab CAT Prima RIB dengan tombol CTA emas 'Konsultasi Sekarang'.",
                },
              ],
              caption:
                "Jangan biarkan kerja keras berbulan-bulan gugur hanya karena salah upload berkas! 📁\n\nSimpan carousel ini buat ceklis sebelum submit portal SSCASN. Ada pertanyaan seputar akreditasi atau formasi? Tulis di komen ya Sobat Prima! 💬\n\n#PrimaRIB #BimbelKedinasan #BimbelCPNS #PersiapanTes2026",
              cta: "Simpan & share ke grup pejuang tes! Butuh bimbingan intensif? Hubungi admin via link bio.",
              hashtags: "#PrimaRIB #InfoCPNS2026 #SekolahKedinasan #BimbelPolri #PejuangNIP",
            },
            null,
            2
          );
        } else if (isSinglePost) {
          generatedOutput = JSON.stringify(
            {
              format: "SINGLE_POST",
              title: isPolri
                ? "Jadwal Lengkap Seleksi Penerimaan Polri TA 2026"
                : isSekdin
                ? "Pilihan Sekolah Kedinasan Favorit Bebas Biaya Kuliah"
                : "Strategi Target Skor SKD CPNS 2026 Aman Lolos Perankingan",
              hook: "Skor SKD tinggi belum tentu aman kalau formasi pilihanmu diperebutkan ribuan master!",
              body:
                "Banyak peserta puas saat nilainya tembus passing grade. Padahal, sistem hanya mengambil 3x jumlah formasi untuk lanjut ke tahap SKB!\n\nUntuk formasi pusat, target aman SKD bukan cuma 350, tapi minimal 410+. Di Prima RIB, kamu dilatih simulasi CAT berstandar BKN dengan sistem perangkingan nasional real-time, jadi kamu selalu tahu posisi kompetitormu sebelum hari H ujian.",
              caption:
                "Bukan cuma lolos passing grade, target kita adalah mendominasi 3 besar formasi! 🎯\n\nSiapkan mental dan kuasai strategi perankingan bersama mentor ahli Prima RIB. Komen 'MAU' buat dapat info kelas tryout akbar gratis! 👇\n\n#PrimaRIB #BimbelCPNS #PersiapanSKD #PejuangNIP2026",
              cta: "Ketik 'MAU' di kolom komentar atau amankan kursi kelas bimbingan via link di bio!",
              hashtags: "#PrimaRIB #BimbelCPNS #TesSKD #SimulasiCAT #InfoBKN",
              visual_direction: "Desain poster feed elegan dengan foto mentor memegang grafik skor SKD, berlatar belakang Lab CAT modern bernuansa Navy & Gold.",
            },
            null,
            2
          );
        } else {
          // Reels / Video format default
          generatedOutput = JSON.stringify(
            {
              format: "REELS",
              title: isPolri
                ? "Trik Psikotes Kecermatan Angka Hilang Polri"
                : isSekdin
                ? "Tips Lolos SKD Kedinasan Skor 450+"
                : "Rahasia Hitung Cepat TIU Pecahan CPNS",
              hook: "Stop buang-buang waktu hitung cara manual kalau mau selesai sebelum waktu CAT habis!",
              scenes: [
                {
                  timecode: "00:00 - 00:05",
                  visual: "Talent mentor berdiri percaya diri di depan layar Lab CAT Prima RIB",
                  audio: "Stop hitung pecahan pakai cara manual kalau mau selesai sebelum waktu CAT habis!",
                  text_on_screen: "TRIK HITUNG CEPAT TIU 15 DETIK!",
                },
                {
                  timecode: "00:05 - 00:20",
                  visual: "Kamera zoom in ke tablet memperlihatkan soal pecahan HOTS rumit",
                  audio: "Di ujian asli kamu cuma punya 50 detik per soal. Kalau kamu samakan penyebut satu-satu, waktu kamu pasti habis di 5 soal pertama!",
                  text_on_screen: "JANGAN SAMAKAN PENYEBUT!",
                },
                {
                  timecode: "00:20 - 00:45",
                  visual: "Talent mencoret angka dengan metode eliminasi selisih Prima RIB",
                  audio: "Pakai metode Fast-Think Prima RIB: Cukup lihat selisih pembilang dan penyebut. Opsi A sampai E langsung kelihatan jawabannya dalam 15 detik!",
                  text_on_screen: "METODE FAST-THINK PRIMA RIB",
                },
                {
                  timecode: "00:45 - 00:60",
                  visual: "Talent tersenyum sambil memegang modul resmi & Lab CAT di belakangnya",
                  audio: "Mau trik lengkap 50 materi lainnya? Gabung kelas intensif Prima RIB sekarang. Klik link di bio!",
                  text_on_screen: "GABUNG KELAS INTENSIF SEKARANG 👉 LINK DI BIO",
                },
              ],
              caption:
                "Bukan soal seberapa jago matematika, tapi seberapa cepat kamu nemu pola eliminasi! 🚀\n\nSimpan video ini buat latihan malam ini ya Sobat Prima. Tag teman seperjuanganmu di kolom komentar! 👇\n\n#PrimaRIB #BimbelCPNS #BimbelKedinasan #BimbelPolri #PejuangNIP",
              cta: "Daftar kelas intensif Prima RIB & kuasai ribuan trik cepat!",
              hashtags: "#PrimaRIB #BimbelCPNS #BimbelKedinasan #BimbelPolri #PejuangNIP",
            },
            null,
            2
          );
        }
      } else {
        generatedOutput = `🎬 **Naskah Video Reels Prima RIB**\n\n**HOOK (0-5s):**\n"Stop buang-buang waktu hitung cara manual kalau mau selesai tepat waktu di CAT!"\n\n**ISI TRIK (5-45s):**\nJelaskan rumus kilat eliminasi jawaban menggunakan papan tulis Lab CAT Prima RIB.\n\n**CTA (45-60s):**\n"Mau kuasai trik lengkap lainnya? Gabung bimbingan intensif Prima RIB sekarang!"`;
      }
    } else if (task === "QUALITY_CHECK") {
      generatedOutput = JSON.stringify(
        {
          overallScore: 92,
          brandConsistencyScore: 95,
          audienceRelevanceScore: 90,
          copywritingScore: 92,
          factualAccuracyStatus: "VERIFIED",
          strengths: [
            "Tone of voice semi-formal dan sarat semangat pejuang berhasil diterapkan.",
            "Struktur hook 3 detik awal sangat kuat dan relevan dengan format video/karusel.",
            "Sesuai dengan ketentuan tidak memuat klaim garansi kelulusan palsu.",
          ],
          issues: [],
          recommendations: [
            "Tambahkan instruksi teks pop-up layar pada detik ke-15 untuk mempertegas angka rumus.",
          ],
        },
        null,
        2
      );
    } else if (task === "CREATIVE_BRIEF") {
      generatedOutput = JSON.stringify(
        {
          visual_concept:
            "Modern, aspiratif, dan edukatif dengan visualisasi Lab CAT Prima RIB",
          color_palette: ["#284078", "#DDB02E", "#6D4AFF", "#FFFFFF"],
          typography_guidelines:
            "Headline: Montserrat / Plus Jakarta Sans Bold. Body: Inter / Roboto Regular.",
          asset_requirements: [
            "Foto mentor berjas atau kemeja rapi Prima RIB",
            "Screen capture antarmuka simulasi Lab CAT berstandar BKN",
            "Ikon checklist emas & badge resmi Prima RIB",
          ],
          layout_directions:
            "Fokus 1 ide per frame dengan hierarki visual jelas, perhatikan safe area 15% dari tepi atas & bawah.",
          dos_and_donts: {
            dos: [
              "Gunakan warna Navy #284078 sebagai background utama atau framing",
              "Highlight angka skor & poin penting dengan aksen Gold #DDB02E",
              "Sertakan logo Prima RIB di sudut kanan atas",
            ],
            donts: [
              "Jangan gunakan aset grafis beresolusi rendah atau pecah",
              "Hindari klaim bombastis 'Jaminan 100% Pasti Lolos Tanpa Tes'",
              "Jangan menumpuk teks lebih dari 4 baris per slide",
            ],
          },
        },
        null,
        2
      );
    } else {
      generatedOutput = `Hasil analisis AI Prima RIB berhasil disusun berdasarkan Brand Knowledge resmi.`;
    }

    const durationMs = Date.now() - startTime;
    return {
      content: generatedOutput,
      providerCode: "FALLBACK_MOCK",
      modelCode,
      inputTokens: 320,
      outputTokens: 480,
      durationMs,
      estimatedCostUsd: 0.0,
      fallbackUsed: true,
      status: "FALLBACK",
    };
  }
}
