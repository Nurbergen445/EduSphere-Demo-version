// Функция обновления времени
function updateTime() {
  const timeElement = document.querySelector(".current-time");
  const now = new Date();

  // Форматирование времени
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  timeElement.textContent = `${hours}:${minutes}:${seconds}`;

  // Подсветка текущего урока
  highlightCurrentLesson();
}

// Обновление времени каждую секунду
setInterval(updateTime, 1000);
updateTime(); // Начальное обновление

// Функция подсветки текущего урока
function highlightCurrentLesson() {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const scheduleItems = document.querySelectorAll(".schedule-item");

  scheduleItems.forEach((item) => {
    const timeText = item.querySelector(".time").textContent;
    const [startStr, endStr] = timeText.split(" - ");

    const [startHour, startMin] = startStr.split(":").map(Number);
    const [endHour, endMin] = endStr.split(":").map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (currentTime >= startTime && currentTime <= endTime) {
      item.style.background = document.body.classList.contains("light-theme")
        ? "rgba(76, 110, 245, 0.1)"
        : "rgba(102, 126, 234, 0.2)";
      item.style.borderColor = "var(--accent-primary)";
      item.style.boxShadow = document.body.classList.contains("light-theme")
        ? "0 4px 15px rgba(76, 110, 245, 0.15)"
        : "0 4px 15px rgba(102, 126, 234, 0.3)";
      item.querySelector(".time-block").style.color = "var(--accent-secondary)";
    } else {
      item.style.background = document.body.classList.contains("light-theme")
        ? "#ffffff"
        : "rgba(255, 255, 255, 0.05)";
      item.style.borderColor = document.body.classList.contains("light-theme")
        ? "#e9ecef"
        : "rgba(255, 255, 255, 0.1)";
      item.style.boxShadow = document.body.classList.contains("light-theme")
        ? "0 2px 4px rgba(0, 0, 0, 0.05)"
        : "none";
      item.querySelector(".time-block").style.color = "var(--accent-primary)";
    }
  });
}

// Переключение темы по клику на месяц
const currentTime = document.querySelector(".current-time");
if (currentTime) {
  currentTime.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const themeIcon = document.querySelector(".theme-btn .material-icons");
    if (themeIcon) {
      themeIcon.textContent = document.body.classList.contains("light-theme")
        ? "light_mode"
        : "dark_mode";
    }
    highlightCurrentLesson(); // Обновляем стили уроков при смене темы
  });
}

// Плавная прокрутка расписания
const scheduleScroll = document.querySelector(".schedule-scroll");
if (scheduleScroll) {
  let isScrolling = false;
  let startX;
  let scrollLeft;

  scheduleScroll.addEventListener("mousedown", (e) => {
    isScrolling = true;
    startX = e.pageX - scheduleScroll.offsetLeft;
    scrollLeft = scheduleScroll.scrollLeft;
  });

  scheduleScroll.addEventListener("mouseleave", () => {
    isScrolling = false;
  });

  scheduleScroll.addEventListener("mouseup", () => {
    isScrolling = false;
  });

  scheduleScroll.addEventListener("mousemove", (e) => {
    if (!isScrolling) return;
    e.preventDefault();
    const x = e.pageX - scheduleScroll.offsetLeft;
    const walk = (x - startX) * 2;
    scheduleScroll.scrollLeft = scrollLeft - walk;
  });

  // Плавная прокрутка колесиком
  scheduleScroll.addEventListener("wheel", (e) => {
    e.preventDefault();
    scheduleScroll.scrollLeft += e.deltaY;
  });
}

// Инициализация при загрузке
document.addEventListener("DOMContentLoaded", () => {
  updateTime();
  highlightCurrentLesson();
});

// Функция для отображения приветствия
function updateGreeting() {
  const welcomeTitle = document.querySelector(".welcome-section h2");
  const hours = new Date().getHours();

  let greeting = "";
  if (hours >= 5 && hours < 12) {
    greeting = "Доброе утро";
  } else if (hours >= 12 && hours < 18) {
    greeting = "Добрый день";
  } else if (hours >= 18 && hours < 23) {
    greeting = "Добрый вечер";
  } else {
    greeting = "Доброй ночи";
  }

  if (welcomeTitle) {
    welcomeTitle.textContent = greeting + "!";
  }
}

// Обновление приветствия при загрузке
document.addEventListener("DOMContentLoaded", () => {
  updateGreeting();
  // Добавляем горизонтальную прокрутку колесиком мыши
  const scheduleScroll = document.querySelector(".schedule-scroll");
  if (scheduleScroll) {
    scheduleScroll.addEventListener("wheel", (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        scheduleScroll.scrollLeft += e.deltaY;
      }
    });
  }
});
