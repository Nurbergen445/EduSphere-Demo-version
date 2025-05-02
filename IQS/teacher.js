function startLesson() {
    alert("Урок начался. Перейдите на доску.");
  }
  
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
    ctx.strokeStyle = "blue";
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  }
  