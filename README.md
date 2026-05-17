# 📊 APID-8-01 Department Dashboard

A premium, highly responsive, and modern department dashboard shell designed for displaying various operations reports seamlessly. Built using HTML5, CSS3, JavaScript, Bootstrap 5, and Boxicons.

---

## 📸 Showcase

Here is a preview of the APID-8-01 Department Dashboard:

![Department Dashboard Showcase](IMG/homepage.png)

---

## ✨ Features

- **Responsive Sidebar:** Collapsible navigation drawer featuring perfect alignment, auto-hiding navigation text, and optimized active state indicators.
- **Interactive Multi-Level Menus:** Supports nested sub-menus with smooth vertical expanding transitions and localized non-inheriting active backgrounds.
- **Light / Dark Mode Toggle:** Native toggling with micro-animations that adjusts the entire dashboard to high-contrast dark colors seamlessly.
- **Isolated Sandbox Viewport:** Employs a centered, responsive iframe window to load different department reports (`dashboard_report.html`, `revenue_report.html`, etc.) dynamically without page reloads.

---

## 📁 File Structure

```text
WEB/
├── index.html              # Main dashboard layout and sidebar shell
├── style.css               # Core styling, responsive transitions, & layout overrides
├── script.js              # Sidebar toggle, submenu controller, & dark mode logic
├── README.md               # Documentation and project overview
├── IMG/
│   └── homepage.png        # Dashboard showcase screenshot
└── [Local assets/dependencies (Bootstrap 5, Boxicons)]
```

---

## 🚀 Getting Started

Simply open `index.html` directly in your preferred web browser to view the application:

```bash
# To open on macOS
open index.html

# Or serve locally using npm/http-server
npx http-server .
```

---

## 🛠️ Technology Stack

- **HTML5 & CSS3** (Vanilla Flexbox & Grid architectures)
- **Vanilla JavaScript** (ES6 components)
- **Bootstrap v5** (Grid foundation)
- **Boxicons** (Material icon typography)
