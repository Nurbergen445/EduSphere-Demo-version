const pdfList = document.getElementById('pdfList');
const noteArea = document.getElementById('noteArea');
const pdfUpload = document.getElementById('pdfUpload');

pdfUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const li = document.createElement('li');
  li.textContent = file.name;
  pdfList.appendChild(li);
});

function saveNote() {
  const text = noteArea.value;
  localStorage.setItem('studentNote', text);
  alert('Заметка сохранена!');
}

// canvas
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
let painting = false;

canvas.addEventListener("mousedown", () => painting = true);
canvas.addEventListener("mouseup", () => painting = false);
canvas.addEventListener("mousemove", draw);

function draw(e) {
  if (!painting) return;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}