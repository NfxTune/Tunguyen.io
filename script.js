document.addEventListener("DOMContentLoaded", () => {
  const progress = document.querySelector("#scroll-progress");
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max ? scrollY / max : 0})`;
  };
  addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

  const menuButton = document.querySelector(".menu-button");
  const nav = document.querySelector(".desktop-nav");
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }));

  // ===== Ảnh & nhạc: đọc từ data.json =====
  const esc = (v = "") => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const addReveal = (el) => { el.classList.add("reveal"); observer.observe(el); };

  const lightbox = document.querySelector("#lightbox");
  const lightboxImg = lightbox.querySelector("img");
  const closeLightbox = () => lightbox.classList.remove("open");
  lightbox.addEventListener("click", closeLightbox);
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

  const renderGallery = (items) => {
    const grid = document.querySelector("#gallery-grid");
    if (!items.length) { grid.innerHTML = '<p class="empty-note">Chưa có ảnh nào — sắp cập nhật.</p>'; return; }
    items.forEach((item) => {
      const fig = document.createElement("figure");
      fig.innerHTML = `<img src="${esc(item.src)}" alt="${esc(item.alt || item.caption || "Ảnh")}" loading="lazy"><figcaption>${esc(item.caption || "")}</figcaption>`;
      fig.addEventListener("click", () => {
        lightboxImg.src = item.src;
        lightboxImg.alt = item.alt || item.caption || "";
        lightbox.classList.add("open");
      });
      grid.appendChild(fig);
      addReveal(fig);
    });
  };

  const renderMusic = (tracks) => {
    const box = document.querySelector("#music-grid");
    if (!tracks.length) { box.innerHTML = '<p class="empty-note">Chưa có bài nào — sắp cập nhật.</p>'; return; }
    tracks.forEach((t) => {
      const card = document.createElement("article");
      card.className = "track";
      const player = t.audio
        ? `<audio controls preload="none" src="${esc(t.audio)}"></audio>`
        : `<iframe src="${esc(t.embed)}" height="${Number(t.height) || 152}" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
      card.innerHTML = `<p>${esc(t.title)}${t.artist ? " — " + esc(t.artist) : ""}</p>${player}`;
      box.appendChild(card);
      addReveal(card);
    });
  };

  (async () => {
    let data = {};
    try {
      const res = await fetch("data.json", { cache: "no-store" });
      if (res.ok) data = await res.json();
    } catch (err) { console.warn("Không đọc được data.json", err); }
    renderGallery(data.gallery || []);
    renderMusic(data.tracks || []);
  })();
});
