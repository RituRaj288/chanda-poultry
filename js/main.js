/**
 * ============================================================================
 * CORE INTERACTIVE ENGINE & SHARED UI CONTROLLER (LOGO-MATCHED EDITION)
 * File: js/main.js
 * ============================================================================
 */

(function () {
  "use strict";

  const STORAGE_KEY_COOKIES = "chanda_cookie_consent_v1";

  // Clear any legacy override keys so public pages always show clean verified details
  try {
    localStorage.removeItem("luxury_corp_site_overrides_v1");
    localStorage.removeItem("luxury_corp_site_overrides_v2");
    localStorage.removeItem("luxury_corp_site_overrides_v3");
  } catch (e) {
    // ignore storage errors
  }

  function resolveBrandImage(src) {
    if (!src || typeof src !== "string") return src;
    if (src.startsWith("data:")) return src;
    const store = window.EMBEDDED_BRAND_IMAGES || {};
    const clean = src.replace(/^(\.\/|\/)+/, "");
    if (store[clean]) return store[clean];
    const baseName = clean.split("/").pop().split("?")[0];
    if (store[baseName]) return store[baseName];
    return src;
  }

  window.resolveBrandImage = resolveBrandImage;

  function hydrateImgElement(img) {
    if (!img || img.tagName !== "IMG") return;
    const rawSrc = img.getAttribute("src") || "";
    if (!rawSrc || rawSrc.startsWith("data:")) return;
    const resolved = resolveBrandImage(rawSrc);
    if (resolved && resolved !== rawSrc) {
      img.setAttribute("data-original-src", rawSrc);
      img.src = resolved;
    }
  }

  function hydrateAllPageImages(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll("img").forEach(hydrateImgElement);
  }

  // Capture-phase error listener as a fallback if any image fails to load over network
  window.addEventListener(
    "error",
    function (e) {
      if (e && e.target && e.target.tagName === "IMG") {
        hydrateImgElement(e.target);
      }
    },
    true
  );

  function loadActiveConfig() {
    const cfg = window.SITE_CONFIG || {};
    if (cfg.logos) {
      cfg.logos.poultryFeed = resolveBrandImage(cfg.logos.poultryFeed);
      cfg.logos.silageFeed = resolveBrandImage(cfg.logos.silageFeed);
    }
    if (Array.isArray(cfg.brandDivisions)) {
      cfg.brandDivisions.forEach((d) => {
        if (d.logo) d.logo = resolveBrandImage(d.logo);
      });
    }
    if (Array.isArray(cfg.services)) {
      cfg.services.forEach((s) => {
        if (s.logoBadge) s.logoBadge = resolveBrandImage(s.logoBadge);
      });
    }
    if (Array.isArray(cfg.portfolio)) {
      cfg.portfolio.forEach((p) => {
        if (p.image) p.image = resolveBrandImage(p.image);
      });
    }
    if (Array.isArray(cfg.blogPosts)) {
      cfg.blogPosts.forEach((b) => {
        if (b.image) b.image = resolveBrandImage(b.image);
      });
    }
    return cfg;
  }

  window.getActiveSiteConfig = loadActiveConfig;

  function getDisplayCompanyName(cfg) {
    return cfg.companyName || "CHANDA POULTRY AND SILAGE FEEDS PRIVATE LIMITED";
  }

  function getDisplayWordmark(cfg) {
    return cfg.brandWordmark || "CHANDA";
  }

  function getDisplaySubwordmark(cfg) {
    return cfg.brandSubwordmark || "POULTRY & SILAGE FEEDS PVT. LTD.";
  }

  // Automatically inject the two official circular logos into every page's Header, Mobile Drawer & Favicon
  function injectOfficialLogosIntoHeaderAndFooter() {
    const logoPoultry = resolveBrandImage("assets/images/logo-poultry-feed.jpg");
    const logoSilage = resolveBrandImage("assets/images/logo-silage-feed.jpg");

    // 1. Set Favicon to official Chanda Poultry Feed emblem
    let iconLink = document.querySelector('link[rel="icon"]');
    if (!iconLink) {
      iconLink = document.createElement("link");
      iconLink.rel = "icon";
      iconLink.type = "image/jpeg";
      document.head.appendChild(iconLink);
    }
    iconLink.href = logoPoultry;

    // 2. Upgrade Header Brand Logo to display both official emblems cleanly side-by-side
    const headerBrandLinks = document.querySelectorAll('header a[aria-label="Home"]');
    headerBrandLinks.forEach((brandLink) => {
      brandLink.setAttribute("data-logos-injected", "true");
      brandLink.className = "flex items-center gap-3.5 text-left group";
      brandLink.innerHTML = `
        <div class="flex items-center gap-2 shrink-0 bg-[#041B0C]/70 px-2 py-1.5 rounded-full border border-[#F5C533]/35">
          <img
            src="${logoPoultry}"
            alt="Chanda Poultry Feed Official Logo (Mandi Adampur)"
            class="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#F5C533] object-cover bg-white shadow-sm"
          />
          <img
            src="${logoSilage}"
            alt="Chanda Silage Napier Grass Feed Official Logo"
            class="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#F5C533] object-cover bg-white shadow-sm"
          />
        </div>
        <div class="border-l border-[#F5C533]/30 pl-3">
          <span data-bind="brandWordmark" class="block font-serif text-lg sm:text-xl font-bold tracking-[0.12em] text-white leading-none">
            CHANDA
          </span>
          <span data-bind="brandSubwordmark" class="block text-[10px] tracking-[0.14em] uppercase text-[#F5C533] font-semibold mt-1">
            POULTRY &amp; SILAGE FEEDS PVT. LTD.
          </span>
        </div>
      `;
    });
  }

  function applyBrandBindings() {
    const cfg = loadActiveConfig();
    const displayCompany = getDisplayCompanyName(cfg);
    const displayWordmark = getDisplayWordmark(cfg);
    const displaySubwordmark = getDisplaySubwordmark(cfg);

    document.querySelectorAll('[data-bind="companyName"]').forEach((el) => {
      el.textContent = displayCompany;
    });
    document.querySelectorAll('[data-bind="brandWordmark"]').forEach((el) => {
      el.textContent = displayWordmark;
    });
    document.querySelectorAll('[data-bind="brandSubwordmark"]').forEach((el) => {
      el.textContent = displaySubwordmark;
    });
    document.querySelectorAll('[data-bind="promoterName"]').forEach((el) => {
      el.textContent = cfg.contact.promoterName;
    });
    document.querySelectorAll('[data-bind="registeredAddress"]').forEach((el) => {
      el.textContent = cfg.contact.registeredAddress;
    });
    document.querySelectorAll('[data-bind="phoneDisplay"]').forEach((el) => {
      el.textContent = cfg.contact.phoneDisplay;
      if (el.tagName === "A" && cfg.contact.phoneRaw) {
        el.href = "tel:" + cfg.contact.phoneRaw.replace(/\s+/g, "");
        el.classList.remove("placeholder-link");
      }
    });
    document.querySelectorAll('[data-bind="emailDisplay"]').forEach((el) => {
      el.textContent = cfg.contact.emailDisplay;
      if (el.tagName === "A" && cfg.contact.emailRaw) {
        el.href = "mailto:" + cfg.contact.emailRaw;
        el.classList.remove("placeholder-link");
      }
    });
    document.querySelectorAll('[data-bind="currentYear"]').forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  }

  function initNavigation() {
    const header = document.getElementById("siteHeader");
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileMenuClose = document.getElementById("mobileMenuClose");
    const mobileDrawer = document.getElementById("mobileDrawer");

    if (header) {
      window.addEventListener(
        "scroll",
        () => {
          if (window.scrollY > 24) {
            header.classList.add("scrolled");
          } else {
            header.classList.remove("scrolled");
          }
        },
        { passive: true }
      );
    }

    function openMobileMenu() {
      if (!mobileDrawer || !mobileMenuBtn) return;
      mobileDrawer.classList.remove("hidden");
      mobileDrawer.setAttribute("aria-hidden", "false");
      mobileMenuBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      if (mobileMenuClose) mobileMenuClose.focus();
    }

    function closeMobileMenu() {
      if (!mobileDrawer || !mobileMenuBtn) return;
      mobileDrawer.classList.add("hidden");
      mobileDrawer.setAttribute("aria-hidden", "true");
      mobileMenuBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      mobileMenuBtn.focus();
    }

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", openMobileMenu);
    }
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener("click", closeMobileMenu);
    }
    if (mobileDrawer) {
      mobileDrawer.addEventListener("click", (e) => {
        if (e.target === mobileDrawer) closeMobileMenu();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (mobileDrawer && !mobileDrawer.classList.contains("hidden")) {
          closeMobileMenu();
        }
        closeAllModals();
      }
    });
  }

  function initScrollReveal() {
    const elements = document.querySelectorAll(".reveal-on-scroll");
    if (!elements.length) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
  }

  function injectSharedModals() {
    const cfg = loadActiveConfig();
    const serviceOptions = (cfg.services || [])
      .map((s) => `<option value="${s.title}">${s.title} (${s.category})</option>`)
      .join("");

    const modalHtml = `
      <!-- 1. EXECUTIVE CONSULTATION & DEALERSHIP BOOKING MODAL -->
      <div id="consultationModal" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="consultModalTitle">
        <div class="bg-[#FFFFFF] border-2 border-[#F5C533] max-w-xl w-full p-6 sm:p-8 rounded-md shadow-2xl relative max-h-[92vh] overflow-y-auto">
          <button type="button" data-close-modal="consultationModal" class="absolute top-5 right-5 w-9 h-9 border border-slate-200 hover:border-[#0A3D1C] text-[#0A3D1C] flex items-center justify-center transition" aria-label="Close consultation modal">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="flex items-center gap-3 mb-3">
            <img src="assets/images/logo-poultry-feed.jpg" alt="Chanda Poultry Feed" class="w-10 h-10 rounded-full border border-[#F5C533]" />
            <img src="assets/images/logo-silage-feed.jpg" alt="Chanda Silage" class="w-10 h-10 rounded-full border border-[#0A3D1C]" />
            <div class="eyebrow m-0">Feed Supply &amp; Corporate Advisory</div>
          </div>

          <h2 id="consultModalTitle" class="font-serif text-2xl sm:text-3xl text-[#0A3D1C] mb-2">Book a Consultation or Dealership Inquiry</h2>
          <p class="text-sm text-[#4A6353] mb-6">
            Inquire about bulk <strong>Chanda Poultry Feed (Maize &amp; Soybean)</strong>, <strong>Chanda Silage (Napier Grass Feed Bales)</strong>, or regional dealership opportunities with <strong>NR Entrepreneur</strong>.
          </p>

          <form id="globalConsultationForm" class="space-y-4" novalidate>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="consultName" class="form-label">Full Name <span class="text-red-700">*</span></label>
                <input type="text" id="consultName" name="name" required class="input-luxury" placeholder="e.g., Rajesh Beniwal" />
              </div>
              <div>
                <label for="consultEmail" class="form-label">Business Email <span class="text-red-700">*</span></label>
                <input type="email" id="consultEmail" name="email" required class="input-luxury" placeholder="name@company.com" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="consultPhone" class="form-label">Phone / WhatsApp <span class="text-red-700">*</span></label>
                <input type="tel" id="consultPhone" name="phone" required class="input-luxury" placeholder="+91 98159 20025" />
              </div>
              <div>
                <label for="consultDate" class="form-label">Preferred Date <span class="text-red-700">*</span></label>
                <input type="date" id="consultDate" name="preferredDate" required class="input-luxury" />
              </div>
            </div>

            <div>
              <label for="consultService" class="form-label">Division / Service Interest <span class="text-red-700">*</span></label>
              <select id="consultService" name="service" required class="input-luxury">
                <option value="">Select primary product or service...</option>
                ${serviceOptions}
                <option value="Mandi Adampur / Haryana Feed Dealership Inquiry">Mandi Adampur / Haryana Feed Dealership Inquiry</option>
              </select>
            </div>

            <div>
              <label for="consultNotes" class="form-label">Order Volume / Farm Details / Requirement</label>
              <textarea id="consultNotes" name="notes" rows="3" class="input-luxury" placeholder="Share flock size, cattle/buffalo count, required bags/bales, or location..."></textarea>
            </div>

            <div id="consultFormStatus" class="hidden p-4 text-sm border rounded-sm" role="status" aria-live="polite"></div>

            <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span class="text-xs text-[#4A6353]">
                <i class="fa-solid fa-phone text-[#0A3D1C] mr-1"></i> Direct Desk: +91 98159 20025
              </span>
              <button type="submit" id="consultSubmitBtn" class="btn-luxury btn-primary-gold w-full sm:w-auto">
                <span>Confirm Consultation Request</span>
                <i class="fa-solid fa-arrow-right text-xs"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 2. COOKIE CONSENT BANNER -->
      <aside id="cookieConsentBanner" aria-label="Cookie Consent Preferences" class="fixed bottom-0 inset-x-0 z-50 bg-[#062611] text-[#FCFBF7] border-t-2 border-[#F5C533] shadow-2xl hidden">
        <div class="container-luxury py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div class="text-xs sm:text-sm text-slate-200 max-w-3xl">
            <strong class="text-[#F5C533] font-serif tracking-wide">Privacy &amp; Cookie Notice:</strong>
            We use essential browser storage to remember your site preferences and enhance your browsing experience.
            <a href="legal.html#cookies" class="text-[#F5C533] underline ml-1 hover:text-white">Read Cookie Policy</a>.
          </div>
          <div class="flex flex-wrap items-center gap-2.5 shrink-0">
            <button type="button" id="cookieEssentialBtn" class="px-4 py-2 text-xs font-medium border border-slate-500 text-slate-200 hover:border-[#F5C533] hover:text-white transition">
              Essential Only
            </button>
            <button type="button" id="cookieAcceptAllBtn" class="px-4 py-2 text-xs font-bold bg-[#F5C533] text-[#062611] hover:bg-[#e5b014] transition">
              Accept All
            </button>
          </div>
        </div>
      </aside>

      <!-- 3. GLOBAL TOAST NOTIFICATION -->
      <div id="luxuryToast" role="status" aria-live="polite" class="fixed bottom-20 right-6 z-50 bg-[#082E16] text-white border border-[#F5C533]/60 px-5 py-3.5 shadow-2xl text-sm flex items-center gap-3 hidden max-w-md rounded-md">
        <i class="fa-solid fa-circle-info text-[#F5C533]"></i>
        <span id="luxuryToastText">Notification</span>
      </div>

      <!-- 4. FLOATING EXECUTIVE B2B QUICK-CONNECT DOCK -->
      <div class="floating-quick-connect" aria-label="Quick Contact Actions">
        <a href="tel:+919815920025" class="hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#041B0C] text-[#F5C533] border border-[#F5C533]/50 shadow-lg hover:border-[#F5C533] transition" title="Call Desk: +91 98159 20025" aria-label="Call +91 98159 20025">
          <i class="fa-solid fa-phone text-xs"></i>
        </a>
        <button type="button" data-whatsapp-cta class="floating-wa-btn" aria-label="WhatsApp Business Inquiry">
          <span class="floating-wa-icon"><i class="fa-brands fa-whatsapp"></i></span>
          <span>WhatsApp Desk <span class="hidden md:inline text-[#F5C533] ml-1">&bull; 98159 20025</span></span>
        </button>
      </div>
    `;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = modalHtml;
    document.body.appendChild(wrapper);

    const dateInput = document.getElementById("consultDate");
    if (dateInput) {
      dateInput.min = new Date().toISOString().split("T")[0];
    }
  }

  function showToast(message) {
    const toast = document.getElementById("luxuryToast");
    const text = document.getElementById("luxuryToastText");
    if (!toast || !text) return;
    text.textContent = message;
    toast.classList.remove("hidden");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
      toast.classList.add("hidden");
    }, 4500);
  }

  window.showLuxuryToast = showToast;

  function openModal(id, preselectedService) {
    const modal = document.getElementById(id);
    if (!modal) return;
    if (preselectedService && id === "consultationModal") {
      const select = document.getElementById("consultService");
      if (select) {
        select.value = preselectedService;
      }
    }
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeAllModals() {
    document.querySelectorAll(".modal-backdrop.open").forEach((m) => {
      m.classList.remove("open");
    });
    document.body.style.overflow = "";
  }

  window.openConsultationModal = function (serviceName) {
    openModal("consultationModal", serviceName);
  };

  function handleWhatsAppClick(e, customMessage) {
    if (e) e.preventDefault();
    const cfg = loadActiveConfig();
    const waNumber = (cfg.contact.whatsappNumber || "919815920025").replace(/[^0-9]/g, "");
    const company = getDisplayCompanyName(cfg);
    const defaultMsg =
      customMessage ||
      `Hello ${company} (NR Entrepreneur) team, I would like to inquire about Chanda Poultry Feed / Chanda Silage (Napier Grass Feed) and discuss a business requirement.`;

    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(defaultMsg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  window.triggerWhatsAppCTA = handleWhatsAppClick;

  function initGlobalEvents() {
    document.addEventListener("click", (e) => {
      const openConsultBtn = e.target.closest("[data-open-consultation]");
      if (openConsultBtn) {
        e.preventDefault();
        const srv = openConsultBtn.getAttribute("data-service") || "";
        window.openConsultationModal(srv);
        return;
      }

      const waBtn = e.target.closest("[data-whatsapp-cta], [href='#whatsapp-cta']");
      if (waBtn) {
        const msg = waBtn.getAttribute("data-whatsapp-msg") || "";
        handleWhatsAppClick(e, msg);
        return;
      }

      const closeBtn = e.target.closest("[data-close-modal]");
      if (closeBtn) {
        closeAllModals();
        return;
      }

      if (e.target.classList && e.target.classList.contains("modal-backdrop")) {
        closeAllModals();
      }
    });

    const consultForm = document.getElementById("globalConsultationForm");
    if (consultForm) {
      consultForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const statusBox = document.getElementById("consultFormStatus");
        const submitBtn = document.getElementById("consultSubmitBtn");
        const name = document.getElementById("consultName").value.trim();
        const email = document.getElementById("consultEmail").value.trim();
        const phone = document.getElementById("consultPhone").value.trim();
        const date = document.getElementById("consultDate").value.trim();
        const service = document.getElementById("consultService").value.trim();
        const notes = document.getElementById("consultNotes").value.trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!name || !emailRegex.test(email) || phone.length < 7 || !date || !service) {
          statusBox.className = "p-4 text-sm border rounded-sm bg-red-50 border-red-300 text-red-800";
          statusBox.innerHTML =
            "<strong>Please check your details:</strong> Complete all required fields with a valid email, phone number, preferred date, and service selection.";
          statusBox.classList.remove("hidden");
          return;
        }

        const cfg = loadActiveConfig();
        const endpoint = cfg.integrations.contactFormEndpoint;

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Processing Request...</span>`;

        const payload = {
          type: "Executive Consultation Request",
          companyTarget: getDisplayCompanyName(cfg),
          name,
          email,
          phone,
          preferredDate: date,
          service,
          notes,
          submittedAt: new Date().toISOString()
        };

        if (endpoint) {
          try {
            const res = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json", Accept: "application/json" },
              body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Endpoint returned status " + res.status);
            statusBox.className = "p-4 text-sm border rounded-sm bg-emerald-50 border-emerald-300 text-emerald-900";
            statusBox.innerHTML = `<strong>Request Received:</strong> Thank you, ${name}. Your consultation request for <em>${service}</em> on <strong>${date}</strong> has been received.`;
            statusBox.classList.remove("hidden");
            consultForm.reset();
          } catch (err) {
            statusBox.className = "p-4 text-sm border rounded-sm bg-red-50 border-red-300 text-red-800";
            statusBox.innerHTML = `<strong>Notice:</strong> Please connect with us directly via WhatsApp or call +91 98159 20025.`;
            statusBox.classList.remove("hidden");
          }
        } else {
          const waMsg = `Hello NR Entrepreneur / Chanda Feeds,\n\n*New Consultation / Order Request*\n• Name: ${name}\n• Phone: ${phone}\n• Email: ${email}\n• Preferred Date: ${date}\n• Division/Service: ${service}\n• Details: ${notes || "N/A"}`;
          const mailSubject = encodeURIComponent(`Consultation & Order Inquiry: ${service} — ${name}`);
          const mailBody = encodeURIComponent(waMsg);

          statusBox.className = "p-4 text-sm border rounded-sm bg-[#F4F7F1] border-[#F5C533] text-[#0A3D1C]";
          statusBox.innerHTML = `
            <div class="font-semibold text-[#0A3D1C] mb-1">
              <i class="fa-solid fa-circle-check text-[#0F5227] mr-1"></i> Inquiry Ready for Direct Dispatch
            </div>
            <p class="text-xs text-[#4A6353] mb-3">
              Thank you, <strong>${name}</strong>. Choose your preferred channel below to send your requirement directly to our Mandi Adampur &amp; Panchkula desk:
            </p>
            <div class="flex flex-wrap gap-2">
              <button type="button" id="consultSendWhatsApp" class="px-3.5 py-2 text-xs font-bold bg-[#0A3D1C] text-[#F5C533] hover:bg-[#0F5227] transition rounded-sm">
                <i class="fa-brands fa-whatsapp mr-1"></i> Send via WhatsApp (+91 98159 20025)
              </button>
              <a href="mailto:rkbeniwal0020@gmail.com?subject=${mailSubject}&body=${mailBody}" class="px-3.5 py-2 text-xs font-semibold border border-[#0A3D1C] text-[#0A3D1C] hover:bg-slate-100 transition rounded-sm inline-flex items-center">
                <i class="fa-solid fa-envelope mr-1.5"></i> Send via Email
              </a>
            </div>
          `;
          statusBox.classList.remove("hidden");

          const waTrigger = document.getElementById("consultSendWhatsApp");
          if (waTrigger) {
            waTrigger.addEventListener("click", (ev) => {
              handleWhatsAppClick(ev, waMsg);
            });
          }
        }

        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Confirm Consultation Request</span><i class="fa-solid fa-arrow-right text-xs"></i>`;
      });
    }
  }

  function initCookieConsent() {
    const banner = document.getElementById("cookieConsentBanner");
    if (!banner) return;

    const existing = localStorage.getItem(STORAGE_KEY_COOKIES);
    if (!existing) {
      banner.classList.remove("hidden");
    }

    const essentialBtn = document.getElementById("cookieEssentialBtn");
    const acceptAllBtn = document.getElementById("cookieAcceptAllBtn");

    if (essentialBtn) {
      essentialBtn.addEventListener("click", () => {
        localStorage.setItem(
          STORAGE_KEY_COOKIES,
          JSON.stringify({ essential: true, analytics: false, updatedAt: new Date().toISOString() })
        );
        banner.classList.add("hidden");
        showToast("Saved preference: Essential cookies only.");
      });
    }

    if (acceptAllBtn) {
      acceptAllBtn.addEventListener("click", () => {
        localStorage.setItem(
          STORAGE_KEY_COOKIES,
          JSON.stringify({ essential: true, analytics: true, updatedAt: new Date().toISOString() })
        );
        banner.classList.add("hidden");
        showToast("Saved preference: All cookies accepted.");
      });
    }

    window.reopenCookiePreferences = function () {
      banner.classList.remove("hidden");
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    injectOfficialLogosIntoHeaderAndFooter();
    applyBrandBindings();
    injectSharedModals();
    hydrateAllPageImages(document);
    initNavigation();
    initScrollReveal();
    initGlobalEvents();
    initCookieConsent();

    if ("MutationObserver" in window && document.body) {
      const imgObserver = new MutationObserver((mutations) => {
        mutations.forEach((m) => {
          m.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              if (node.tagName === "IMG") {
                hydrateImgElement(node);
              } else if (node.querySelectorAll) {
                hydrateAllPageImages(node);
              }
            }
          });
        });
      });
      imgObserver.observe(document.body, { childList: true, subtree: true });
    }
  });
})();
