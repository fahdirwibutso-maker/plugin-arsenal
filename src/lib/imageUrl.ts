/**
 * Build a responsive srcset for Supabase Storage images using the
 * image-transformation render endpoint. Falls back gracefully for
 * non-Supabase URLs (returns empty srcset, original src is used).
 */

const SUPABASE_OBJECT_PATH = "/storage/v1/object/public/";
const SUPABASE_RENDER_PATH = "/storage/v1/render/image/public/";

const isSupabasePublicObject = (url: string) =>
  typeof url === "string" && url.includes(SUPABASE_OBJECT_PATH);

export const transformedImageUrl = (
  url: string,
  width: number,
  quality = 70
): string => {
  if (!isSupabasePublicObject(url)) return url;
  const rendered = url.replace(SUPABASE_OBJECT_PATH, SUPABASE_RENDER_PATH);
  const sep = rendered.includes("?") ? "&" : "?";
  return `${rendered}${sep}width=${width}&quality=${quality}&resize=contain`;
};

export const buildSrcSet = (
  url: string,
  widths: number[] = [200, 400, 600, 800]
): string => {
  if (!isSupabasePublicObject(url)) return "";
  return widths
    .map((w) => `${transformedImageUrl(url, w)} ${w}w`)
    .join(", ");
};
