// Инициализация PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js";

// Глобальные переменные для работы с PDF
let currentPdf = null;
let currentPage = 1;
let totalPages = 1;

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  initializeBackpack();
});

// Инициализация функционала рюкзака
function initializeBackpack() {
  // Обработка загрузки файлов
  document
    .getElementById("fileUpload")
    .addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const fileItem = createFileItem(file);
        document.getElementById("fileList").appendChild(fileItem);

        if (file.type === "application/pdf") {
          const fileUrl = URL.createObjectURL(file);
          addPdfViewer(fileUrl);
        }
      } catch (error) {
        console.error("Ошибка загрузки файла:", error);
        alert("Произошла ошибка при загрузке файла");
      }
    });
}

// Создание элемента файла
function createFileItem(file) {
  const fileItem = document.createElement("div");
  fileItem.className = "file-item";
  fileItem.innerHTML = `
    <span class="material-icons">${getFileIcon(file.type)}</span>
    <span class="file-name">${file.name}</span>
    <span class="file-size">${formatFileSize(file.size)}</span>
    <div class="file-actions">
      ${
        file.type === "application/pdf"
          ? `
        <button class="file-action" onclick="openPdf('${URL.createObjectURL(
          file
        )}')">
          <span class="material-icons">visibility</span>
        </button>
      `
          : ""
      }
    </div>
  `;
  return fileItem;
}

// Вспомогательные функции
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

// Функции для работы с PDF
async function openPdf(url) {
  try {
    const loadingTask = pdfjsLib.getDocument(url);
    currentPdf = await loadingTask.promise;
    totalPages = currentPdf.numPages;
    currentPage = 1;
    await renderPage();
    document.getElementById("pdfViewer").classList.remove("hidden");
  } catch (error) {
    console.error("Ошибка загрузки PDF:", error);
    alert("Ошибка при открытии PDF файла");
  }
}

async function renderPage() {
  try {
    const page = await currentPdf.getPage(currentPage);
    const canvas = document.getElementById("pdfCanvas");
    const context = canvas.getContext("2d");

    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    document.getElementById(
      "pageInfo"
    ).textContent = `Страница ${currentPage} из ${totalPages}`;
  } catch (error) {
    console.error("Ошибка отрисовки страницы:", error);
  }
}

// Обработчики событий для PDF навигации
document.getElementById("prevPage").addEventListener("click", async () => {
  if (currentPdf && currentPage > 1) {
    currentPage--;
    await renderPage();
  }
});

document.getElementById("nextPage").addEventListener("click", async () => {
  if (currentPdf && currentPage < totalPages) {
    currentPage++;
    await renderPage();
  }
});

document.getElementById("closePdf").addEventListener("click", () => {
  document.getElementById("pdfViewer").classList.add("hidden");
  currentPdf = null;
});
