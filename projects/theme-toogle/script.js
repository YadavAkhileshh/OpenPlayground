// 脚本放在body之前，确保在渲染body之前就添加对应主题类
// (function () {
//   try {
//     const theme = localStorage.getItem("app-theme");
//     if (theme === "dark") {
//       document.documentElement.classList.add("dark");
//     }
//   } catch (e) {
//     console.warn("Could not access localStorage for theme setting.", e);
//   }
// })();

// 将脚本放在 </body> 之前, 确保所有 DOM 元素已加载
const themeToggleButton = document.getElementById("theme-toggle-btn");
const docElement = document.documentElement;

function updateTheme(isDarkMode) {
  docElement.classList.toggle("dark", isDarkMode);
  themeToggleButton.setAttribute("aria-checked", isDarkMode);
  const newLabel = isDarkMode ? "切换到亮色主题" : "切换到暗色主题";
  themeToggleButton.setAttribute("aria-label", newLabel);
  try {
    localStorage.setItem("app-theme", isDarkMode ? "dark" : "light");
  } catch (e) {
    console.warn("Could not save theme to localStorage.", e);
  }
}

function handleThemeToggleClick() {
  docElement.classList.add("is-animating");
  const isDarkMode = docElement.classList.contains("dark");
  updateTheme(!isDarkMode);
}

function initializeTheme() {
  const isDarkMode = docElement.classList.contains("dark");
  updateTheme(isDarkMode);
}

themeToggleButton.addEventListener("click", handleThemeToggleClick);
const themeContainer = document.querySelector(".theme-toggle__container");
themeContainer.addEventListener("transitionend", handleTransitionEnd);
initializeTheme();
