import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface ExtractedLinkResult {
  title: string;
  sourceUrl: string;
  sourceType: "NEWS_ARTICLE" | "SOCIAL_MEDIA" | "YOUTUBE" | "RAW_TEXT";
  author?: string;
  cleanContent: string;
  summary: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, rawText } = body;

    // Skenario 1: Input berupa Salinan Teks Mentah (Caption / Transkrip)
    if (rawText && (!url || !url.trim())) {
      const trimmed = rawText.trim();
      const firstLine = trimmed.split("\n")[0] || "Teks Referensi Konten";
      return NextResponse.json({
        success: true,
        data: {
          title: firstLine.slice(0, 80),
          sourceUrl: "",
          sourceType: "RAW_TEXT",
          cleanContent: trimmed,
          summary: trimmed.slice(0, 300) + (trimmed.length > 300 ? "..." : ""),
        } as ExtractedLinkResult,
      });
    }

    if (!url || !url.trim()) {
      return NextResponse.json(
        { error: "Link URL atau salinan teks wajib disertakan." },
        { status: 400 }
      );
    }

    const targetUrl = url.trim();

    // Validasi URL
    try {
      new URL(targetUrl);
    } catch {
      return NextResponse.json(
        { error: "Format URL tidak valid. Pastikan diawali dengan https://" },
        { status: 400 }
      );
    }

    const urlLower = targetUrl.toLowerCase();

    // Skenario 2: Link YouTube / YouTube Shorts
    if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(
            targetUrl
          )}&format=json`,
          { next: { revalidate: 3600 } }
        );
        if (oembedRes.ok) {
          const ytData = await oembedRes.json();
          const cleanText = `Judul Video YouTube: ${ytData.title}\nKreator: ${ytData.author_name}\nURL: ${targetUrl}`;
          return NextResponse.json({
            success: true,
            data: {
              title: ytData.title || "Video YouTube Referensi",
              author: ytData.author_name,
              sourceUrl: targetUrl,
              sourceType: "YOUTUBE",
              cleanContent: cleanText,
              summary: cleanText,
            } as ExtractedLinkResult,
          });
        }
      } catch (err) {
        console.warn("[Extract Link] YouTube oEmbed failed:", err);
      }
    }

    // Skenario 3: Link TikTok
    if (urlLower.includes("tiktok.com")) {
      try {
        const oembedRes = await fetch(
          `https://www.tiktok.com/oembed?url=${encodeURIComponent(targetUrl)}`,
          { next: { revalidate: 3600 } }
        );
        if (oembedRes.ok) {
          const ttData = await oembedRes.json();
          const cleanText = `Caption / Judul TikTok: ${ttData.title}\nKreator: ${ttData.author_name}\nURL: ${targetUrl}`;
          return NextResponse.json({
            success: true,
            data: {
              title: ttData.title || "Video TikTok Referensi",
              author: ttData.author_name,
              sourceUrl: targetUrl,
              sourceType: "SOCIAL_MEDIA",
              cleanContent: cleanText,
              summary: cleanText,
            } as ExtractedLinkResult,
          });
        }
      } catch (err) {
        console.warn("[Extract Link] TikTok oEmbed failed:", err);
      }
    }

    // Skenario 4: Portal Berita Web (Detik, Kompas, Media Indonesia, BKN, dll.)
    // Menggunakan Jina Reader (r.jina.ai) yang menghasilkan teks bersih tanpa iklan
    let articleText = "";
    let articleTitle = "";

    try {
      const jinaEndpoint = `https://r.jina.ai/${targetUrl}`;
      const jinaRes = await fetch(jinaEndpoint, {
        headers: {
          Accept: "text/markdown",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        signal: AbortSignal.timeout(8000), // Timeout 8 detik
      });

      if (jinaRes.ok) {
        const rawMarkdown = await jinaRes.text();
        if (rawMarkdown && rawMarkdown.length > 50) {
          articleText = rawMarkdown;

          // Ekstrak baris judul pertama
          const titleMatch = rawMarkdown.match(/^Title:\s*(.+)$/m) ||
            rawMarkdown.match(/^#\s*(.+)$/m);
          if (titleMatch && titleMatch[1]) {
            articleTitle = titleMatch[1].trim();
          }
        }
      }
    } catch (err) {
      console.warn("[Extract Link] Jina reader timed out or failed:", err);
    }

    // Skenario 4B: Fallback Direct Fetch jika Jina tidak merespons
    if (!articleText) {
      try {
        const directRes = await fetch(targetUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(6000),
        });

        if (directRes.ok) {
          const html = await directRes.text();

          // Ekstrak tag title
          const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleTagMatch && titleTagMatch[1]) {
            articleTitle = titleTagMatch[1]
              .replace(/\s*[-|]\s*.*$/, "")
              .trim();
          }

          // Bersihkan HTML tag sederhana
          const cleaned = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
            .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
            .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          articleText = cleaned.slice(0, 3000);
        }
      } catch (err) {
        console.warn("[Extract Link] Direct fetch failed:", err);
      }
    }

    if (!articleText) {
      // Jika kedua metode gagal (misal situs butuh login khusus)
      return NextResponse.json({
        success: false,
        error:
          "Tidak dapat membaca isi link secara otomatis (situs membatasi akses bot). Silakan salin teks/caption berita secara manual.",
      });
    }

    const cleanTitle = articleTitle || "Berita Referensi Terkini";
    const cleanContentTruncated = articleText.slice(0, 4000);
    const summary = cleanContentTruncated.slice(0, 350) + "...";

    return NextResponse.json({
      success: true,
      data: {
        title: cleanTitle,
        sourceUrl: targetUrl,
        sourceType: "NEWS_ARTICLE",
        cleanContent: cleanContentTruncated,
        summary,
      } as ExtractedLinkResult,
    });
  } catch (err: any) {
    console.error("[Extract Link Error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Gagal memproses link referensi.",
      },
      { status: 500 }
    );
  }
}
