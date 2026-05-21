const body = document.querySelector('body'),
      sidebar = body.querySelector('nav'),
      toggle = body.querySelector(".toggle"),
      homeLink = body.querySelector(".home-link"),
      searchBtn = body.querySelector(".search-box"),
      modeSwitch = body.querySelector(".toggle-switch"),
      modeText = body.querySelector(".mode-text"),
      navLinks = body.querySelectorAll(".nav-link"),
      submenuLinks = body.querySelectorAll(".sub-menu a"),
      submenuWraps = body.querySelectorAll(".sub-menu-wrap");

let openSubmenus = Array.from(submenuWraps)
    .filter(menu => menu.classList.contains("showMenu") || menu.dataset.defaultOpen === "true");

function rememberOpenSubmenus() {
    openSubmenus = Array.from(submenuWraps).filter(menu => menu.classList.contains("showMenu"));
}

function collapseSubmenus() {
    submenuWraps.forEach(menu => menu.classList.remove("showMenu"));
}

function restoreOpenSubmenus() {
    collapseSubmenus();
    openSubmenus.forEach(menu => menu.classList.add("showMenu"));
}

if (sidebar.classList.contains("close")) {
    collapseSubmenus();
} else {
    restoreOpenSubmenus();
}

// Toggle Sidebar
toggle.addEventListener("click", () => {
    if (sidebar.classList.contains("close")) {
        sidebar.classList.remove("close");
        restoreOpenSubmenus();
    } else {
        rememberOpenSubmenus();
        collapseSubmenus();
        sidebar.classList.add("close");
    }
});

// Open sidebar when search box is clicked
searchBtn.addEventListener("click", () => {
    sidebar.classList.remove("close");
    restoreOpenSubmenus();
});

// Check local storage for dark mode preference
if(localStorage.getItem('mode') === 'dark') {
    body.classList.add('dark');
    modeText.innerText = "Light mode";
}

// Toggle Dark Mode
modeSwitch.addEventListener("click", () => {
    body.classList.toggle("dark");
    
    if(body.classList.contains("dark")){
        modeText.innerText = "Light mode";
        localStorage.setItem('mode', 'dark');
    } else {
        modeText.innerText = "Dark mode";
        localStorage.setItem('mode', 'light');
    }
});

// Toggle sub-menus
const submenuToggles = body.querySelectorAll(".submenu-toggle");
submenuToggles.forEach(submenuToggle => {
    submenuToggle.addEventListener("click", function(e) {
        e.preventDefault();

        if (sidebar.classList.contains("close")) {
            sidebar.classList.remove("close");
            restoreOpenSubmenus();
            return;
        }

        this.parentElement.classList.toggle("showMenu");
        rememberOpenSubmenus();
    });
});

submenuLinks.forEach(link => {
    link.addEventListener("click", function(e) {
        if (this.getAttribute("href") === "#") {
            e.preventDefault();
        }

        navLinks.forEach(navLink => navLink.classList.remove("active"));
        submenuLinks.forEach(submenuLink => submenuLink.classList.remove("active"));

        this.classList.add("active");
        this.closest(".nav-link").classList.add("active");
    });
});

homeLink.addEventListener("click", () => {
    navLinks.forEach(navLink => navLink.classList.remove("active"));
    submenuLinks.forEach(submenuLink => submenuLink.classList.remove("active"));
});
