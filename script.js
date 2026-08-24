(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Footer year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile nav toggle
  const nav = $(".site-nav");
  const navToggle = $(".nav-toggle");
  const navLinks = $("#nav-links");

  const setNavOpen = (open) => {
    if (!nav || !navToggle) return;
    nav.dataset.open = open ? "true" : "false";
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  };

  if (nav && navToggle && navLinks) {
    setNavOpen(false);

    navToggle.addEventListener("click", () => {
      const isOpen = nav.dataset.open === "true";
      setNavOpen(!isOpen);
      if (!isOpen) {
        const first = navLinks.querySelector("a");
        if (first) first.focus();
      } else {
        navToggle.focus();
      }
    });

    document.addEventListener("click", (e) => {
      if (nav.dataset.open !== "true") return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (nav.contains(target)) return;
      setNavOpen(false);
    });

    navLinks.addEventListener("click", (e) => {
      const t = e.target;
      if (t instanceof HTMLAnchorElement) setNavOpen(false);
    });
  }

  // Smooth scroll for internal links
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a[href^="#"]');
    if (!(link instanceof HTMLAnchorElement)) return;
    if (link.classList.contains("skip-link")) return;

    const href = link.getAttribute("href");
    if (!href || href === "#") return;
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;

    e.preventDefault();
    el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    history.pushState(null, "", href);
  });

  // Scroll reveal for cards and prose (opt-in from JS so no-JS stays visible)
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const revealTargets = $$(
      ".prose, .fact-grid > .card, .timeline-item, .cards-3 > .card, .cards-2 > .card, .contact-grid > .card"
    );

    if (revealTargets.length) {
      revealTargets.forEach((el) => el.setAttribute("data-reveal", ""));

      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
      );

      revealTargets.forEach((el) => revealObserver.observe(el));
    }
  }

  // Highlight the nav link for the section currently in view
  if ("IntersectionObserver" in window) {
    const navAnchors = $$('#nav-links a[href^="#"]');
    const sections = navAnchors
      .map((a) => document.getElementById((a.getAttribute("href") || "").slice(1)))
      .filter((el) => el instanceof HTMLElement);

    if (sections.length) {
      const visible = new Set();

      const setCurrent = () => {
        const current = sections.find((section) => visible.has(section));
        navAnchors.forEach((a) => {
          const isCurrent = current != null && a.getAttribute("href") === `#${current.id}`;
          if (isCurrent) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      };

      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) visible.add(entry.target);
            else visible.delete(entry.target);
          });
          setCurrent();
        },
        { rootMargin: "-45% 0px -45% 0px" }
      );

      sections.forEach((section) => sectionObserver.observe(section));
    }
  }

  // Modal (open/close + focus management + tab trap)
  const modalRoot = $("#modal-contact");
  const modalDialog = modalRoot ? $(".modal-dialog", modalRoot) : null;
  const openers = $$('[data-open-modal="contact"]');
  let lastFocused = null;

  const getFocusable = (root) =>
    $$(
      [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ].join(","),
      root
    ).filter((el) => !el.hasAttribute("hidden") && !el.getAttribute("aria-hidden"));

  const setModalOpen = (open) => {
    if (!modalRoot || !modalDialog) return;
    modalRoot.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.classList.toggle("modal-open", open);

    const main = $("#main");
    const header = $(".site-header");
    if (main) main.setAttribute("aria-hidden", open ? "true" : "false");
    if (header) header.setAttribute("aria-hidden", open ? "true" : "false");

    if (open) {
      // Focus dialog container first so screen readers announce it.
      modalDialog.focus();
      const firstField = modalRoot.querySelector("input, textarea, button");
      if (firstField instanceof HTMLElement) firstField.focus();
    }
  };

  const openModal = (opener) => {
    if (!modalRoot) return;
    lastFocused = opener instanceof HTMLElement ? opener : document.activeElement;
    setModalOpen(true);
  };

  const closeModal = () => {
    if (!modalRoot) return;
    setModalOpen(false);
    // Restore focus
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
    lastFocused = null;
  };

  openers.forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn));
  });

  if (modalRoot) {
    $$(["[data-close-modal]"].join(","), modalRoot).forEach((el) => {
      el.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (e) => {
      if (modalRoot.getAttribute("aria-hidden") !== "false") return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key !== "Tab") return;
      if (!modalDialog) return;

      const focusables = getFocusable(modalRoot);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || active === modalRoot || active === modalDialog) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  // Contact form (validation + Formspree POST + status messages)
  const form = $("#contact-form");
  if (form instanceof HTMLFormElement) {
    const statusEls = $$("[data-status]", form);
    const setStatus = (key) => {
      statusEls.forEach((el) => {
        const isMatch = el.getAttribute("data-status") === key;
        el.toggleAttribute("hidden", !isMatch);
      });
    };

    const clearErrors = () => {
      $$("input, textarea", form).forEach((field) => field.setAttribute("aria-invalid", "false"));
      $$("[data-error-for]", form).forEach((hint) => (hint.textContent = ""));
    };

    const setError = (name, msg) => {
      const field = form.elements.namedItem(name);
      const hint = form.querySelector(`[data-error-for="${CSS.escape(name)}"]`);
      if (field instanceof HTMLElement) field.setAttribute("aria-invalid", "true");
      if (hint) hint.textContent = msg;
    };

    const validate = () => {
      clearErrors();
      let ok = true;

      const name = (form.elements.namedItem("name")?.value || "").toString().trim();
      const email = (form.elements.namedItem("email")?.value || "").toString().trim();
      const message = (form.elements.namedItem("message")?.value || "").toString().trim();

      if (!name) {
        ok = false;
        setError("name", "Please enter your name.");
      }

      const emailOk = /^\S+@\S+\.\S+$/.test(email);
      if (!email) {
        ok = false;
        setError("email", "Please enter your email.");
      } else if (!emailOk) {
        ok = false;
        setError("email", "Please enter a valid email.");
      }

      if (!message) {
        ok = false;
        setError("message", "Please enter a message.");
      }

      if (!ok) {
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
      }

      return ok;
    };

    setStatus("idle");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const endpoint = (form.dataset.formspreeEndpoint || "").trim();
      if (!endpoint) {
        setStatus("setup-needed");
        return;
      }

      if (!validate()) {
        setStatus("error");
        return;
      }

      // Honeypot: if filled, treat as success and do nothing.
      const gotcha = (form.elements.namedItem("_gotcha")?.value || "").toString().trim();
      if (gotcha) {
        form.reset();
        setStatus("success");
        return;
      }

      const submitBtn = form.querySelector("[data-submit]");
      const prevText = submitBtn instanceof HTMLElement ? submitBtn.textContent : null;
      if (submitBtn instanceof HTMLButtonElement) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            Accept: "application/json"
          },
          body: new FormData(form)
        });

        if (!res.ok) {
          setStatus("error");
          return;
        }

        form.reset();
        clearErrors();
        setStatus("success");
      } catch {
        setStatus("error");
      } finally {
        if (submitBtn instanceof HTMLButtonElement) {
          submitBtn.disabled = false;
          if (prevText != null) submitBtn.textContent = prevText;
        }
      }
    });
  }
})();


