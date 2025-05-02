// Инициализация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBm4UpNbQI3yzW54hIXzkznymPZHmcYQOU",
  authDomain: "iqschool-f8cb2.firebaseapp.com",
  projectId: "iqschool-f8cb2",
  storageBucket: "iqschool-f8cb2.firebasestorage.app",
  messagingSenderId: "392062086132",
  appId: "1:392062086132:web:641395409a56bae579a7a1",
  measurementId: "G-46RCVH74YB",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const storage = firebase.storage();

// Проверка авторизации
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    document.getElementById("userEmail").textContent = user.email;
  }
});

// Навигация
document.addEventListener("DOMContentLoaded", () => {
  // Инициализация текущего времени
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);

  // Обработка навигации
  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".content-section");

  // Функция для обновления активного состояния
  function updateActiveSection(hash) {
    const targetId = hash.replace("#", "");

    // Убираем класс active у всех элементов
    navItems.forEach((item) => {
      item.classList.remove("active");
      // Убираем эффект нажатия у всех иконок
      const icon = item.querySelector(".material-icons");
      if (icon) {
        icon.style.transform = "scale(1)";
      }
    });
    sections.forEach((section) => section.classList.remove("active"));

    // Находим нужный элемент навигации и секцию
    const targetNav = document.querySelector(`.nav-item[href="${hash}"]`);
    const targetSection = document.getElementById(targetId);

    // Добавляем класс active и анимацию
    if (targetNav) {
      targetNav.classList.add("active");
      // Добавляем эффект нажатия иконке
      const icon = targetNav.querySelector(".material-icons");
      if (icon) {
        icon.style.transform = "scale(0.9)";
        setTimeout(() => {
          icon.style.transform = "scale(1)";
        }, 200);
      }
    }

    if (targetSection) {
      targetSection.classList.add("active");
      // Добавляем анимацию появления
      targetSection.style.animation = "none";
      targetSection.offsetHeight; // Форсируем reflow
      targetSection.style.animation = "slideIn 0.3s ease-out forwards";
    }
  }

  // Обработка клика по навигации
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault(); // Предотвращаем стандартное поведение ссылки
      const hash = item.getAttribute("href");

      // Обновляем URL без перезагрузки страницы
      window.history.pushState({}, "", hash);

      // Обновляем активную секцию
      updateActiveSection(hash);

      // Добавляем эффект нажатия на иконку
      const icon = item.querySelector(".material-icons");
      if (icon) {
        icon.style.transform = "scale(0.9)";
        setTimeout(() => {
          icon.style.transform = "scale(1)";
        }, 200);
      }
    });

    // Добавляем эффект при наведении
    item.addEventListener("mouseenter", () => {
      const icon = item.querySelector(".material-icons");
      if (icon) {
        icon.style.transition = "transform 0.2s ease";
        icon.style.transform = "scale(1.1)";
      }
    });

    item.addEventListener("mouseleave", () => {
      const icon = item.querySelector(".material-icons");
      if (icon && !item.classList.contains("active")) {
        icon.style.transform = "scale(1)";
      }
    });
  });

  // Обработка изменения хэша в URL
  window.addEventListener("popstate", () => {
    const hash = window.location.hash || "#home";
    updateActiveSection(hash);
  });

  // Инициализация начальной секции
  const initialHash = window.location.hash || "#home";
  updateActiveSection(initialHash);

  // Первоначальное обновление
  updateRealTime();
  updateCurrentLesson();

  // Обновление каждую секунду
  setInterval(updateRealTime, 1000);

  // Обновление текущего урока каждую минуту
  setInterval(updateCurrentLesson, 60000);
});

// Обновление текущего времени
function updateCurrentTime() {
  const timeElement = document.getElementById("currentTime");
  const now = new Date();
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  timeElement.textContent = now.toLocaleTimeString("ru-RU", options);
}

// Инициализация PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js";

// Обработка загрузки файлов
let currentPdf = null;
let currentPage = 1;
let totalPages = 1;

