/* QUOPHY — services page: cards, FAQ accordion, contact form */

document.addEventListener("DOMContentLoaded", () => {
  const list = $("[data-services-list]");
  if (list) {
    list.innerHTML = SERVICES.map(
      (s) => `
      <article class="service-card reveal">
        <img src="${s.image}" alt="${escapeHtml(s.title)}" loading="lazy" width="800" height="600">
        <h2 style="font-family: var(--ff-display); font-size: var(--fs-h3); font-weight: 400">${escapeHtml(s.title)}</h2>
        <p>${escapeHtml(s.text)}</p>
      </article>`
    ).join("");
  }

  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-faq] .accordion__btn");
    if (!btn) return;
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    panel.classList.toggle("is-open", !open);
  });

  const form = $("[data-contact]");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const valid =
        String(data.get("name")).trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.get("email")).trim()) &&
        String(data.get("message")).trim().length > 4;
      $("[data-contact-msg]").textContent = valid
        ? "Thank you — an advisor will respond within one business day."
        : "Please complete every field with a valid email address.";
      if (valid) form.reset();
    });
  }

  observeReveals();
});
