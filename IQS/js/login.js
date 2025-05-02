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

// Инициализируем Firebase только если он еще не инициализирован
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

// Обработка формы входа
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorElement = document.getElementById("error-message");

  try {
    await auth.signInWithEmailAndPassword(email, password);
    // После успешного входа проверяем, есть ли сохраненный URL для возврата
    const returnUrl = sessionStorage.getItem("returnUrl");
    if (returnUrl) {
      sessionStorage.removeItem("returnUrl");
      window.location.href = returnUrl;
    } else {
      window.location.href = "dashboard_student.html";
    }
  } catch (error) {
    console.error("Ошибка входа:", error);
    errorElement.textContent = getErrorMessage(error.code);
    errorElement.style.display = "block";
  }
});

// Функция для получения понятного сообщения об ошибке
function getErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Неверный формат email";
    case "auth/user-disabled":
      return "Аккаунт отключен";
    case "auth/user-not-found":
      return "Пользователь не найден";
    case "auth/wrong-password":
      return "Неверный пароль";
    default:
      return "Произошла ошибка при входе";
  }
}

// Проверяем статус авторизации при загрузке страницы
auth.onAuthStateChanged((user) => {
  if (user) {
    const returnUrl = sessionStorage.getItem("returnUrl");
    if (returnUrl) {
      sessionStorage.removeItem("returnUrl");
      window.location.href = returnUrl;
    } else {
      window.location.href = "dashboard_student.html";
    }
  }
});