document.getElementById("fileUpload").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    // Создаем элемент файла в списке
    const fileItem = createFileItem(file);
    document.getElementById("fileList").appendChild(fileItem);

    // Загружаем файл в Firebase Storage
    const storageRef = storage.ref();
    const fileRef = storageRef.child(
      `files/${auth.currentUser.uid}/${file.name}`
    );
    await fileRef.put(file);

    // Получаем URL файла
    const fileUrl = await fileRef.getDownloadURL();

    // Обновляем элемент файла
    updateFileItem(fileItem, file, fileUrl);

    // Если это PDF, добавляем возможность просмотра
    if (file.type === "application/pdf") {
      addPdfViewerToItem(fileItem, fileRef);
    }
  } catch (error) {
    console.error("Ошибка загрузки файла:", error);
    alert("Произошла ошибка при загрузке файла");
  }
});

function createFileItem(file) {
  const fileItem = document.createElement("div");
  fileItem.className = "file-item";
  fileItem.innerHTML = `
    <span class="material-icons">${getFileIcon(file.type)}</span>
    <span class="file-name">${file.name}</span>
    <span class="file-size">${formatFileSize(file.size)}</span>
    <div class="file-actions">
      <div class="upload-progress">Загрузка...</div>
    </div>
  `;

  // Добавляем обработчик клика на весь элемент
  fileItem.addEventListener("click", (e) => {
    // Проверяем, не кликнули ли мы по кнопкам действий
    if (!e.target.closest(".file-actions")) {
      handleFileClick(file);
    }
  });

  return fileItem;
}

function updateFileItem(fileItem, file, fileUrl) {
  const actionsDiv = fileItem.querySelector(".file-actions");
  actionsDiv.innerHTML = `
    <button class="file-action" onclick="downloadFile('${fileUrl}', event)">
      <span class="material-icons">download</span>
    </button>
    <button class="file-action" onclick="deleteFile('${file.name}', event)">
      <span class="material-icons">delete</span>
    </button>
  `;

  // Сохраняем URL файла в data-атрибуте
  fileItem.dataset.fileUrl = fileUrl;
}

function handleFileClick(file) {
  const fileItem = document.querySelector(
    `.file-item[data-name="${file.name}"]`
  );
  const fileUrl = fileItem.dataset.fileUrl;

  if (file.type === "application/pdf") {
    openPdf(fileUrl);
  } else if (file.type.startsWith("image/")) {
    // Для изображений открываем в новом окне
    window.open(fileUrl, "_blank");
  } else {
    // Для остальных файлов предлагаем скачать
    downloadFile(fileUrl);
  }
}

