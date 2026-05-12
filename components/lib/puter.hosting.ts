import puter from "@heyputer/puter.js";
import {
  createHostingSlug,
  fetchBlobFromUrl,
  getHostedUrl,
  getImageExtension,
  HOSTING_CONFIG_KEY,
  imageUrlToPngBlob,
  isHostedUrl,
} from "./utils";

// it will return a promise that resolves to a HostingConfig object or null if it fails to create one
export const getOrCreateHostingConfig =
  async (): Promise<HostingConfig | null> => {
    const existing = (await puter.kv.get(
      HOSTING_CONFIG_KEY,
    )) as HostingConfig | null;
    if (existing) return { subdomain: existing.subdomain };

    const subdomain = createHostingSlug();

    try {
      const created = await puter.hosting.create(subdomain, ".");
      return { subdomain: created.subdomain };
    } catch (e) {
      console.warn("Failed to create hosting config:", e);
      return null;
    }
  };

export const uploadImageToHosting = async ({
  hosting,
  label,
  projectId,
  url,
}: StoreHostedImageParams): Promise<HostedAsset | null> => {
  if (!url || !hosting) return null;
  if (isHostedUrl(url)) return { url };

  try {
    const resolved =
      label === "rendered"
        ? await imageUrlToPngBlob(url).then((blob) =>
            blob ? { blob, contentType: "image/png" } : null,
          )
        : await fetchBlobFromUrl(url);

    if (!resolved) return null;
    const contentType = resolved.contentType || resolved.blob.type;
    const extention = getImageExtension(contentType, url);

    const dir = `projects/${projectId}`;
    const filename = `${dir}/${label}.${extention}`;
    const uploadFile = new File([resolved.blob], `${label}.${extention}`, {
      type: contentType,
    });

    await puter.fs.mkdir(dir, { createMissingParents: true });
    await puter.fs.write(filename, uploadFile);

    const hostedUrl = getHostedUrl({ subdomain: hosting.subdomain }, filename);
    return hostedUrl ? { url: hostedUrl } : null;
  } catch (e) {
    console.warn("Failed to upload image to hosting:", e);
    return null;
  }
  return null;
};
