const FORTUNES = [
  {
    tier: "上上签",
    quote: "风起云开，万事顺意",
    bless: "愿你好运常伴，心想事成。",
    mood: "✨",
  },
  {
    tier: "上签",
    quote: "星光指路，前程可期",
    bless: "愿你所行皆坦途，所遇皆温柔。",
    mood: "🌟",
  },
  {
    tier: "中上签",
    quote: "花开正盛，好事将近",
    bless: "愿你在热爱里发光，在生活中收获小确幸。",
    mood: "🌸",
  },
  {
    tier: "中签",
    quote: "稳中有进，水到渠成",
    bless: "慢一点也没关系，你正在变得更好。",
    mood: "🍀",
  },
  {
    tier: "小吉",
    quote: "微风拂面，喜讯临门",
    bless: "愿你被善意包围，也把善意传递出去。",
    mood: "🎈",
  },
  {
    tier: "吉签",
    quote: "云淡风轻，顺势而为",
    bless: "愿你心里有光，脚下有路。",
    mood: "🌤️",
  },
];

const $ = (sel) => document.querySelector(sel);

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function toast(msg) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => el.classList.remove("show"), 1800);
}

function buildResultUrl(fortune) {
  const base = "./result.html";
  const q = new URLSearchParams({
    tier: fortune.tier,
    quote: fortune.quote,
    bless: fortune.bless,
    mood: fortune.mood,
    t: String(Date.now()),
  });
  return `${base}?${q.toString()}`;
}

function pickFortune() {
  const r = Math.random();
  let idx = Math.floor(r * FORTUNES.length);
  idx = clamp(idx, 0, FORTUNES.length - 1);
  return FORTUNES[idx];
}

function supportsGSAP() {
  return typeof window.gsap !== "undefined";
}

function runDrawAnimation({ onStart, onDone, durationMs }) {
  const wheel = $("#wheel");
  if (!wheel) {
    onStart?.();
    window.setTimeout(() => onDone?.(), durationMs);
    return;
  }

  onStart?.();

  if (!supportsGSAP()) {
    wheel.animate(
      [
        { transform: "rotate(0deg)" },
        { transform: "rotate(1300deg)" },
        { transform: "rotate(1600deg)" },
      ],
      {
        duration: durationMs,
        easing: "cubic-bezier(0.2, 0.9, 0.2, 1)",
      },
    ).onfinish = () => onDone?.();
    return;
  }

  const spins = 6 + Math.floor(Math.random() * 4);
  const extra = Math.random() * 360;
  const final = spins * 360 + extra;

  const tl = window.gsap.timeline({
    defaults: { ease: "power3.inOut" },
    onComplete: () => onDone?.(),
  });

  tl.set(wheel, { rotate: 0, transformOrigin: "50% 50%" })
    .to(wheel, { duration: durationMs / 1000, rotate: final, ease: "power4.inOut" }, 0)
    .to(
      wheel,
      { duration: 0.12, scale: 1.02, yoyo: true, repeat: 3, ease: "power1.inOut" },
      0.1,
    );
}

function main() {
  const btn = $("#drawBtn");
  const status = $("#status");
  const lastResultLink = $("#lastResultLink");
  let busy = false;

  const last = localStorage.getItem("lastFortune");
  if (last) {
    try {
      const f = JSON.parse(last);
      if (status) status.textContent = `上次抽到：${f.tier} ${f.mood ?? ""}（可再次抽签）`;
      if (lastResultLink) lastResultLink.href = buildResultUrl(f);
    } catch {
      if (status) status.textContent = "";
    }
  }

  btn?.addEventListener("click", () => {
    if (busy) return;
    busy = true;
    btn.disabled = true;

    const fortune = pickFortune();
    const durationMs = 2400 + Math.floor(Math.random() * 600);

    runDrawAnimation({
      durationMs,
      onStart: () => {
        if (status) status.textContent = "抽签进行中…好运正在加载中…";
        toast("抽签开始！转起来～");
      },
      onDone: () => {
        localStorage.setItem("lastFortune", JSON.stringify(fortune));
        const url = buildResultUrl(fortune);
        if (status) status.textContent = `抽签完成：${fortune.tier} ${fortune.mood}（正在展示结果）`;
        window.setTimeout(() => {
          window.location.href = url;
        }, 220);
      },
    });

    window.setTimeout(() => {
      busy = false;
      btn.disabled = false;
    }, durationMs + 80);
  });
}

document.addEventListener("DOMContentLoaded", main);