function getFileIcon(type) {
  switch (type) {
    case "application/pdf":
      return "picture_as_pdf";
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "description";
    default:
      return "insert_drive_file";
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

async function openPdf(url) {
  const pdfViewer = document.getElementById("pdfViewer");
  const pdfFrame = document.getElementById("pdfFrame");

  // Устанавливаем URL в iframe
  pdfFrame.src = url;

  // Показываем просмотрщик
  pdfViewer.classList.remove("hidden");
}

async function downloadFile(url, event) {
  if (event) {
    event.stopPropagation(); // Предотвращаем всплытие события
  }
  window.open(url, "_blank");
}

async function deleteFile(fileName, event) {
  if (event) {
    event.stopPropagation(); // Предотвращаем всплытие события
  }

  if (!confirm("Вы уверены, что хотите удалить этот файл?")) return;

  try {
    const fileRef = storage.ref(`files/${auth.currentUser.uid}/${fileName}`);
    await fileRef.delete();

    // Удаляем элемент из DOM
    const fileItems = document.querySelectorAll(".file-item");
    for (const item of fileItems) {
      if (item.querySelector(".file-name").textContent === fileName) {
        item.remove();
        break;
      }
    }
  } catch (error) {
    console.error("Ошибка удаления файла:", error);
    alert("Ошибка при удалении файла");
  }
}

// Закрытие PDF просмотрщика
document.getElementById("closePdf").addEventListener("click", () => {
  const pdfViewer = document.getElementById("pdfViewer");
  const pdfFrame = document.getElementById("pdfFrame");
  pdfViewer.classList.add("hidden");
  pdfFrame.src = "";
});

// Заметки
const noteInput = document.getElementById("noteInput");
const saveNoteBtn = document.getElementById("saveNote");
const notesList = document.getElementById("notesList");

saveNoteBtn.addEventListener("click", () => {
  const noteText = noteInput.value.trim();
  if (noteText) {
    const note = {
      text: noteText,
      date: new Date().toLocaleString(),
    };

    // Сохранение в localStorage
    const notes = JSON.parse(localStorage.getItem("notes") || "[]");
    notes.push(note);
    localStorage.setItem("notes", JSON.stringify(notes));

    // Добавление в список
    addNoteToList(note);
    noteInput.value = "";
  }
});

function addNoteToList(note) {
  const noteItem = document.createElement("div");
  noteItem.className = "note-item";
  noteItem.innerHTML = `
        <p>${note.text}</p>
        <small>${note.date}</small>
    `;
  notesList.appendChild(noteItem);
}

// Загрузка сохраненных заметок
function loadNotes() {
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  notes.forEach((note) => addNoteToList(note));
}

// Интерактивная доска
const canvas = document.getElementById("whiteboardCanvas");
const ctx = canvas.getContext("2d");
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Установка размера canvas
function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Обработчики событий рисования
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

function startDrawing(e) {
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
}

function draw(e) {
  if (!isDrawing) return;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.strokeStyle = document.getElementById("colorPicker").value;
  ctx.lineWidth = document.getElementById("brushSize").value;
  ctx.lineCap = "round";
  ctx.stroke();

  [lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopDrawing() {
  isDrawing = false;
}

document.getElementById("clearBoard").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Инициализация
loadNotes();

// Расписание
const schedule = [
  { time: "8:20 - 9:05", subject: "IT", room: "10G", teacher: "Smith J." },
  { time: "9:05 - 9:45", subject: "IT", room: "10G", teacher: "Smith J." },
  { time: "10:35 - 11:20", subject: "IEL", room: "10A", teacher: "Johnson M." },
  {
    time: "11:20 - 12:10",
    subject: "EHT",
    room: "10A",
    teacher: "Williams K.",
  },
  { time: "12:55 - 13:45", subject: "Lunch", room: "L", teacher: "" },
  {
    time: "14:30 - 15:20",
    subject: "Kaz",
    room: "10G",
    teacher: "Akhmetov A.",
  },
  { time: "15:25 - 16:05", subject: "Imt", room: "10G", teacher: "Brown R." },
];

function updateSchedule() {
  const scheduleList = document.getElementById("todaySchedule");
  scheduleList.innerHTML = "";

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  schedule.forEach((lesson) => {
    const [startTime, endTime] = lesson.time.split(" - ");
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const lessonStartTime = startHour * 60 + startMinute;
    const lessonEndTime = endHour * 60 + endMinute;

    const lessonDiv = document.createElement("div");
    lessonDiv.className = "schedule-item";

    // Определяем статус урока
    let status = "";
    if (currentTime >= lessonStartTime && currentTime <= lessonEndTime) {
      status = "current";
      document.getElementById("currentPeriod").innerHTML = `
        <span class="period-name">${lesson.subject}</span>
        <span class="period-time">${lesson.time}</span>
      `;
    } else if (currentTime < lessonStartTime) {
      status = "upcoming";
    } else {
      status = "past";
    }

    lessonDiv.innerHTML = `
      <div class="schedule-time">${lesson.time}</div>
      <div class="schedule-subject">${lesson.subject}</div>
      <div class="schedule-room">${lesson.room}</div>
    `;
    lessonDiv.classList.add(`lesson-${status}`);
    scheduleList.appendChild(lessonDiv);
  });
}

updateSchedule();
setInterval(updateSchedule, 60000); // Обновляем каждую минуту

// Пример сообщений
const messages = [
  {
    subject: "История Казахстана",
    grade: "H/5",
    date: "29 Apr",
    teacher: "Akhmetov A.",
  },
  {
    subject: "Английский язык",
    grade: "0/25%",
    date: "28 Apr",
    teacher: "Smith J.",
  },
];

function displayMessages() {
  const messagesList = document.getElementById("messagesList");
  messages.forEach((message) => {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message-item";
    messageDiv.innerHTML = `
      <div class="message-header">
        <span class="message-subject">${message.subject}</span>
        <span class="message-date">${message.date}</span>
      </div>
      <div class="message-content">
        <div class="message-grade">${message.grade}</div>
        <div class="message-teacher">${message.teacher}</div>
      </div>
    `;
    messagesList.appendChild(messageDiv);
  });
}

displayMessages();

// Пример оценок
const grades = [
  { subject: "История Казахстана", grade: "5", date: "29 Apr" },
  { subject: "Английский язык", grade: "4", date: "28 Apr" },
];

function displayGrades() {
  const gradesList = document.getElementById("gradesList");
  grades.forEach((grade) => {
    const gradeDiv = document.createElement("div");
    gradeDiv.className = "grade-item";
    gradeDiv.innerHTML = `
      <div class="grade-info">
        <div class="grade-subject">${grade.subject}</div>
        <div class="grade-date">${grade.date}</div>
      </div>
      <div class="grade-value">${grade.grade}</div>
    `;
    gradesList.appendChild(gradeDiv);
  });
}

displayGrades();

// Пример домашних заданий
const homework = [
  {
    subject: "Математика",
    task: "Упражнения 15-20",
    dueDate: "До завтра",
  },
  {
    subject: "Физика",
    task: "Подготовка к контрольной",
    dueDate: "До пятницы",
  },
];

function displayHomework() {
  const homeworkList = document.getElementById("homeworkList");
  homework.forEach((hw) => {
    const hwDiv = document.createElement("div");
    hwDiv.className = "homework-item";
    hwDiv.innerHTML = `
      <div class="homework-subject">${hw.subject}</div>
      <div class="homework-task">${hw.task}</div>
      <div class="homework-due">${hw.dueDate}</div>
    `;
    homeworkList.appendChild(hwDiv);
  });
}

displayHomework();

// Обработка кликов по меню
document.querySelectorAll(".menu-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    // Здесь можно добавить логику переключения между разделами
    console.log("Clicked:", item.querySelector("span:last-child").textContent);
  });
});

// Добавляем обработку уведомлений
const notificationsBtn = document.getElementById("notificationsBtn");
const notificationsDropdown = document.getElementById("notificationsDropdown");
const notifications = [
  {
    id: 1,
    title: "Новое домашнее задание",
    message: "По математике добавлено новое задание",
    time: "5 минут назад",
    unread: true,
  },
  {
    id: 2,
    title: "Урок отменен",
    message: "Урок физики в 14:30 отменен",
    time: "1 час назад",
    unread: true,
  },
  {
    id: 3,
    title: "Новый документ",
    message: "Загружена справка об обучении",
    time: "2 часа назад",
    unread: true,
  },
];

// Обработка клика по кнопке уведомлений
notificationsBtn?.addEventListener("click", () => {
  notificationsDropdown.classList.toggle("show");
  renderNotifications();
});

// Закрытие dropdown при клике вне него
document.addEventListener("click", (e) => {
  if (
    !e.target.closest(".notifications") &&
    notificationsDropdown?.classList.contains("show")
  ) {
    notificationsDropdown.classList.remove("show");
  }
});

// Отрисовка уведомлений
function renderNotifications() {
  const notificationsList = document.querySelector(".notifications-list");
  if (!notificationsList) return;

  notificationsList.innerHTML = notifications
    .map(
      (notification) => `
        <div class="notification-item ${
          notification.unread ? "unread" : ""
        }" data-id="${notification.id}">
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
            <div class="notification-time">${notification.time}</div>
        </div>
    `
    )
    .join("");

  // Обновляем счетчик
  const unreadCount = notifications.filter((n) => n.unread).length;
  document.querySelector(".notifications-badge").textContent = unreadCount;
}

// Глобальный поиск
const globalSearch = document.getElementById("globalSearch");
globalSearch?.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  // Здесь будет логика поиска
  console.log("Searching for:", searchTerm);
});

