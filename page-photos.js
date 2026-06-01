const photoManifestUrl = "./assets/photos/page-photos/manifest.json?v=20260601-photos-1";

let photoManifestPromise;

export async function loadPagePhotos() {
  if (!photoManifestPromise) {
    photoManifestPromise = fetch(photoManifestUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`Photo manifest failed: ${response.status}`);
        return response.json();
      })
      .then((manifest) => new Map((manifest.pages ?? []).map((page) => [page.key, page])))
      .catch((error) => {
        console.warn(error);
        return new Map();
      });
  }
  return photoManifestPromise;
}

export function primaryPhoto(photoPages, key) {
  return pagePhotos(photoPages, key)[0] ?? null;
}

export function alternatePhoto(photoPages, key) {
  return pagePhotos(photoPages, key)[1] ?? pagePhotos(photoPages, key)[0] ?? null;
}

export function pagePhotos(photoPages, key) {
  return photoPages?.get(key)?.photos ?? [];
}

export function setPhotoImage(image, photo, alt) {
  if (!image || !photo?.file) return false;
  image.src = photo.file;
  image.alt = alt || photo.title || "";
  image.loading = "lazy";
  image.decoding = "async";
  return true;
}

export function setPhotoCredit(caption, link, photo, fallback = "") {
  if (caption) caption.textContent = photo?.title || fallback;
  if (!link) return;
  if (photo?.sourceUrl) {
    link.hidden = false;
    link.href = photo.sourceUrl;
    link.textContent = photoCreditLabel(photo);
  } else {
    link.hidden = true;
    link.removeAttribute("href");
    link.textContent = "";
  }
}

export function photoCreditLabel(photo) {
  return photo?.artist || photo?.credit || "图片来源";
}
