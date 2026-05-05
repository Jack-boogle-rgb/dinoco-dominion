/* Navbar scroll effect */
function setupNavbarScrollEffect() {
  const navbar = document.getElementById("navbar");

  if (!navbar) return;

  function updateNavbar() {
    if (window.scrollY > 60) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  updateNavbar();
  window.addEventListener("scroll", updateNavbar, { passive: true });
}

/* Mobile menu open/close */
function setupMobileMenu() {
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobile-nav");
  const closeButton = document.getElementById("mobile-close");
  const mobileLinks = mobileNav ? mobileNav.querySelectorAll("a") : [];

  if (!hamburger || !mobileNav || !closeButton) return;

  function openMenu() {
    mobileNav.classList.add("open");
    mobileNav.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    mobileNav.classList.remove("open");
    mobileNav.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  hamburger.addEventListener("click", openMenu);
  closeButton.addEventListener("click", closeMenu);
  mobileLinks.forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

/* Smooth scroll for all anchor links — offset 72px for fixed nav */
function setupSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 72;

      window.scrollTo({
        top: y,
        behavior: "smooth"
      });
    });
  });
}

/* Hero load animations — trigger on DOMContentLoaded */
function triggerHeroLoadAnimations() {
  document.body.classList.add("hero-loaded");
}

/* Join form submission — validate email, hide form, show success */
function setupJoinForm() {
  const form = document.getElementById("join-form");
  const email = document.getElementById("join-email");
  const success = document.getElementById("join-success");

  if (!form || !email || !success) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!email.value.trim() || !email.checkValidity()) {
      email.focus();
      return;
    }

    form.style.transition = "opacity 300ms ease";
    form.style.opacity = "0";

    window.setTimeout(() => {
      form.style.display = "none";
      success.style.display = "block";
      success.style.animation = "fadeIn 400ms ease";
    }, 300);
  });
}

/* Intersection Observer for .animate-on-scroll — threshold 0.15, add class visible */
function setupScrollAnimations() {
  const elements = document.querySelectorAll(".animate-on-scroll");

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, activeObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          activeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((element) => observer.observe(element));
}

/* Compare section bars animation — animate bar heights on scroll into view */
function setupCompareBarsAnimation() {
  const compareSection = document.getElementById("compare");
  const bars = document.querySelector(".growth-bars");

  if (!compareSection || !bars) return;

  if (!("IntersectionObserver" in window)) {
    bars.classList.add("bars-visible");
    return;
  }

  const observer = new IntersectionObserver(
    (entries, activeObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          bars.classList.add("bars-visible");
          activeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 }
  );

  observer.observe(compareSection);
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavbarScrollEffect();
  setupMobileMenu();
  setupSmoothScroll();
  triggerHeroLoadAnimations();
  setupJoinForm();
  setupScrollAnimations();
  setupCompareBarsAnimation();
});
