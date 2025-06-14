window.onload = function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 320;
  canvas.height = 480;

  const startMenu = document.getElementById("startMenu");
  const startBtn = document.getElementById("startBtn");

  startBtn.addEventListener("click", () => {
    startMenu.style.display = "none";
    canvas.style.display = "block";
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("Game Started!", 50, 200);
  });
};