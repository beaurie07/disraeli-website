/* Disraeli Asante-Darko site interactions */
(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll reveal (progressive enhancement) ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (!reducedMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-anim");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
    // Safety net: never leave content hidden if observation stalls.
    setTimeout(() => revealEls.forEach((el) => el.classList.add("in")), 3000);
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll(".cred-num");
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();
    const fmt = (v) =>
      prefix + v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    if (reducedMotion) {
      el.textContent = fmt(target);
      return;
    }
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const cio = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          cio.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => cio.observe(el));

  /* ---------- Rotating hero roles ---------- */
  const roles = [
    "Supply Chain Strategist",
    "Associate Professor",
    "Sustainability Consultant",
    "Researcher & Author",
    "Speaker & Educator",
  ];
  const rotator = document.getElementById("roleRotator");
  if (rotator && !reducedMotion) {
    let idx = 0;
    setInterval(() => {
      rotator.classList.add("switching");
      setTimeout(() => {
        idx = (idx + 1) % roles.length;
        rotator.textContent = roles[idx];
        rotator.classList.remove("switching");
        rotator.classList.add("entering");
        setTimeout(() => rotator.classList.remove("entering"), 420);
      }, 400);
    }, 3400);
  }

  /* ---------- Timeline draw-in ---------- */
  const timeline = document.getElementById("timeline");
  const progress = document.getElementById("timelineProgress");
  if (timeline && progress) {
    const updateTimeline = () => {
      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh * 0.4;
      const passed = Math.min(Math.max(vh * 0.85 - rect.top, 0), total);
      progress.style.height = (passed / total) * 100 + "%";
    };
    if (reducedMotion) {
      progress.style.height = "100%";
    } else {
      window.addEventListener("scroll", updateTimeline, { passive: true });
      updateTimeline();
    }
  }

  /* ---------- Nav: mobile menu + active section ---------- */
  const burger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");
  if (burger && navLinks) {
    burger.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      })
    );
  }

  const sections = ["about", "consultancy", "research", "speaking", "teaching", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navAnchors = Array.from(document.querySelectorAll(".nav-links a"));
  const progressBar = document.getElementById("scrollProgress");
  const toTopBtn = document.getElementById("toTop");
  const onScrollUpdate = () => {
    let current = "";
    sections.forEach((s) => {
      if (s.getBoundingClientRect().top <= window.innerHeight * 0.35) current = s.id;
    });
    navAnchors.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
    }
    if (toTopBtn) toTopBtn.classList.toggle("show", window.scrollY > window.innerHeight * 0.9);
  };
  window.addEventListener("scroll", onScrollUpdate, { passive: true });
  onScrollUpdate();
  toTopBtn?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));

  /* ---------- Hero photo tilt (desktop pointers only) ---------- */
  const heroPhoto = document.querySelector(".hero-photo");
  const photoFrame = document.querySelector(".photo-frame");
  if (heroPhoto && photoFrame && !reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    let raf = null;
    heroPhoto.addEventListener("mousemove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const r = photoFrame.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        photoFrame.classList.add("tilting");
        photoFrame.style.transform = "rotateY(" + (dx * 5).toFixed(2) + "deg) rotateX(" + (-dy * 5).toFixed(2) + "deg)";
      });
    });
    heroPhoto.addEventListener("mouseleave", () => {
      photoFrame.classList.remove("tilting");
      photoFrame.style.transform = "";
    });
  }

  /* ---------- Publications: filter + search ---------- */
  const pubs = Array.from(document.querySelectorAll(".pub"));
  const filterBtns = Array.from(document.querySelectorAll(".pf-btn"));
  const searchInput = document.getElementById("pubSearch");
  const emptyMsg = document.getElementById("pubEmpty");
  const moreBtn = document.getElementById("pubMore");
  const PUB_PREVIEW_COUNT = 5;
  let activeFilter = "all";
  let pubsExpanded = false;
  let pubsInteracted = false; // no entrance animation on initial page load

  const applyPubFilters = () => {
    const q = (searchInput?.value || "").trim().toLowerCase();
    const matches = pubs.filter((li) => {
      const matchesCat = activeFilter === "all" || li.dataset.cat === activeFilter;
      const matchesText = !q || li.textContent.toLowerCase().includes(q);
      return matchesCat && matchesText;
    });
    pubs.forEach((li) => {
      li.classList.add("hidden");
      li.classList.remove("pub-in");
      li.style.animationDelay = "";
    });
    matches.forEach((li, i) => {
      if (pubsExpanded || i < PUB_PREVIEW_COUNT) {
        li.classList.remove("hidden");
        if (pubsInteracted && !reducedMotion) {
          li.style.animationDelay = Math.min(i * 35, 350) + "ms";
          li.classList.add("pub-in");
        }
      }
    });
    pubsInteracted = true;
    if (emptyMsg) emptyMsg.hidden = matches.length > 0;
    if (moreBtn) {
      moreBtn.hidden = matches.length <= PUB_PREVIEW_COUNT;
      moreBtn.textContent = pubsExpanded
        ? "See fewer publications ↑"
        : `See all ${matches.length} publications ↓`;
    }
  };

  filterBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      applyPubFilters();
    })
  );
  searchInput?.addEventListener("input", applyPubFilters);
  moreBtn?.addEventListener("click", () => {
    pubsExpanded = !pubsExpanded;
    applyPubFilters();
    if (!pubsExpanded) document.getElementById("research")?.scrollIntoView();
  });
  applyPubFilters();

  /* ---------- Contact form → direct send (FormSubmit.co), mailto fallback ---------- */
  const CONTACT_EMAIL = "dasante-darko@ashesi.edu.gh";
  const FORM_ENDPOINT = "https://formsubmit.co/ajax/" + CONTACT_EMAIL;
  const form = document.getElementById("contactForm");
  if (form) {
    const submitBtn = document.getElementById("cfSubmit");
    const statusEl = document.getElementById("cfStatus");
    const showStatus = (text, kind) => {
      if (!statusEl) return;
      statusEl.hidden = false;
      statusEl.textContent = text;
      statusEl.className = "form-status " + kind;
    };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (document.getElementById("cfHoney")?.value) return; // spam bot filled the hidden field
      const name = document.getElementById("cfName").value.trim();
      const org = document.getElementById("cfOrg").value.trim();
      const topic = document.getElementById("cfTopic").value;
      const msg = document.getElementById("cfMsg").value.trim();
      const submitHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            name: name,
            organisation: org || "N/A",
            topic: topic,
            message: msg,
            _subject: `[Website] ${topic} | ${name}`,
            _template: "table",
            _captcha: "false",
          }),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        showStatus("Message sent. Dr. Asante-Darko will get back to you soon.", "ok");
        form.reset();
      } catch {
        // Direct send unavailable (offline, blocked, or service down): fall back to email client.
        showStatus("Direct send is unavailable right now. Opening your email app instead…", "err");
        const subject = encodeURIComponent(`[Website] ${topic} | ${name}`);
        const body = encodeURIComponent(
          `Name: ${name}\nOrganisation: ${org || "N/A"}\nTopic: ${topic}\n\n${msg}`
        );
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitHtml;
      }
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
