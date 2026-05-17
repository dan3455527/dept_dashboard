const body = document.querySelector('body'),
      sidebar = body.querySelector('nav'),
      toggle = body.querySelector(".toggle"),
      searchBtn = body.querySelector(".search-box"),
      modeSwitch = body.querySelector(".toggle-switch"),
      modeText = body.querySelector(".mode-text"),
      navLinks = body.querySelectorAll(".nav-link");

// Toggle Sidebar
toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
});

// Open sidebar when search box is clicked
searchBtn.addEventListener("click", () => {
    sidebar.classList.remove("close");
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

// Update active state on nav links
navLinks.forEach(link => {
    link.addEventListener("click", function() {
        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove("active"));
        // Add active class to clicked link
        this.classList.add("active");
    });
});

// Toggle sub-menus
const submenuToggles = body.querySelectorAll(".submenu-toggle");
submenuToggles.forEach(toggle => {
    toggle.addEventListener("click", function(e) {
        e.preventDefault(); // Prevent default link behavior
        
        // Auto-expand sidebar if closed
        if (sidebar.classList.contains("close")) {
            sidebar.classList.remove("close");
        }
        
        // Toggle the sub-menu
        this.parentElement.classList.toggle("showMenu");
    });
});
