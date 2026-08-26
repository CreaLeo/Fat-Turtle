/* ============================================================
   THE FAT TURTLE — script.js

   Five small, independent pieces:
     1. Image sources pulled from the CSS variables
     2. Mobile menu
     3. Header state on scroll
     4. Active navigation item (scroll spy)
     5. Reveal-on-scroll + the placeholder booking form

   No libraries, no build step — this file runs as-is.
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  /* ---- 1. Images ------------------------------------------
     The <img> in the intro takes its source from the CSS
     variable --img-drink, so every image URL stays in one
     place at the top of style.css. If a photo fails to load,
     we hide it and the warm gradient underneath shows instead.
  --------------------------------------------------------- */
  function urlFromCssVar(name) {
    var raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    var match = raw.match(/url\(["']?(.+?)["']?\)/);
    return match ? match[1] : "";
  }

  document.querySelectorAll("[data-src-var]").forEach(function (img) {
    var src = urlFromCssVar(img.getAttribute("data-src-var"));
    if (src) img.src = src;
  });

  document.querySelectorAll(".photo").forEach(function (img) {
    img.addEventListener("error", function () {
      img.classList.add("is-broken");
    });
  });


  /* ---- 2. Mobile menu ------------------------------------- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobile-menu");

  function closeMenu() {
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
    menu.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(function () {
      if (burger.getAttribute("aria-expanded") === "false") menu.hidden = true;
    }, 450);
  }

  function openMenu() {
    menu.hidden = false;
    // Next frame, so the browser registers the change before fading in.
    requestAnimationFrame(function () { menu.classList.add("is-open"); });
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
  }

  burger.addEventListener("click", function () {
    if (burger.getAttribute("aria-expanded") === "true") closeMenu();
    else openMenu();
  });

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
      closeMenu();
      burger.focus();
    }
  });

  // If the window grows past the mobile breakpoint, tidy up.
  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1024 && burger.getAttribute("aria-expanded") === "true") {
      closeMenu();
    }
  });


  /* ---- 3. Header state on scroll -------------------------- */
  var nav = document.getElementById("nav");

  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });


  /* ---- 4. Active navigation item -------------------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle(
            "is-active",
            link.getAttribute("href") === "#" + entry.target.id
          );
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(function (section) { spy.observe(section); });
  }


  /* ---- 5. Reveal on scroll -------------------------------- */
  var reveals = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealer = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        // A small stagger so grouped items arrive one after another.
        setTimeout(function () {
          entry.target.classList.add("is-visible");
        }, i * 110);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    reveals.forEach(function (el) { revealer.observe(el); });
  }


  /* ---- Booking form (placeholder) -------------------------
     There is no booking system behind this yet, so the form
     simply confirms the selection. Swap this out when you
     connect a real reservation provider.
  --------------------------------------------------------- */
  var form = document.getElementById("reserve-form");
  var note = document.getElementById("reserve-note");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var date = data.get("date");
    var time = data.get("time");
    var people = data.get("people");

    if (!date || !time || !people) {
      note.textContent = "Please choose a date, a time and the number of guests.";
      return;
    }
    note.textContent = "Thank you — " + people + ", " + date.toLowerCase() +
                       " at " + time + ". We'll be in touch to confirm.";
  });


  /* ---- Footer year ---------------------------------------- */
  document.getElementById("year").textContent = new Date().getFullYear();

})();
