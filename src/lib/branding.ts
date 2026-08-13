import { supabase } from "@/integrations/supabase/client";

export interface ExtendedProfile {
  id: string;
  business_name?: string;
  company_name?: string;
  contact_email?: string;
  phone?: string;
  address?: string;
  bank_details?: string;
  default_currency?: string;
  reminders_enabled?: boolean;
  company_logo_url?: string;
  signature_url?: string;
}

/**
 * Uploads an image file (Company Logo or Signature) or converts it into a persistent storage URL.
 */
export async function uploadBrandingImage(
  userId: string,
  file: File,
  type: "logo" | "signature"
): Promise<string> {
  const fileExt = file.name.split(".").pop() || "png";
  const filePath = `${userId}/${type}_${Date.now()}.${fileExt}`;

  try {
    // Attempt Supabase Storage upload if bucket exists
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("branding")
      .upload(filePath, file, { upsert: true });

    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage
        .from("branding")
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }
  } catch {
    // Fall back gracefully to compressed data URL
  }

  // Fallback: Convert file to Base64 Data URL for instant persistence in profiles
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read image file."));
      }
    };
    reader.onerror = () => reject(new Error("Image reading error."));
    reader.readAsDataURL(file);
  });
}
