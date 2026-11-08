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

    // Ekstraksi target program secara presisi (hindari false positive dari deskripsi brand)
    let isPolri = false;
    let isSekdin = false;
    let isCpns = true;

    const progLineMatch = promptText.match(
      /(?:Wilayah Target|Wilayah Seleksi|Program)\s*(?:Konten|Seleksi)?\s*:\s*["']?([^\n"\r,]+)/i
    );
    const progText = progLineMatch ? progLineMatch[1].toLowerCase() : "";

    if (
      progText.includes("polri") ||
      progText.includes("akpol") ||
      progText.includes("bintara")
    ) {
      isPolri = true;
      isCpns = false;
    } else if (
      progText.includes("sekdin") ||
      progText.includes("stan") ||
      progText.includes("ipdn") ||
      progText.includes("kedinasan")
    ) {
      isSekdin = true;
      isCpns = false;
    } else {
      isCpns = true;
    }

    const progLabel = isPolri
      ? "Polri"
      : isSekdin
      ? "Sekolah Kedinasan"
      : "CPNS";
    const progTag = isPolri
      ? "BimbelPolri"
      : isSekdin
      ? "BimbelKedinasan"
      : "BimbelCPNS";

    // Ekstraksi format konten secara tegas (REELS vs CAROUSEL vs SINGLE_POST)
    let selectedFormat: "REELS" | "CAROUSEL" | "SINGLE_POST" = "REELS";
    const formatLineMatch = promptText.match(
      /(?:Format Konten yang Diminta|Format Konten yang diinginkan|Format yang diinginkan|formatType|Format Konten)\s*:\s*["']?([A-Za-z_]+)/i
    );

    if (formatLineMatch) {
      const fmt = formatLineMatch[1].toUpperCase();
      if (fmt.includes("CAROUSEL") || fmt.includes("KARUSEL")) {
        selectedFormat = "CAROUSEL";
      } else if (fmt.includes("SINGLE")) {
        selectedFormat = "SINGLE_POST";
      } else {
        selectedFormat = "REELS";
      }
    } else {
      if (
        promptLower.includes('"formattype": "carousel"') ||
        promptLower.includes('"format": "carousel"')
      ) {
        selectedFormat = "CAROUSEL";
      } else if (
        promptLower.includes('"formattype": "single_post"') ||
        promptLower.includes('"format": "single_post"')
      ) {
        selectedFormat = "SINGLE_POST";
      } else {
        selectedFormat = "REELS";
      }
    }

    // Extract keyword specifically if mentioned
    const keywordMatch = promptText.match(/Topik \/ Kata Kunci Khusus:\s*"([^"]+)"/i);
    const customKeyword = keywordMatch ? keywordMatch[1].trim() : "";

    let generatedOutput = "";

    if (task === "IDEA_GENERATION") {
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
    } else if (task === "NEWS_REPURPOSE") {
      // Ekstraksi data spesifik dari News Repurposer Prompt
      const srcMatch = promptText.match(/(?:Judul Asli|Judul Berita|Sumber):\s*"([^"]+)"/i);
      const rawTitle = srcMatch ? srcMatch[1].trim() : "";
      const cleanNewsTitle = rawTitle
        ? rawTitle.replace(/\s*\|.+$/i, "").replace(/\s*[-–].+$/i, "").trim()
        : `Update Pendaftaran ${progLabel} 2026`;

      const contentMatch = promptText.match(/Isi Referensi:\s*"""([\s\S]*?)"""/i);
      const snippet = contentMatch ? contentMatch[1].trim().slice(0, 300) : "";

      const finalTitle = `${cleanNewsTitle}: Info Resmi & Strategi Lolos ${progLabel}`;

      if (selectedFormat === "REELS") {
        generatedOutput = JSON.stringify(
          {
            title: finalTitle,
            hook: `Pemerintah baru saja rilis update resmi seleksi ${progLabel}! Ini 3 poin krusial yang wajib kamu catat!`,
            formatType: "REELS",
            format: "REELS",
            scenes: [
              {
                timecode: "00:00 - 00:05",
                visual_direction:
                  "Talent mentor berdiri di depan layar Lab CAT Prima RIB dengan gestur tegas",
                audio_dialogue: `Pejuang ${progLabel}, ada update resmi terbaru yang baru saja keluar. Jangan sampai salah langkah di persiapan awal!`,
                text_on_screen: `UPDATE RESMI SELEKSI ${progLabel.toUpperCase()}`,
              },
              {
                timecode: "00:05 - 00:25",
                visual_direction:
                  "Layar berganti menampilkan kutipan poin penting regulasi berita",
                audio_dialogue: snippet
                  ? `Berdasarkan rilis resmi: ${snippet.slice(0, 150)}... Pahami baik-baik agar berkasmu tidak TMS.`
                  : `Pemerintah menegaskan beberapa poin penting seputar mekanisme pendaftaran dan kuota formasi tahun ini.`,
                text_on_screen: "POIN PENTING REGULASI",
              },
              {
                timecode: "00:25 - 00:45",
                visual_direction:
                  "Talent mendemonstrasikan metode Fast-Think dan simulasi Lab CAT Prima RIB",
                audio_dialogue: `Biar nggak kaget saat ujian CAT sesungguhnya, biasakan latihan dengan sistem CAT standar BKN dan metode Fast-Think di Prima RIB. Manajemen waktu adalah kunci lolos perankingan!`,
                text_on_screen: "SIMULASI SISTEM CAT BKN",
              },
              {
                timecode: "00:45 - 00:60",
                visual_direction:
                  "Talent tersenyum, banner CTA bimbel dan link bio muncul",
                audio_dialogue: `Mau tau peluang formasimu dan persiapan terbaiknya? Konsultasikan sekarang bersama mentor Prima RIB, klik link di bio!`,
                text_on_screen: "KONSULTASI GRATIS 👉 LINK DI BIO",
              },
            ],
            caption: `Jangan sampai kerja keras berbulan-bulan gugur hanya karena kurang update regulasi resmi! 📢\n\nSimpan video ini buat bekal persiapan seleksi ${progLabel}. Punya pertanyaan seputar formasi atau syarat tes? Tulis di kolom komentar ya Sobat Prima! 👇\n\n#PrimaRIB #${progTag} #PejuangNIP #PersiapanSeleksi2026`,
            cta: "Simpan & share video ini ke rekan seperjuangan! Hubungi admin via link bio untuk bimbingan intensif.",
            hashtags: `#PrimaRIB #${progTag} #Info${progLabel.replace(/\s+/g, "")}2026 #SimulasiCAT`,
          },
          null,
          2
        );
      } else if (selectedFormat === "CAROUSEL") {
        generatedOutput = JSON.stringify(
          {
            title: finalTitle,
            hook: `Slide 1: Catat baik-baik! Update penting pendaftaran ${progLabel} 2026 yang wajib kamu tahu!`,
            formatType: "CAROUSEL",
            format: "CAROUSEL",
            slides: [
              {
                slide_number: 1,
                slide_type: "COVER",
                headline: `Update Resmi Seleksi ${progLabel} 2026!`,
                body: "Swipe ke kiri untuk cek rangkuman regulasi dan strategi persiapannya 👉",
                visual_direction:
                  "Headline kontras Solid Navy & Gold, foto siswa bimbel profesional",
              },
              {
                slide_number: 2,
                slide_type: "CONTENT",
                headline: "1. Regulasi & Mekanisme Pendaftaran",
                body: snippet
                  ? snippet.slice(0, 160)
                  : `Informasi teknis dan alur pendaftaran ${progLabel} resmi diumumkan panitia seleksi nasional.`,
                visual_direction: "Infografis ringkas dengan checklist poin penting",
              },
              {
                slide_number: 3,
                slide_type: "CONTENT",
                headline: "2. Kesalahan Krusial yang Sering Terjadi",
                body: "Banyak peserta gugur di verifikasi berkas dan manajemen waktu CAT. Pastikan dokumen dan persiapan belajarmu sesuai standar.",
                visual_direction: "Ikon peringatan dan tips eliminasi kesalahan",
              },
              {
                slide_number: 4,
                slide_type: "CONTENT",
                headline: "3. Solusi Terarah di Prima RIB",
                body: "Latihan intensif dengan ribuan bank soal akurat, fasilitas Lab CAT mirip BKN, dan metode Fast-Think pemangkas waktu.",
                visual_direction: "Foto fasilitas Lab Simulasi CAT Prima RIB",
              },
              {
                slide_number: 5,
                slide_type: "CTA",
                headline: "Amankan Kursimu dari Sekarang!",
                body: "Konsultasikan formasi impianmu bersama mentor ahli Prima RIB. Klik link di bio kami!",
                visual_direction: "Tombol CTA kontras dengan kontak admin resmi",
              },
            ],
            caption: `Simpan carousel ini buat ceklis sebelum pendaftaran resmi dibuka! 📁\n\nPersiapan matang sejak dini membedakan kamu dari ribuan kompetitor lainnya. Mau konsultasi formasi gratis? Tulis 'MAU' di kolom komentar ya Sobat Prima! 💬\n\n#PrimaRIB #${progTag} #PejuangNIP #InfoSeleksi`,
            cta: "Ketik 'MAU' di kolom komentar atau amankan kursi kelas bimbingan via link di bio!",
            hashtags: `#PrimaRIB #${progTag} #Persiapan${progLabel.replace(/\s+/g, "")} #SimulasiCAT`,
          },
          null,
          2
        );
      } else {
        // SINGLE_POST
        generatedOutput = JSON.stringify(
          {
            title: finalTitle,
            hook: `Rilis resmi seleksi ${progLabel}: Ini kabar penting yang harus kamu tahu!`,
            formatType: "SINGLE_POST",
            format: "SINGLE_POST",
            single_post_body: `${finalTitle}\n\n${snippet || "Pemerintah dan panitia seleksi resmi mengumumkan pembaruan terkait tata cara dan jadwal seleksi."}\n\nKunci kelulusan bukan sekadar belajar keras, tetapi belajar cerdas dengan sistem terstruktur. Di Bimbel Prima RIB, kamu dibimbing langsung oleh mentor berpengalaman dengan fasilitas simulasi CAT berstandar BKN.\n\nAmankan posisimu sejak awal!`,
            caption: `Update penting untuk seluruh pejuang ${progLabel}! 📢\n\nPastikan kamu selalu mendapatkan informasi resmi dan terverifikasi. Konsultasikan persiapanmu bersama Bimbel Prima RIB sekarang juga.\n\n#PrimaRIB #${progTag} #InfoSeleksi`,
            cta: "Klik link di bio untuk pendaftaran kelas bimbingan intensif!",
            hashtags: `#PrimaRIB #${progTag} #Info${progLabel.replace(/\s+/g, "")}`,
          },
          null,
          2
        );
      }
    } else if (task === "SCRIPT_WRITING" || task === "COPYWRITING") {
      const titleMatch = promptText.match(/(?:Topik\/Judul|Judul|Topik):\s*"([^"]+)"/i);
      const reqTitle = titleMatch ? titleMatch[1].trim() : `Strategi Lolos Seleksi ${progLabel}`;

      if (request.responseFormat === "json") {
        if (selectedFormat === "CAROUSEL") {
          generatedOutput = JSON.stringify(
            {
              format: "CAROUSEL",
              formatType: "CAROUSEL",
              title: reqTitle,
              hook: "Slide 1: Hati-hati! 73% peserta gugur di tahap ini bukan karena kurang pintar, tapi salah strategi!",
              slides: [
                {
                  slide_number: 1,
                  slide_type: "COVER",
                  headline: reqTitle,
                  body: "Swipe ke kiri untuk cek 5 ceklis wajib sebelum submit dokumen resmi.",
                  visual_direction: `Foto siswa bimbel profesional berlatar Lab CAT Prima RIB dengan teks kontras Solid Navy & Gold`,
                },
                {
                  slide_number: 2,
                  slide_type: "CONTENT",
                  headline: "1. Sinkronisasi Data Database Pusat",
                  body: "Pastikan data di KTP & Kartu Keluarga 100% sinkron. Selisih 1 huruf bisa otomatis ditolak sistem verifikasi berkas.",
                  visual_direction: "Ilustrasi KTP dengan checklist hijau dan icon warning merah.",
                },
                {
                  slide_number: 3,
                  slide_type: "CONTENT",
                  headline: "2. Akreditasi Sesuai Tahun Kelulusan",
                  body: "Gunakan surat ketetapan BAN-PT atau Kemdikbud saat tahun kelulusanmu, bukan akreditasi terbaru saat ini.",
                  visual_direction: "Screenshot dokumen sertifikat akreditasi berstempel resmi.",
                },
                {
                  slide_number: 4,
                  slide_type: "CONTENT",
                  headline: "3. Format Surat & Berkas Wajib",
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
                `Jangan biarkan kerja keras berbulan-bulan gugur hanya karena salah upload berkas! 📁\n\nSimpan carousel ini buat ceklis sebelum submit portal pendaftaran. Ada pertanyaan seputar formasi ${progLabel}? Tulis di komen ya Sobat Prima! 💬\n\n#PrimaRIB #${progTag} #PersiapanTes2026`,
              cta: "Simpan & share ke grup pejuang tes! Butuh bimbingan intensif? Hubungi admin via link bio.",
              hashtags: `#PrimaRIB #Info${progLabel.replace(/\s+/g, "")}2026 #${progTag} #PejuangNIP`,
            },
            null,
            2
          );
        } else if (selectedFormat === "SINGLE_POST") {
          generatedOutput = JSON.stringify(
            {
              format: "SINGLE_POST",
              formatType: "SINGLE_POST",
              title: reqTitle,
              hook: `Skor tes tinggi belum tentu aman kalau formasi pilihanmu diperebutkan ribuan pesaing!`,
              body:
                `Banyak peserta puas saat nilainya tembus passing grade. Padahal, sistem hanya mengambil kuota terbaik untuk lanjut ke tahap berikutnya!\n\nDi Prima RIB, kamu dilatih simulasi CAT berstandar BKN dengan sistem perangkingan nasional real-time, jadi kamu selalu tahu posisi kompetitormu sebelum hari H ujian.`,
              single_post_body: `${reqTitle}\n\nBanyak peserta puas saat nilainya tembus passing grade. Padahal, sistem hanya mengambil kuota terbaik untuk lanjut ke tahap berikutnya!\n\nDi Prima RIB, kamu dilatih simulasi CAT berstandar BKN dengan sistem perangkingan nasional real-time, jadi kamu selalu tahu posisi kompetitormu sebelum hari H ujian.`,
              caption:
                `Bukan cuma lolos passing grade, target kita adalah mendominasi peringkat atas formasi! 🎯\n\nSiapkan mental dan kuasai strategi perankingan bersama mentor ahli Prima RIB. Komen 'MAU' buat dapat info kelas tryout akbar gratis! 👇\n\n#PrimaRIB #${progTag} #PersiapanTes #PejuangNIP2026`,
              cta: "Ketik 'MAU' di kolom komentar atau amankan kursi kelas bimbingan via link di bio!",
              hashtags: `#PrimaRIB #${progTag} #TesSKD #SimulasiCAT #InfoBKN`,
              visual_direction: "Desain poster feed elegan dengan foto mentor memegang grafik skor, berlatar belakang Lab CAT modern bernuansa Navy & Gold.",
            },
            null,
            2
          );
        } else {
          // Reels / Video format default
          generatedOutput = JSON.stringify(
            {
              format: "REELS",
              formatType: "REELS",
              title: reqTitle,
              hook: "Stop buang-buang waktu hitung cara manual kalau mau selesai sebelum waktu CAT habis!",
              scenes: [
                {
                  timecode: "00:00 - 00:05",
                  visual: "Talent mentor berdiri percaya diri di depan layar Lab CAT Prima RIB",
                  visual_direction: "Talent mentor berdiri percaya diri di depan layar Lab CAT Prima RIB",
                  audio: "Stop hitung cara manual kalau mau selesai sebelum waktu CAT habis!",
                  audio_dialogue: "Stop hitung cara manual kalau mau selesai sebelum waktu CAT habis!",
                  text_on_screen: "TRIK HITUNG CEPAT 15 DETIK!",
                },
                {
                  timecode: "00:05 - 00:20",
                  visual: "Kamera zoom in ke tablet memperlihatkan tipe soal HOTS",
                  visual_direction: "Kamera zoom in ke tablet memperlihatkan tipe soal HOTS",
                  audio: "Di ujian asli kamu cuma punya waktu sangat singkat per soal. Kalau kamu kerjakan satu-satu dengan rumus panjang, waktumu pasti habis sebelum tuntas!",
                  audio_dialogue: "Di ujian asli kamu cuma punya waktu sangat singkat per soal. Kalau kamu kerjakan satu-satu dengan rumus panjang, waktumu pasti habis sebelum tuntas!",
                  text_on_screen: "JANGAN PAKAI CARA LAMA!",
                },
                {
                  timecode: "00:20 - 00:45",
                  visual: "Talent mencoret angka dengan metode eliminasi selisih Fast-Think Prima RIB",
                  visual_direction: "Talent mencoret angka dengan metode eliminasi selisih Fast-Think Prima RIB",
                  audio: "Gunakan metode Fast-Think Prima RIB: cari pola kunci dan eliminasi opsi yang tidak mungkin. Jawaban langsung ketemu dalam 15 detik tanpa hitungan rumit!",
                  audio_dialogue: "Gunakan metode Fast-Think Prima RIB: cari pola kunci dan eliminasi opsi yang tidak mungkin. Jawaban langsung ketemu dalam 15 detik tanpa hitungan rumit!",
                  text_on_screen: "METODE FAST-THINK PRIMA RIB",
                },
                {
                  timecode: "00:45 - 00:60",
                  visual: "Talent tersenyum sambil memegang modul resmi & Lab CAT di belakangnya",
                  visual_direction: "Talent tersenyum sambil memegang modul resmi & Lab CAT di belakangnya",
                  audio: `Mau kuasai ribuan trik pengerjaan cepat materi ${progLabel} lainnya? Gabung kelas intensif Prima RIB sekarang. Klik link di bio!`,
                  audio_dialogue: `Mau kuasai ribuan trik pengerjaan cepat materi ${progLabel} lainnya? Gabung kelas intensif Prima RIB sekarang. Klik link di bio!`,
                  text_on_screen: "GABUNG KELAS INTENSIF SEKARANG 👉 LINK DI BIO",
                },
              ],
              caption:
                `Bukan soal seberapa jago menghafal, tapi seberapa cepat kamu nemu pola eliminasi! 🚀\n\nSimpan video ini buat latihan malam ini ya Sobat Prima. Tag teman seperjuanganmu di kolom komentar! 👇\n\n#PrimaRIB #${progTag} #PejuangNIP`,
              cta: "Daftar kelas intensif Prima RIB & kuasai ribuan trik cepat!",
              hashtags: `#PrimaRIB #${progTag} #PejuangNIP #SimulasiCAT`,
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