// Обработка документов
const documentsSection = document.getElementById("documents");
if (documentsSection) {
  const documents = [
    {
      id: 1,
      name: "Справка об обучении.pdf",
      date: "2024-02-20",
      status: "pending",
      type: "pdf",
    },
    {
      id: 2,
      name: "Заявление на отпуск.pdf",
      date: "2024-02-19",
      status: "approved",
      type: "pdf",
    },
    {
      id: 3,
      name: "Справка о болезни.jpg",
      date: "2024-02-18",
      status: "rejected",
      type: "image",
    },
  ];

  function renderDocuments() {
    const documentsList = documentsSection.querySelector(".documents-list");
    documentsList.innerHTML = documents
      .map(
        (doc) => `
            <div class="document-item">
                <span class="material-icons">${
                  doc.type === "pdf" ? "picture_as_pdf" : "image"
                }</span>
                <div class="document-info">
                    <div class="document-name">${doc.name}</div>
                    <div class="document-date">${doc.date}</div>
                </div>
                <div class="document-status status-${doc.status}">
                    ${getStatusIcon(doc.status)} ${getStatusText(doc.status)}
                </div>
                <button class="document-action">
                    <span class="material-icons">open_in_new</span>
                </button>
            </div>
        `
      )
      .join("");
  }

  function getStatusIcon(status) {
    switch (status) {
      case "pending":
        return "⏳";
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      default:
        return "";
    }
  }

  function getStatusText(status) {
    switch (status) {
      case "pending":
        return "Ожидает";
      case "approved":
        return "Подписан";
      case "rejected":
        return "Отклонён";
      default:
        return "";
    }
  }

  renderDocuments();
}

