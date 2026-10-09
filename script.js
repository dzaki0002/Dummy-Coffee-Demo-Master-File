/**
 * script.js — Dummy Coffee Website
 *
 * File JavaScript kustom untuk website company profile Dummy Coffee.
 * Dimuat dengan atribut `defer` setelah Bootstrap 5.3.8 JS Bundle selesai dimuat.
 *
 * Fitur yang akan diimplementasikan:
 *   - Navbar: scroll state (.scrolled) dan active link via IntersectionObserver  [Task 2.3]
 *   - Menu: fungsi filterMenu(category) untuk filter card berdasarkan kategori   [Task 5.3]
 *   - Gallery: fungsi updateGalleryModal(src) untuk mengisi modal lightbox        [Task 7.3]
 *   - Contact: fungsi handleFormSubmit(event) untuk validasi dan konfirmasi form  [Task 10.3]
 *   - Footer: fungsi updateCopyrightYear() untuk mengisi tahun hak cipta dinamis  [Task 11.3]
 *
 * Konvensi:
 *   - Setiap manipulasi DOM dibungkus dalam pengecekan keberadaan elemen (guard)
 *     untuk mencegah runtime error jika elemen tidak ditemukan di halaman.
 *   - Contoh guard: const el = document.getElementById('x'); if (el) { ... }
 */

// =============================================================================
// NAVBAR: Scroll state (.scrolled) dan active link via IntersectionObserver
// Req 2.3 (smooth scroll), Req 2.4 (active link)
// =============================================================================

/**
 * Menambah atau menghapus kelas .scrolled pada #mainNavbar.
 * Dipanggil setiap kali window di-scroll.
 * Kelas .scrolled digunakan CSS untuk mengubah background dari transparan ke solid.
 */
const navbar = document.getElementById("mainNavbar");

if (navbar) {
  // Handler scroll: tambah .scrolled jika sudah lebih dari 50px dari atas
  function handleNavbarScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  // Pasang event listener scroll
  window.addEventListener("scroll", handleNavbarScroll, { passive: true });
  // Jalankan sekali saat load untuk menangani kasus halaman dimuat di tengah
  handleNavbarScroll();

  // -------------------------------------------------------------------------
  // Active link via IntersectionObserver
  // Mengamati setiap <section> dan menandai nav link yang sesuai sebagai .active
  // -------------------------------------------------------------------------
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll("#mainNavbar .nav-link");

  if (sections.length > 0 && navLinks.length > 0) {
    const observerOptions = {
      root: null, // viewport sebagai root
      rootMargin: "-30% 0px -60% 0px", // section dianggap aktif ketika 30% dari atas viewport
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Hapus .active dari semua nav links
          navLinks.forEach((link) => link.classList.remove("active"));

          // Tambah .active ke nav link yang href-nya cocok dengan id section yang terlihat
          const activeLink = document.querySelector(
            `#mainNavbar .nav-link[href="#${entry.target.id}"]`,
          );
          if (activeLink) {
            activeLink.classList.add("active");
          }
        }
      });
    }, observerOptions);

    // Amati setiap section
    sections.forEach((section) => observer.observe(section));
  }
}

// =============================================================================
// SMOOTH SCROLL: Efek gulir halus saat mengklik nav link dengan href="#..."
// Req 2.3
// =============================================================================

// Pilih semua link yang href-nya dimulai dengan '#' (anchor links)
const anchorLinks = document.querySelectorAll('a[href^="#"]');

anchorLinks.forEach((link) => {
  link.addEventListener("click", function (event) {
    const href = this.getAttribute("href");

    // Abaikan link '#' kosong
    if (href === "#") return;

    const targetElement = document.querySelector(href);
    if (targetElement) {
      event.preventDefault();

      // Hitung offset tinggi navbar agar section tidak tersembunyi di balik navbar fixed
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Tutup navbar collapse di mobile setelah link diklik
      const navbarCollapse = document.getElementById("navbarNav");
      if (navbarCollapse && navbarCollapse.classList.contains("show")) {
        // Bootstrap 5: gunakan Collapse API untuk menutup dengan animasi
        const bsCollapse =
          window.bootstrap && bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) {
          bsCollapse.hide();
        }
      }
    }
  });
});

// =============================================================================
// MENU FILTER: filterMenu(category) — tampilkan/sembunyikan card berdasarkan kategori
// Req 5.4 (filter by category), Req 5.5 (filter 'semua' shows all)
// =============================================================================

