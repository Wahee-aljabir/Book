import { PageFlip } from "https://cdn.skypack.dev/page-flip@2.0.7";

const pageFlip = new PageFlip(document.getElementById("holidayList"), {
	width: 550,
	height: 733,
	size: "stretch",
	minWidth: 315,
	maxWidth: 1000,
	minHeight: 420,
	maxHeight: 1350,
	maxShadowOpacity: 0.5,
	showCover: true,
	mobileScrollSupport: false
});

pageFlip.loadFromHTML(document.querySelectorAll(".holiday-item"));

document.querySelector("#prev").addEventListener("click", () => pageFlip.flipPrev());
document.querySelector("#next").addEventListener("click", () => pageFlip.flipNext());

// Image preload and fallback using manifest
async function preloadImagesWithFallback() {
  const manifestUrl = "image_manifest.txt";
  let lines = [];
  try {
    const res = await fetch(manifestUrl);
    if (res.ok) {
      const txt = await res.text();
      lines = txt.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
    }
  } catch {}

  const placeholders = {
    cover: "assets/images/cover_page.jpg"
  };

  async function check(url) {
    try {
      const r = await fetch(url, { method: "HEAD" });
      return r.ok;
    } catch { return false; }
  }

  // For each .story-image, set background to assets path and fallback if missing
  const imgs = document.querySelectorAll(".story-image");
  await Promise.all(Array.from(imgs).map(async (el, idx)=>{
    const assetUrl = getComputedStyle(el).backgroundImage;
    // If CSS already set to assets path, just verify
    const match = assetUrl.match(/url\("(.+?)"\)/);
    let url = match ? match[1] : null;
    if (url) {
      const ok = await check(url);
      if (!ok) {
        // Try old path fallback
        const oldUrl = url.replace("assets/images/", "images/");
        const okOld = await check(oldUrl);
        el.style.backgroundImage = `url('${okOld ? oldUrl : placeholders.cover}')`;
      }
    }
  }));
}

preloadImagesWithFallback();