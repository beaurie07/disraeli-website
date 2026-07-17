/* Disraeli Asante-Darko site interactions */
(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll reveal (progressive enhancement) ---------- */
  const revealEls = document.querySelectorAll(".reveal, .reveal-l, .reveal-r, .reveal-scale, .reveal-wipe, .reveal-mask");
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
      { threshold: 0.12, rootMargin: "0px 0px -12% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
    // Safety net: never leave content hidden if observation stalls.
    setTimeout(() => revealEls.forEach((el) => el.classList.add("in")), 3000);
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll(".cred-num, .cstat-num");
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
  const roleArticle = document.getElementById("roleArticle");
  const articleFor = (role) => (/^[aeiou]/i.test(role) ? "an" : "a");
  if (rotator && !reducedMotion) {
    let idx = 0;
    setInterval(() => {
      rotator.classList.add("switching");
      setTimeout(() => {
        idx = (idx + 1) % roles.length;
        rotator.textContent = roles[idx];
        if (roleArticle) roleArticle.textContent = articleFor(roles[idx]);
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
  const navEl = document.querySelector(".nav");
  const heroFrame = document.querySelector(".photo-frame");
  const cvFloat = document.getElementById("cvFloat");
  // Speaking gallery: each tile drifts at its own rate for depth
  const galleryItems = Array.from(document.querySelectorAll(".gallery .g-item"));
  const driftAmp = [10, -14, 7, -11, 13];
  let lastScrollY = window.scrollY;
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
    const pastHero = window.scrollY > window.innerHeight * 0.9;
    if (toTopBtn) toTopBtn.classList.toggle("show", pastHero);
    if (cvFloat) cvFloat.classList.toggle("show", pastHero);
    const y = window.scrollY;
    if (navEl && !reducedMotion) {
      if (y > lastScrollY + 6 && y > 320) navEl.classList.add("nav-hidden");
      else if (y < lastScrollY - 6 || y <= 320) navEl.classList.remove("nav-hidden");
    }
    if (heroFrame && !reducedMotion && y < window.innerHeight * 1.3) {
      heroFrame.style.translate = "0 " + (y * 0.06).toFixed(1) + "px";
    }
    if (!reducedMotion && galleryItems.length) {
      const vh = window.innerHeight;
      galleryItems.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -240 || r.top > vh + 240) return; // offscreen: skip
        const delta = (r.top + r.height / 2 - vh / 2) / vh; // -1 .. 1
        el.style.translate = "0 " + (delta * (driftAmp[i % driftAmp.length])).toFixed(1) + "px";
      });
    }
    lastScrollY = y;
  };
  window.addEventListener("scroll", onScrollUpdate, { passive: true });
  onScrollUpdate();
  toTopBtn?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));

  /* ---------- Hero cursor glow (desktop only) ---------- */
  const hero = document.querySelector(".hero");
  const glow = document.getElementById("heroGlow");
  if (hero && glow && !reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    let glowRaf = null;
    hero.addEventListener("mousemove", (e) => {
      if (glowRaf) return;
      glowRaf = requestAnimationFrame(() => {
        glowRaf = null;
        const r = hero.getBoundingClientRect();
        glow.style.setProperty("--mx", e.clientX - r.left + "px");
        glow.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }

  /* ---------- Testimonials: auto-scroll + manual arrows ---------- */
  const marquee = document.getElementById("testiMarquee");
  const track = marquee?.querySelector(".testi-track");
  if (marquee && track) {
    let paused = false;
    let resumeTimer = null;
    const half = () => track.scrollWidth / 2; // one full set (cards are duplicated)
    const step = () => track.querySelector(".testi-card").offsetWidth + 22; // card + gap
    const scheduleResume = () => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => (paused = false), 3000);
    };
    // Ambient auto-scroll (skipped for reduced motion; manual arrows still work)
    if (!reducedMotion) {
      const tick = () => {
        if (!paused) {
          marquee.scrollLeft += 0.5;
          if (marquee.scrollLeft >= half()) marquee.scrollLeft -= half();
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      marquee.addEventListener("mouseenter", () => (paused = true));
      marquee.addEventListener("mouseleave", () => (paused = false));
    }
    const nudge = (dir) => {
      paused = true;
      // Seamless wrap: if stepping back past the start, jump forward into the duplicate set first.
      if (dir < 0 && marquee.scrollLeft < step()) marquee.scrollLeft += half();
      if (dir > 0 && marquee.scrollLeft >= half()) marquee.scrollLeft -= half();
      marquee.scrollBy({ left: dir * step(), behavior: reducedMotion ? "auto" : "smooth" });
      scheduleResume();
    };
    document.getElementById("testiPrev")?.addEventListener("click", () => nudge(-1));
    document.getElementById("testiNext")?.addEventListener("click", () => nudge(1));
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
