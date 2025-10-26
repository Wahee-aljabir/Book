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

// Read-aloud controls and functionality
const speech = window.speechSynthesis;
let utterance = null;
let isPlaying = false;

function buildReadAloudUI() {
  const bar = document.createElement("div");
  bar.id = "readAloudBar";
  bar.style.position = "fixed";
  bar.style.bottom = "20px";
  bar.style.right = "20px";
  bar.style.zIndex = "9999";
  bar.style.background = "rgba(0,0,0,0.6)";
  bar.style.color = "#fff";
  bar.style.padding = "12px";
  bar.style.borderRadius = "10px";
  bar.style.display = "flex";
  bar.style.gap = "8px";
  bar.style.alignItems = "center";

  const btn = document.createElement("button");
  btn.id = "readAloudToggle";
  btn.textContent = "Read Aloud";
  btn.style.padding = "6px 10px";
  btn.style.borderRadius = "6px";

  const play = document.createElement("button");
  play.id = "raPlay";
  play.textContent = "Play";
  const pause = document.createElement("button");
  pause.id = "raPause";
  pause.textContent = "Pause";
  const stop = document.createElement("button");
  stop.id = "raStop";
  stop.textContent = "Stop";

  const rateLabel = document.createElement("label");
  rateLabel.textContent = "Rate";
  const rate = document.createElement("input");
  rate.type = "range";
  rate.min = "0.8"; rate.max = "1.4"; rate.step = "0.1"; rate.value = "1.0";

  const pitchLabel = document.createElement("label");
  pitchLabel.textContent = "Pitch";
  const pitch = document.createElement("input");
  pitch.type = "range";
  pitch.min = "0.8"; pitch.max = "1.4"; pitch.step = "0.1"; pitch.value = "1.0";

  const toneLabel = document.createElement("label");
  toneLabel.textContent = "Tone";
  const tone = document.createElement("select");
  tone.id = "raTone";
  ["calm","happy","excited"].forEach(t => {
    const opt = document.createElement("option");
    opt.value = t; opt.textContent = t[0].toUpperCase()+t.slice(1);
    tone.appendChild(opt);
  });

  const langLabel = document.createElement("label");
  langLabel.textContent = "Language";
  const lang = document.createElement("select");
  lang.id = "raLang";

  bar.append(btn, play, pause, stop, rateLabel, rate, pitchLabel, pitch, toneLabel, tone, langLabel, lang);
  document.body.appendChild(bar);

  // Load voices
  function populateVoices() {
    const voices = speech.getVoices();
    lang.innerHTML = "";
    const preferred = ["en-US","en-GB","ar","ur","tr","fr"];
    const sorted = voices.sort((a,b)=>a.lang.localeCompare(b.lang));
    sorted.forEach(v=>{
      const option = document.createElement("option");
      option.value = v.voiceURI;
      option.textContent = `${v.name} (${v.lang})`;
      option.dataset.lang = v.lang;
      lang.appendChild(option);
    });
    // default calm voice: pick first English if available
    const firstEn = [...sorted].find(v=>v.lang.startsWith("en"));
    if (firstEn) lang.value = firstEn.voiceURI;
  }
  populateVoices();
  speech.onvoiceschanged = populateVoices;

  function currentPageText() {
    const pages = document.querySelectorAll(".holiday-item");
    const state = pageFlip.getCurrentPageIndex();
    // try to read only visible page(s)
    const visible = pageFlip.getState();
    // Fallback: concatenate story-text of current and next page
    const cur = pages[state]?.querySelector(".story-text")?.textContent || "";
    const next = pages[state+1]?.querySelector(".story-text")?.textContent || "";
    const text = [cur, next].filter(Boolean).join(". ");
    return text || document.querySelectorAll(".story-text").length ?
           Array.from(document.querySelectorAll(".story-text")).map(el=>el.textContent).join(". ") :
           "";
  }

  function startSpeak() {
    const text = currentPageText();
    if (!text) return;
    stopSpeak();
    utterance = new SpeechSynthesisUtterance(text);
    // voice selection
    const selected = [...speech.getVoices()].find(v=>v.voiceURI === lang.value);
    if (selected) utterance.voice = selected;
    // tone presets
    const t = tone.value;
    if (t === "calm") { utterance.rate = parseFloat(rate.value); utterance.pitch = parseFloat(pitch.value); }
    if (t === "happy") { utterance.rate = Math.min(1.2, parseFloat(rate.value)+0.1); utterance.pitch = Math.min(1.2, parseFloat(pitch.value)+0.1); }
    if (t === "excited") { utterance.rate = Math.min(1.3, parseFloat(rate.value)+0.2); utterance.pitch = Math.min(1.3, parseFloat(pitch.value)+0.2); }
    utterance.onstart = ()=>{ isPlaying = true; btn.style.background = "#2e7d32"; btn.style.color = "#fff"; };
    utterance.onend = ()=>{ isPlaying = false; btn.style.background = ""; btn.style.color = ""; };
    speech.speak(utterance);
  }

  function pauseSpeak() { if (speech.speaking) speech.pause(); }
  function resumeSpeak() { if (speech.paused) speech.resume(); }
  function stopSpeak() { if (speech.speaking || speech.paused) { speech.cancel(); isPlaying = false; btn.style.background = ""; btn.style.color = ""; } }

  btn.addEventListener("click", ()=>{
    if (!isPlaying) startSpeak(); else pauseSpeak();
  });
  play.addEventListener("click", startSpeak);
  pause.addEventListener("click", pauseSpeak);
  stop.addEventListener("click", stopSpeak);

  // Auto stop on page flip
  pageFlip.on("flip", ()=>{ stopSpeak(); });
}

buildReadAloudUI();

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