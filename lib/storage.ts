import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { AssetType } from "@/types/database";

/**
 * Generates standardized storage path as defined in Database Spec Section 20:
 * content-assets/PR-2026-0001/design/filename.ext
 */
export function buildStorageFilePath(
  contentCode: string,
  assetType: AssetType,
  fileName: string
): string {
  const cleanFileName = fileName.replace(/\s+/g, "_");
  const folder = assetType.toLowerCase();
  return `content-assets/${contentCode}/${folder}/${cleanFileName}`;
}

/**
 * Uploads a File to Supabase Storage bucket `content-assets` when Supabase is connected,
 * or creates a local preview URL during localhost development mode.
 */
export async function uploadContentAssetFile(params: {
  contentCode: string;
  assetType: AssetType;
  file: File;
}): Promise<{ filePath: string; fileUrl: string }> {
  const filePath = buildStorageFilePath(
    params.contentCode,
    params.assetType,
    params.file.name
  );

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const storageKey = filePath.replace(/^content-assets\//, "");
    const { error } = await supabase.storage
      .from("content-assets")
      .upload(storageKey, params.file, { upsert: true });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage
      .from("content-assets")
      .getPublicUrl(storageKey);

    return {
      filePath,
      fileUrl: data.publicUrl,
    };
  }

  // Localhost mode: convert small images to data URL or object URL for instant preview
  if (params.file.type.startsWith("image/") && params.file.size <= 2_500_000) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Gagal membaca file lokal"));
      reader.readAsDataURL(params.file);
    });
    return { filePath, fileUrl: dataUrl };
  }

  if (typeof window !== "undefined" && typeof URL.createObjectURL === "function") {
    return {
      filePath,
      fileUrl: URL.createObjectURL(params.file),
    };
  }

  return {
    filePath,
    fileUrl: `https://placehold.co/1080x1080/284078/DDB02E?text=${encodeURIComponent(
      params.file.name
    )}`,
  };
}
