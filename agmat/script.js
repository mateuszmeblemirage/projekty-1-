// ============================================================
//  OFERTY
//  Żeby dodać / usunąć ofertę, edytuj tę listę.
//  type: "mieszkanie" | "dom" | "lokal"
//  deal: "sprzedaz" | "wynajem"
//  Zdjęcia leżą w folderze img/oferty/
//  Opcjonalnie: desc: "opis oferty" – pokaże się po kliknięciu w ofertę.
// ============================================================
const OFFERS = [
  { id: "AGMA-MS-38", type: "mieszkanie", deal: "sprzedaz", location: "Częstochowa", rooms: 4, area: 66.7, floor: "1 piętro", price: 472000, img: "img/oferty/7000121.jpg" },
  { id: "AGMA-MS-37", type: "mieszkanie", deal: "sprzedaz", location: "Poczesna, Huta Stara B", rooms: 3, area: 60, floor: "parter", price: 449000, img: "img/oferty/6992188.jpg" },
  { id: "AGMA-MS-35", type: "mieszkanie", deal: "sprzedaz", location: "Częstochowa", rooms: 4, area: 73.2, floor: "2 piętro", price: 499000, img: "img/oferty/6926123.jpg" },
  { id: "AGMA-MS-34", type: "mieszkanie", deal: "sprzedaz", location: "Częstochowa", rooms: 2, area: 43, floor: "2 piętro", price: 292000, img: "img/oferty/6885407.jpg" },
  { id: "AGMA-MS-30", type: "mieszkanie", deal: "sprzedaz", location: "Częstochowa, Wrzosowiak", rooms: 3, area: 54, floor: "2 piętro", price: 365000, img: "img/oferty/6885374.jpg" },
  { id: "AGMA-MS-29", type: "mieszkanie", deal: "sprzedaz", location: "", rooms: 1, area: 29.1, floor: "1 piętro", price: 155000, img: "img/oferty/6873354.jpg" },
  { id: "AGMA-MS-28", type: "mieszkanie", deal: "sprzedaz", location: "Częstochowa", rooms: 2, area: 55.3, floor: "4 piętro", price: 329000, img: "img/oferty/6865151.jpg" },
  { id: "AGMA-DS-27", type: "dom", deal: "sprzedaz", location: "Częstochowa", rooms: null, area: 190, floor: null, price: 575000, img: "img/oferty/6865126.jpg" },
  { id: "AGMA-DS-26", type: "dom", deal: "sprzedaz", location: "Miedźno, Władysławów", rooms: null, area: 75, floor: null, price: 390000, img: "img/oferty/6847263.jpg" },
  { id: "AGMA-MW-32", type: "mieszkanie", deal: "wynajem", location: "Częstochowa", rooms: 3, area: 66.4, floor: "3 piętro", price: 3000, img: "img/oferty/6885400.jpg" },
  { id: "AGMA-MW-31", type: "mieszkanie", deal: "wynajem", location: "Częstochowa, Ostatni Grosz", rooms: 2, area: null, floor: "9 piętro", price: 1200, img: "img/oferty/6885395.jpg" },
  { id: "AGMA-LW-33", type: "lokal", deal: "wynajem", location: "Częstochowa", rooms: null, area: 18, floor: null, price: 1300, img: "img/oferty/6885404.jpg" },
];

const TYPE_NAMES = { mieszkanie: "Mieszkanie", dom: "Dom", lokal: "Lokal" };
const DEAL_NAMES = { sprzedaz: "na sprzedaż", wynajem: "na wynajem" };

function formatPrice(offer) {
  const value = offer.price.toLocaleString("pl-PL") + " zł";
  return offer.deal === "wynajem" ? value + " / mies." : value;
}

function roomsLabel(n) {
  if (n === 1) return "1 pokój";
  if (n >= 2 && n <= 4) return n + " pokoje";
  return n + " pokoi";
}

function offerCard(offer) {
  const specs = [];
  if (offer.rooms) specs.push(roomsLabel(offer.rooms));
  if (offer.area) specs.push(offer.area.toLocaleString("pl-PL") + " m²");
  if (offer.floor) specs.push(offer.floor);

  return `
    <article class="offer" data-type="${offer.type}" data-deal="${offer.deal}">
      <button type="button" class="offer__link" data-id="${offer.id}">
        <div class="offer__photo">
          <img src="${offer.img}" alt="${TYPE_NAMES[offer.type]} ${DEAL_NAMES[offer.deal]} ${offer.location}" loading="lazy">
          <span class="offer__badge offer__badge--${offer.deal}">${offer.deal === "sprzedaz" ? "Sprzedaż" : "Wynajem"}</span>
        </div>
        <div class="offer__body">
          <h3>${TYPE_NAMES[offer.type]} ${DEAL_NAMES[offer.deal]}</h3>
          ${offer.location ? `<p class="offer__location">📍 ${offer.location}</p>` : ""}
          <p class="offer__specs">${specs.join(" · ")}</p>
          <div class="offer__footer">
            <span class="offer__price">${formatPrice(offer)}</span>
            <span class="offer__more">Szczegóły →</span>
          </div>
        </div>
      </button>
    </article>`;
}

// --- wyświetlanie i filtrowanie ofert ---
const list = document.getElementById("offers-list");
list.innerHTML = OFFERS.map(offerCard).join("");

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((b) => b.classList.remove("is-active"));
    button.classList.add("is-active");

    const f = button.dataset.filter;
    list.querySelectorAll(".offer").forEach((card) => {
      const show = f === "all" || card.dataset.deal === f || card.dataset.type === f;
      card.hidden = !show;
    });
  });
});

// --- okno ze szczegółami oferty ---
const modal = document.getElementById("offer-modal");
list.addEventListener("click", (e) => {
  const btn = e.target.closest(".offer__link");
  if (!btn) return;
  const o = OFFERS.find((x) => x.id === btn.dataset.id);
  const rows = [
    ["Rodzaj", TYPE_NAMES[o.type] + " " + DEAL_NAMES[o.deal]],
    ["Lokalizacja", o.location],
    ["Powierzchnia", o.area && o.area.toLocaleString("pl-PL") + " m²"],
    ["Pokoje", o.rooms],
    ["Piętro", o.floor],
    ["Numer oferty", o.id],
  ].filter((r) => r[1]);
  modal.querySelector(".modal__content").innerHTML = `
    <img src="${o.img}" alt="">
    <div class="modal__body">
      <h3>${TYPE_NAMES[o.type]} ${DEAL_NAMES[o.deal]}</h3>
      <p class="offer__price">${formatPrice(o)}</p>
      <dl>${rows.map((r) => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join("")}</dl>
      ${o.desc ? `<p>${o.desc}</p>` : ""}
      <div class="modal__actions">
        <a href="tel:+48728474423" class="btn">📞 Zadzwoń</a>
        <a href="mailto:agent_nieruchomosci@op.pl?subject=${encodeURIComponent("Pytanie o ofertę " + o.id)}" class="btn btn--outline">✉️ Zapytaj e-mailem</a>
      </div>
    </div>`;
  modal.showModal();
});
modal.addEventListener("click", (e) => {
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
