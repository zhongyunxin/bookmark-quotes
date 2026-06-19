// BookMark Shared Application Logic

// 1. Authentication Configuration (Anyone can log in with any ID/PW)

function checkAuth() {
  const isLogin = localStorage.getItem("isLogin") === "true";
  const path = window.location.pathname;
  const isLoginPage = path.endsWith("login.html");
  
  if (!isLogin && !isLoginPage) {
    // Redirect to login page
    // Resolve relative path properly for file:// protocol and servers
    const currentDir = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
    window.location.href = currentDir + "login.html";
  } else if (isLogin && isLoginPage) {
    // Redirect to main page
    const currentDir = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
    window.location.href = currentDir + "index.html";
  }
}

// Check auth immediately before page renders to prevent flashing
checkAuth();

// 2. LocalStorage Quotes Database Helpers
const STORAGE_KEY = "bookmark_quotes";

function getQuotes() {
  const quotes = localStorage.getItem(STORAGE_KEY);
  return quotes ? JSON.parse(quotes) : [];
}

function saveQuote(quoteData) {
  const quotes = getQuotes();
  const now = new Date();
  const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  
  if (quoteData.id) {
    // Update existing quote
    const index = quotes.findIndex(q => q.id === quoteData.id);
    if (index !== -1) {
      quotes[index] = {
        ...quotes[index],
        title: quoteData.title,
        author: quoteData.author,
        quote: quoteData.quote,
        memo: quoteData.memo,
        updatedAt: formattedDate
      };
    }
  } else {
    // Add new quote
    const newQuote = {
      id: "quote_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      title: quoteData.title,
      author: quoteData.author,
      quote: quoteData.quote,
      memo: quoteData.memo || "",
      createdAt: formattedDate
    };
    quotes.push(newQuote);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

function deleteQuote(id) {
  let quotes = getQuotes();
  quotes = quotes.filter(q => q.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

function getQuote(id) {
  const quotes = getQuotes();
  return quotes.find(q => q.id === id) || null;
}

// 3. Theme Toggle management
function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  const theme = savedTheme || (systemPrefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
}

// 4. Common Layout Injection (Header and Footer)
function injectLayout() {
  const path = window.location.pathname;
  const isLoginPage = path.endsWith("login.html");
  
  // Inject Header (Only if logged in)
  if (!isLoginPage) {
    const userId = localStorage.getItem("userId") || "사용자";
    const header = document.createElement("header");
    header.innerHTML = `
      <div class="header-container">
        <a href="index.html" class="logo">
          <span class="logo-icon">📖</span> BookMark
        </a>
        <div class="nav-links">
          <span class="user-badge">👤 ${userId}님</span>
          <button onclick="location.href='index.html'" class="btn btn-text">메인으로</button>
          <button onclick="location.href='write.html'" class="btn btn-primary">글쓰기 +</button>
          <button id="themeToggleBtn" class="theme-toggle" title="테마 변경">
            <span class="dark-icon">🌙</span>
            <span class="light-icon">☀️</span>
          </button>
          <button id="logoutBtn" class="btn btn-secondary">로그아웃</button>
        </div>
      </div>
    `;
    document.body.insertBefore(header, document.body.firstChild);
    
    // Wire logout functionality
    document.getElementById("logoutBtn").addEventListener("click", () => {
      showConfirmModal(
        "로그아웃 하시겠습니까?",
        "로그아웃하시면 첫 화면으로 이동합니다.",
        () => {
          localStorage.removeItem("isLogin");
          localStorage.removeItem("userId");
          const currentDir = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
          window.location.href = currentDir + "login.html";
        }
      );
    });
    
    // Wire theme toggle
    document.getElementById("themeToggleBtn").addEventListener("click", toggleTheme);
  }
  
  // Inject Footer (Common to all pages)
  const footer = document.createElement("footer");
  footer.innerHTML = `
    <div class="footer-container">
      <p>© 2026 BookMark. 좋은 문장을 모아요</p>
    </div>
  `;
  document.body.appendChild(footer);
}

// 5. Custom Modal Dialogs (to replace standard alert/confirm)
function showCustomAlert(message) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-title">알림</div>
      <div class="modal-desc">${message}</div>
      <div class="modal-actions">
        <button class="btn btn-primary close-modal-btn">확인</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  overlay.querySelector(".close-modal-btn").addEventListener("click", () => {
    overlay.classList.remove("active");
    setTimeout(() => overlay.remove(), 250);
  });
}

function showConfirmModal(title, description, onConfirm) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active";
  overlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-title">${title}</div>
      <div class="modal-desc">${description}</div>
      <div class="modal-actions">
        <button class="btn btn-secondary cancel-modal-btn">취소</button>
        <button class="btn btn-danger confirm-modal-btn">확인</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  const closeModal = () => {
    overlay.classList.remove("active");
    setTimeout(() => overlay.remove(), 250);
  };
  
  overlay.querySelector(".cancel-modal-btn").addEventListener("click", closeModal);
  overlay.querySelector(".confirm-modal-btn").addEventListener("click", () => {
    onConfirm();
    closeModal();
  });
}

// Initialize theme on load
initTheme();

// Run layout injection after DOM content loads
document.addEventListener("DOMContentLoaded", () => {
  injectLayout();
});
