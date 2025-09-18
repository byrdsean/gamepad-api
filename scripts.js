let gamepadId = null;

window.addEventListener("gamepadconnected", (e) => {
  console.log(e);
});

function updateGamePadUI() {}

function updateGamePadUILoop(delta) {
  updateGamePadUI();
  requestAnimationFrame(updateGamePadUILoop);
}
updateGamePadUILoop(0);
