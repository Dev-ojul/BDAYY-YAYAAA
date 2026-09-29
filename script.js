const pages = [...document.querySelectorAll(".page")];
const transitionLayer = document.querySelector(".transition-layer");
const confettiLayer = document.querySelector("#confetti");
let currentPage = "welcome";
let isTransitioning = false;

function replayReveals(page) {
  page.querySelectorAll(".reveal").forEach((element) => {
    element.style.animation = "none";
    void element.offsetWidth;
    element.style.animation = "";
  });
}

function showPage(pageId, withConfetti = false) {
  if (isTransitioning || pageId === currentPage) return;
  const nextPage = document.getElementById(pageId);
  if (!nextPage) return;

  isTransitioning = true;
  transitionLayer.classList.remove("is-transitioning");
  void transitionLayer.offsetWidth;
  transitionLayer.classList.add("is-transitioning");

  window.setTimeout(() => {
    pages.forEach((page) => {
      const active = page === nextPage;
      page.classList.toggle("is-active", active);
      page.setAttribute("aria-hidden", String(!active));
    });
    currentPage = pageId;
    window.scrollTo({ top: 0, behavior: "instant" });
    replayReveals(nextPage);
    if (withConfetti) launchConfetti();
  }, 390);

  window.setTimeout(() => {
    transitionLayer.classList.remove("is-transitioning");
    isTransitioning = false;
  }, 880);
}

function launchConfetti() {
  const colors = ["#ff79a2", "#ffd96a", "#8ec5e3", "#94be7d", "#ffffff"];
  for (let index = 0; index < 42; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[index % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.45}s`;
    piece.style.animationDuration = `${1.35 + Math.random() * 1.1}s`;
    piece.style.transform = `rotate(${Math.random() * 180}deg)`;
    if (index % 4 === 0) piece.style.borderRadius = "50%";
    confettiLayer.appendChild(piece);
    window.setTimeout(() => piece.remove(), 2800);
  }
}

const openingEnvelope = document.querySelector("#open-envelope");
openingEnvelope.addEventListener("click", () => {
  if (openingEnvelope.classList.contains("is-opening")) return;
  openingEnvelope.classList.add("is-opening");
  openingEnvelope.setAttribute("aria-label", "Amplop terbuka");

  window.setTimeout(() => showPage("gift", true), 1050);
  window.setTimeout(() => {
    openingEnvelope.classList.remove("is-opening");
    openingEnvelope.setAttribute("aria-label", "Buka amplop ulang tahun");
  }, 2050);
});
document.querySelector("#open-menu").addEventListener("click", () => showPage("menu"));

document.querySelectorAll("[data-back]").forEach((button) => {
  button.addEventListener("click", () => showPage(button.dataset.back));
});

document.querySelectorAll("[data-detail]").forEach((button) => {
  button.addEventListener("click", () => showPage(button.dataset.detail));
});

const memoryEnvelope = document.querySelector("#memory-envelope");
memoryEnvelope.addEventListener("click", () => {
  const isOpen = memoryEnvelope.classList.toggle("is-open");
  memoryEnvelope.setAttribute("aria-expanded", String(isOpen));
  document.querySelector(".tap-memory").textContent = isOpen ? "tap again to close" : "tap the envelope to read";
});

const photoInput = document.querySelector("#photo-input");
let activePhotoSlot = null;

function placePhoto(slot, source) {
  const image = slot.querySelector("img");
  image.src = source;
  slot.classList.add("has-photo");
}

document.querySelectorAll("[data-photo] img").forEach((image) => {
  image.addEventListener("error", () => {
    if (image.getAttribute("src") === image.dataset.fallback) return;
    image.src = image.dataset.fallback;
  });
});

document.querySelectorAll("[data-photo]").forEach((slot) => {
  const savedPhoto = localStorage.getItem(`yayaaa-photo-${slot.dataset.photo}`);
  if (savedPhoto) placePhoto(slot, savedPhoto);
});

document.querySelectorAll("[data-photo]").forEach((slot) => {
  slot.addEventListener("click", () => {
    activePhotoSlot = slot;
    photoInput.value = "";
    photoInput.click();
  });
});

photoInput.addEventListener("change", () => {
  const [file] = photoInput.files;
  if (!file || !activePhotoSlot) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const sourceImage = new Image();
    sourceImage.addEventListener("load", () => {
      const maxSide = 1000;
      const scale = Math.min(1, maxSide / Math.max(sourceImage.width, sourceImage.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(sourceImage.width * scale);
      canvas.height = Math.round(sourceImage.height * scale);
      canvas.getContext("2d").drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

      const optimizedPhoto = canvas.toDataURL("image/jpeg", 0.82);
      placePhoto(activePhotoSlot, optimizedPhoto);
      try {
        localStorage.setItem(`yayaaa-photo-${activePhotoSlot.dataset.photo}`, optimizedPhoto);
      } catch {
        // Foto tetap tampil walau penyimpanan browser penuh.
      }
    });
    sourceImage.src = reader.result;
  });
  reader.readAsDataURL(file);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (["message", "flower", "memories"].includes(currentPage)) showPage("menu");
  else if (currentPage === "menu") showPage("gift");
  else if (currentPage === "gift") showPage("welcome");
});