// Обработка обращений
const requestForm = document.querySelector(".request-form");
requestForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const type = document.getElementById("requestType").value;
  const text = document.getElementById("requestText").value;

  if (type && text) {
    addRequest({
      type,
      text,
      date: new Date().toLocaleString("ru-RU"),
      status: "pending",
    });
    e.target.reset();
  }
});

function addRequest(request) {
  const requestsList = document.querySelector(".requests-list");
  const requestElement = document.createElement("div");
  requestElement.className = "request-item";
  requestElement.innerHTML = `
        <div class="request-header">
            <span class="request-type">${request.type}</span>
            <span class="request-date">${request.date}</span>
        </div>
        <div class="request-text">${request.text}</div>
        <div class="request-status status-${request.status}">
            ${request.status === "pending" ? "На рассмотрении" : request.status}
        </div>
    `;
  requestsList.prepend(requestElement);
}

// Обработка истории
const historySection = document.getElementById("history");
if (historySection) {
  const historyData = [
    {
      type: "attendance",
      date: "2024-02-20",
      title: "Посещение урока",
      details: "Математика, 8:30 - 9:15",
    },
    {
      type: "grades",
      date: "2024-02-19",
      title: "Новая оценка",
      details: "Физика: 5",
    },
    {
      type: "documents",
      date: "2024-02-18",
      title: "Загружен документ",
      details: "Справка об обучении.pdf",
    },
  ];

  function renderHistory() {
    const timeline = historySection.querySelector(".history-timeline");
    timeline.innerHTML = historyData
      .map(
        (item) => `
            <div class="timeline-item" data-type="${item.type}">
                <div class="timeline-date">${item.date}</div>
                <div class="timeline-title">${item.title}</div>
                <div class="timeline-details">${item.details}</div>
            </div>
        `
      )
      .join("");
  }

  // Фильтрация истории
  const historyPeriod = document.getElementById("historyPeriod");
  const historyType = document.getElementById("historyType");

  historyPeriod?.addEventListener("change", filterHistory);
  historyType?.addEventListener("change", filterHistory);

  function filterHistory() {
    const period = historyPeriod.value;
    const type = historyType.value;

    const items = document.querySelectorAll(".timeline-item");
    items.forEach((item) => {
      const showByType = type === "all" || item.dataset.type === type;
      item.style.display = showByType ? "grid" : "none";
    });
  }

  renderHistory();
}