/**
 * Memfilter card menu berdasarkan kategori yang dipilih.
 * Menyembunyikan card yang tidak cocok dengan menambah kelas 'd-none',
 * dan menampilkan kembali card yang cocok dengan menghapus 'd-none'.
 *
 * @param {string} category - Kategori yang dipilih: 'semua' | 'kopi' | 'non-kopi' | 'cemilan' | 'makanan-berat' | 'dessert'
 */
function filterMenu(category) {
  // Guard: pastikan ada elemen menu-item sebelum melakukan apa-apa
  const menuItems = document.querySelectorAll(".menu-item");
  if (menuItems.length === 0) return;

  menuItems.forEach((item) => {
    const itemCategory = item.getAttribute("data-category");

    if (category === "semua" || itemCategory === category) {
      // Tampilkan: hapus kelas d-none agar card terlihat
      item.classList.remove("d-none");
    } else {
      // Sembunyikan: tambah kelas d-none Bootstrap agar card tidak terlihat
      item.classList.add("d-none");
    }
  });
}

// Pasang event listener pada semua tombol filter menu
const filterButtons = document.querySelectorAll(".menu-filter-btn");

if (filterButtons.length > 0) {
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Ambil nilai filter dari atribut data-filter tombol yang diklik
      const selectedFilter = this.getAttribute("data-filter");

      // Perbarui kelas .active: hapus dari semua tombol, tambah ke tombol yang diklik
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      // Panggil filterMenu dengan filter yang dipilih
      filterMenu(selectedFilter);
    });
  });
}

// =============================================================================
// GALLERY MODAL: updateGalleryModal(src) — isi src #modalImage saat foto diklik
// Req 7.2
// =============================================================================

/**
 * Mengisi atribut src pada elemen #modalImage di dalam galleryModal.
 * Dipanggil dari event listener 'show.bs.modal' pada galleryModal.
 *
 * @param {string} src - URL gambar yang akan ditampilkan di modal
 */
// function updateGalleryModal(src) {
//   const modalImage = document.getElementById("modalImage");
//   if (modalImage) {
//     modalImage.src = src;
//   }
// }

// // Pasang event listener Bootstrap 'show.bs.modal' pada #galleryModal
// const galleryModal = document.getElementById("galleryModal");

// if (galleryModal) {
//   galleryModal.addEventListener("show.bs.modal", function (event) {
//     // relatedTarget adalah elemen yang memicu modal (foto yang diklik)
//     const triggerElement = event.relatedTarget;
//     if (triggerElement) {
//       // Ambil URL gambar dari atribut data-src foto yang diklik
//       const imageSrc = triggerElement.getAttribute("data-src");
//       if (imageSrc) {
//         updateGalleryModal(imageSrc);
//       }
//     }
//   });

//   // Bersihkan src gambar saat modal ditutup untuk menghindari kilasan gambar lama
//   galleryModal.addEventListener("hidden.bs.modal", function () {
//     updateGalleryModal("");
//   });
// }

// =============================================================================
// CONTACT FORM: handleFormSubmit(event) — validasi Bootstrap 5 + pesan sukses
// Req 9.2 (pesan konfirmasi), Req 9.3 (validasi field kosong)
// =============================================================================

/**
 * Menangani pengiriman form kontak melalui WhatsApp.
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;

  // Aktifkan Bootstrap validation
  form.classList.add("was-validated");

  // Hentikan jika form tidak valid
  if (!form.checkValidity()) {
    return;
  }

  // Ambil data dari form
  const nama = document.getElementById("contactName").value.trim();
  const pesan = document.getElementById("contactMessage").value.trim();

  // Nomor WhatsApp Dummy Coffee
  const nomorWhatsApp = "6281234567890";

  // Buat isi pesan WhatsApp
  const teksPesan = `Halo Dummy Coffee,

Nama: ${nama}

Pesan:
${pesan}`;

  // Encode pesan supaya aman dimasukkan ke URL
  const pesanEncoded = encodeURIComponent(teksPesan);

  // Buat URL WhatsApp
  const whatsappURL = `https://wa.me/${nomorWhatsApp}?text=${pesanEncoded}`;

  // Buka WhatsApp
  window.open(whatsappURL, "_blank");

  // Reset form
  form.reset();
  form.classList.remove("was-validated");
}

// Pasang event listener
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", handleFormSubmit);
}

// =============================================================================
// FOOTER — Tahun copyright dinamis
// Req 10.2
// =============================================================================

/**
 * Mengisi #currentYear dengan tahun saat ini secara dinamis.
 * Dipanggil langsung saat skrip dimuat (setelah DOM tersedia karena defer).
 */
function updateCopyrightYear() {
  const yearElement = document.getElementById("currentYear");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// Panggil langsung — script.js dimuat dengan defer, DOM sudah siap
updateCopyrightYear();
