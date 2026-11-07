// ============================================================
//  OFERTY
//  Oferty są w pliku oferty.json. Najprościej dodawać je przez
//  panel agenta: /agmat/panel/  (nie trzeba ruszać kodu).
// ============================================================
let OFFERS = [];

const TYPE_NAMES = { mieszkanie: "Mieszkanie", dom: "Dom", lokal: "Lokal", dzialka: "Działka" };
const DEAL_NAMES = { sprzedaz: "na sprzedaż", wynajem: "na wynajem" };

// zabezpiecza tekst wpisany w panelu przed "psuciem" strony
function esc(text) {
  return String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function formatPrice(offer) {
  const value = Number(offer.price).toLocaleString("pl-PL") + " zł";
  return offer.deal === "wynajem" ? value + " / mies." : value;
}

function roomsLabel(n) {
  if (n === 1) return "1 pokój";
  if (n >= 2 && n <= 4) return n + " pokoje";
  return n + " pokoi";
}

function offerTitle(o) {
  return `${TYPE_NAMES[o.type] || "Nieruchomość"} ${DEAL_NAMES[o.deal] || ""}`;
}

function offerCard(offer) {
  const specs = [];
  if (offer.rooms) specs.push(roomsLabel(offer.rooms));
  if (offer.area) specs.push(Number(offer.area).toLocaleString("pl-PL") + " m²");
  if (offer.floor) specs.push(esc(offer.floor));
  const photo = (offer.photos && offer.photos[0]) || "img/logo.svg";

  return `
    <article class="offer" data-type="${esc(offer.type)}" data-deal="${esc(offer.deal)}">
      <button type="button" class="offer__link" data-id="${esc(offer.id)}">
        <div class="offer__photo">
          <img src="${esc(photo)}" alt="${esc(offerTitle(offer) + " " + offer.location)}" loading="lazy">
          <span class="offer__badge offer__badge--${esc(offer.deal)}">${offer.deal === "wynajem" ? "Wynajem" : "Sprzedaż"}</span>
          ${offer.photos && offer.photos.length > 1 ? `<span class="offer__count">📷 ${offer.photos.length}</span>` : ""}
        </div>
        <div class="offer__body">
          <h3>${esc(offerTitle(offer))}</h3>
          ${offer.location ? `<p class="offer__location">📍 ${esc(offer.location)}</p>` : ""}
          <p class="offer__specs">${specs.join(" · ")}</p>
          <div class="offer__footer">
            <span class="offer__price">${formatPrice(offer)}</span>
            <span class="offer__more">Szczegóły →</span>
          </div>
        </div>
      </button>
    </article>`;
}

// --- wczytanie, wyświetlanie i filtrowanie ofert ---
const list = document.getElementById("offers-list");
let currentFilter = "all";

function applyFilter() {
  list.querySelectorAll(".offer").forEach((card) => {
    card.hidden = !(currentFilter === "all" || card.dataset.deal === currentFilter || card.dataset.type === currentFilter);
  });
}

function renderOffers() {
  list.innerHTML = OFFERS.length
    ? OFFERS.map(offerCard).join("")
    : `<p class="offers__empty">Obecnie nie mamy ofert na stronie. Zadzwoń – pomożemy znaleźć coś dla Ciebie.</p>`;
  applyFilter();
}

fetch("oferty.json", { cache: "no-cache" })
  .then((r) => r.json())
  .then((data) => { OFFERS = data; renderOffers(); })
  .catch(() => {
    list.innerHTML = `<p class="offers__empty">Nie udało się wczytać ofert. Odśwież stronę lub zadzwoń: 728 474 423.</p>`;
  });

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((b) => b.classList.remove("is-active"));
    button.classList.add("is-active");
    currentFilter = button.dataset.filter;
    applyFilter();
  });
});

// --- okno ze szczegółami oferty (z galerią zdjęć) ---
const modal = document.getElementById("offer-modal");
list.addEventListener("click", (e) => {
  const btn = e.target.closest(".offer__link");
  if (!btn) return;
  const o = OFFERS.find((x) => x.id === btn.dataset.id);
  const photos = o.photos && o.photos.length ? o.photos : ["img/logo.svg"];
  const rows = [
    ["Rodzaj", offerTitle(o)],
    ["Lokalizacja", o.location],
    ["Powierzchnia", o.area && Number(o.area).toLocaleString("pl-PL") + " m²"],
    ["Pokoje", o.rooms],
    ["Piętro", o.floor],
    ["Numer oferty", o.id],
  ].filter((r) => r[1]);
  modal.querySelector(".modal__content").innerHTML = `
    <img class="modal__main" src="${esc(photos[0])}" alt="">
    ${photos.length > 1 ? `<div class="modal__thumbs">${photos.map((p, i) =>
      `<button type="button" class="${i === 0 ? "is-active" : ""}" data-src="${esc(p)}"><img src="${esc(p)}" alt="Zdjęcie ${i + 1}"></button>`).join("")}</div>` : ""}
    <div class="modal__body">
      <h3>${esc(offerTitle(o))}</h3>
      <p class="offer__price">${formatPrice(o)}</p>
      <dl>${rows.map((r) => `<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join("")}</dl>
      ${o.desc ? `<p class="modal__desc">${esc(o.desc)}</p>` : ""}
      <div class="modal__actions">
        <a href="tel:+48728474423" class="btn">📞 Zadzwoń</a>
        <a href="mailto:agent_nieruchomosci@op.pl?subject=${encodeURIComponent("Pytanie o ofertę " + o.id)}" class="btn btn--outline">✉️ Zapytaj e-mailem</a>
      </div>
    </div>`;
  modal.scrollTop = 0;
  modal.showModal();
});
modal.addEventListener("click", (e) => {
  const thumb = e.target.closest(".modal__thumbs button");
  if (thumb) {
    modal.querySelector(".modal__main").src = thumb.dataset.src;
    modal.querySelectorAll(".modal__thumbs button").forEach((b) => b.classList.toggle("is-active", b === thumb));
    return;
  }
  if (e.target === modal || e.target.closest(".modal__close")) modal.close();
});

// --- menu na telefonie ---
const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open);
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", false);
  })
);

// --- formularz kontaktowy: otwiera program pocztowy z gotową wiadomością ---
document.getElementById("contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const subject = `[Strona WWW] ${data.get("topic")}`;
  const body =
    `Imię i nazwisko: ${data.get("name")}\n` +
    `Telefon: ${data.get("phone") || "-"}\n\n` +
    `${data.get("message")}`;
  window.location.href =
    "mailto:agent_nieruchomosci@op.pl?subject=" +
    encodeURIComponent(subject) +
    "&body=" +
    encodeURIComponent(body);
});

// --- rok w stopce ---
document.getElementById("year").textContent = new Date().getFullYear();