// Добавление в Google Calendar
function addToGoogleCalendar(event) {
  const { title, date, startTime, endTime, description } = event;
  const startDate = new Date(`${date} ${startTime}`);
  const endDate = new Date(`${date} ${endTime}`);

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${startDate.toISOString().replace(/-|:|\.\d\d\d/g, "")}/${endDate
    .toISOString()
    .replace(/-|:|\.\d\d\d/g, "")}&details=${encodeURIComponent(description)}`;

  window.open(url, "_blank");
}

// Обновление времени и даты
function updateRealTime() {
  const now = new Date();
  const timeElement = document.querySelector("#realTime .time");
  const dateElement = document.querySelector("#realTime .date");

  // Обновляем время
  timeElement.textContent = now.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Обновляем дату
  dateElement.textContent = now.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// Обновление текущего урока
function updateCurrentLesson() {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  let currentLesson = null;
  for (const lesson of schedule) {
    const [startTime, endTime] = lesson.time.split(" - ");
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const lessonStartTime = startHour * 60 + startMinute;
    const lessonEndTime = endHour * 60 + endMinute;

    if (currentTime >= lessonStartTime && currentTime <= lessonEndTime) {
      currentLesson = {
        ...lesson,
        startTime: startTime,
        endTime: endTime,
        progress:
          ((currentTime - lessonStartTime) /
            (lessonEndTime - lessonStartTime)) *
          100,
      };
      break;
    }
  }

  const lessonElement = document.getElementById("currentLesson");
  const timeElement = lessonElement.querySelector(".lesson-time");
  const subjectElement = lessonElement.querySelector(".subject");
  const roomElement = lessonElement.querySelector(".room");

  if (currentLesson) {
    timeElement.textContent = `${currentLesson.startTime} - ${currentLesson.endTime}`;
    subjectElement.textContent = currentLesson.subject;
    roomElement.textContent = `Кабинет ${currentLesson.room}`;
    lessonElement.classList.add("active");

    // Добавляем индикатор прогресса
    if (!lessonElement.querySelector(".progress-bar")) {
      const progressBar = document.createElement("div");
      progressBar.className = "progress-bar";
      const progressFill = document.createElement("div");
      progressFill.className = "progress-fill";
      progressBar.appendChild(progressFill);
      lessonElement.appendChild(progressBar);
    }

    lessonElement.querySelector(
      ".progress-fill"
    ).style.width = `${currentLesson.progress}%`;
  } else {
    // Ищем следующий урок
    const nextLesson = schedule.find((lesson) => {
      const [startHour, startMinute] = lesson.time
        .split(" - ")[0]
        .split(":")
        .map(Number);
      const lessonStartTime = startHour * 60 + startMinute;
      return lessonStartTime > currentTime;
    });

    if (nextLesson) {
      timeElement.textContent = nextLesson.time;
      subjectElement.textContent = `Следующий: ${nextLesson.subject}`;
      roomElement.textContent = `Кабинет ${nextLesson.room}`;
    } else {
      timeElement.textContent = "Уроки закончились";
      subjectElement.textContent = "Хорошего дня!";
      roomElement.textContent = "";
    }
    lessonElement.classList.remove("active");
    const progressBar = lessonElement.querySelector(".progress-bar");
    if (progressBar) {
      progressBar.remove();
    }
  }
}

// Обработка переключения темы
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const icon = themeToggle.querySelector(".material-icons");
    if (document.body.classList.contains("light-theme")) {
      icon.textContent = "light_mode";
    } else {
      icon.textContent = "dark_mode";
    }

    // Сохраняем выбранную тему в localStorage
    localStorage.setItem(
      "theme",
      document.body.classList.contains("light-theme") ? "light" : "dark"
    );
  });

  // Восстанавливаем сохраненную тему при загрузке
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    if (savedTheme === "light") {
      document.body.classList.add("light-theme");
      themeToggle.querySelector(".material-icons").textContent = "light_mode";
    } else {
      document.body.classList.remove("light-theme");
      themeToggle.querySelector(".material-icons").textContent = "dark_mode";
    }
  }
}
