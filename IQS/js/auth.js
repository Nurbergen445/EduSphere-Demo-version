// Ждем загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
  // Получаем элементы форм
  const switchBtns = document.querySelectorAll(".switch-btn");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  // Переключение между формами
  switchBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const formType = btn.getAttribute("data-form");
      switchBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      if (formType === "login") {
        loginForm.style.display = "flex";
        registerForm.style.display = "none";
      } else {
        loginForm.style.display = "none";
        registerForm.style.display = "flex";
      }

      hideMessages();
    });
  });

  // Обработка выбора роли
  let selectedLoginRole = null;
  let selectedRegisterRole = null;

  function handleRoleSelection(btnId, role, isLogin = true) {
    const btn = document.getElementById(btnId);
    const oppositeBtn = document.getElementById(
      isLogin
        ? role === "student"
          ? "teacherBtnLogin"
          : "studentBtnLogin"
        : role === "student"
        ? "teacherBtnRegister"
        : "studentBtnRegister"
    );

    btn.addEventListener("click", () => {
      btn.classList.add("active");
      oppositeBtn.classList.remove("active");
      if (isLogin) {
        selectedLoginRole = role;
      } else {
        selectedRegisterRole = role;
      }
    });
  }

  // Настройка обработчиков ролей
  handleRoleSelection("studentBtnLogin", "student", true);
  handleRoleSelection("teacherBtnLogin", "teacher", true);
  handleRoleSelection("studentBtnRegister", "student", false);
  handleRoleSelection("teacherBtnRegister", "teacher", false);

  // Обработка входа
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hideMessages();

    // Получаем выбранную роль из window.getSelectedRole
    let selectedLoginRole = window.getSelectedRole
      ? window.getSelectedRole()
      : null;
    if (!selectedLoginRole) {
      showError("Пожалуйста, выберите роль (ученик или учитель)");
      return;
    }

    // Перенаправляем на соответствующую страницу
    window.location.href =
      selectedLoginRole === "student"
        ? "dashboard_student.html"
        : "dashboard_teacher.html";
  });

  // Обработка регистрации
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hideMessages();

    if (!selectedRegisterRole) {
      showError("Пожалуйста, выберите роль (ученик или учитель)");
      return;
    }

    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      showError("Пароли не совпадают");
      return;
    }

    // Перенаправляем на соответствующую страницу
    window.location.href =
      selectedRegisterRole === "student"
        ? "dashboard_student.html"
        : "dashboard_teacher.html";
  });

  // Управление сообщениями
  function showError(message) {
    const errorDiv = document.getElementById("errorMessage");
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
  }

  function hideMessages() {
    document.getElementById("errorMessage").style.display = "none";
    document.getElementById("successMessage").style.display = "none";
  }
});
