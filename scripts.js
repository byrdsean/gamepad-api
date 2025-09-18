const NO_GAMEPAD_CONNECTED_MESSAGE =
  "No Gamepad Connected. Connect gamepad, then press any button.";
const MAX_ANALOG_MOVEMENT = 10;

const gamepadIdDiv = document.getElementById("gamepadId");
gamepadIdDiv.innerHTML = NO_GAMEPAD_CONNECTED_MESSAGE;

const rumbleBtn = document.getElementById("rumble");

const gamepadSvgElements = {};
const pressedButtons = {};

window.addEventListener("gamepadconnected", (e) => {
  gamepadIdDiv.innerHTML = `Gamepad Connected with ID: ${e.gamepad.id}`;
  setGamepadSvgElements(e.gamepad);
  setPressedButtonState(e.gamepad);

  setElementStartPos("btn10");
  setElementStartPos("btn11");

  rumbleBtn.removeAttribute("disabled");
});

window.addEventListener("gamepaddisconnected", (e) => {
  gamepadIdDiv.innerHTML = NO_GAMEPAD_CONNECTED_MESSAGE;
  rumbleBtn.setAttribute("disabled", "");
});

window.addEventListener("click", (e) => {
  if (e.target.id === "rumble") {
    const gamepad = getGamePad();
    const actuator = gamepad.vibrationActuator;
    const rumbleType = "dual-rumble";

    e.target.setAttribute("disabled", "");
    actuator
      .playEffect(rumbleType, {
        startDelay: 0,
        duration: 1000,
        weakMagnitude: 0.0,
        strongMagnitude: 1.0,
      })
      .then((result) => {
        e.target.removeAttribute("disabled");
      });
  }
});

function setElementStartPos(elementId) {
  const svgElement = document.getElementById(elementId);
  if (!svgElement) return;

  const dimensions = svgElement.getAttribute("d");
  const positions = dimensions.split(" ")[1];
  const positionValues = positions.split(",");
  const startX = +positionValues[0];
  const startY = +positionValues[1];

  svgElement.setAttribute("xpos", startX);
  svgElement.setAttribute("ypos", startY);
}

function setPressedButtonState(gamepad) {
  gamepad.buttons.forEach(
    (button, index) => (pressedButtons[index] = button.value)
  );
}

function setGamepadSvgElements(gamepad) {
  gamepad.buttons.forEach((_, index) => {
    const svgElement = document.getElementById(`btn${index}`);
    if (svgElement) {
      gamepadSvgElements[index] = svgElement;
    }
  });
}

function updateGamePadUI() {
  const gamepad = getGamePad();
  if (!gamepad) return;

  gamepad.buttons.forEach((button, index) => {
    highlightPressedButton(button, index);
  });

  updateAxesButtons(gamepad.axes);
}

function updateAxesButtons(axes) {
  const [lAnalogX, lAnalogY, rAnalogX, rAnalogY] = axes;
  moveAnalog(lAnalogX, lAnalogY, 10);
  moveAnalog(rAnalogX, rAnalogY, 11);
}

function moveAnalog(xMovement, yMovement, elementIndex) {
  const svgElement = gamepadSvgElements[elementIndex];
  if (!svgElement) return;

  const startX = +svgElement.getAttribute("xpos");
  const startY = +svgElement.getAttribute("ypos");

  const isXMovementValid = Math.abs(xMovement) >= 0.1;
  const isYMovementValid = Math.abs(yMovement) >= 0.1;
  if (!isXMovementValid && !isYMovementValid) {
    const dimensions = svgElement.getAttribute("d");
    const dimensionPosition = dimensions.split(" ")[1];
    const newDimensions = dimensions.replace(
      dimensionPosition,
      `${startX},${startY}`
    );

    let style = svgElement.getAttribute("style");
    if (style.indexOf("red") >= 0) {
      style = style.replace(" fill: red;", "");
      svgElement.setAttribute("style", style);
    }

    svgElement.setAttribute("d", newDimensions);
    return;
  }

  const xPixelsToMove = MAX_ANALOG_MOVEMENT * xMovement;
  const yPixelsToMove = MAX_ANALOG_MOVEMENT * yMovement;

  const newXPos = startX + xPixelsToMove;
  const newYPos = startY + yPixelsToMove;

  const dimensions = svgElement.getAttribute("d");
  const dimensionPosition = dimensions.split(" ")[1];
  const newDimensions = dimensions.replace(
    dimensionPosition,
    `${newXPos},${newYPos}`
  );
  svgElement.setAttribute("d", newDimensions);

  let style = svgElement.getAttribute("style");
  if (style.indexOf("red") < 0) {
    style += " fill: red;";
    svgElement.setAttribute("style", style);
  }
}

function highlightPressedButton(button, index) {
  if (pressedButtons[index] === button.value) return;

  const svgElement = gamepadSvgElements[index];
  if (!svgElement) return;

  let style = svgElement.getAttribute("style");
  if (button.value === 1) {
    if (style.indexOf("red") < 0) {
      style += " fill: red;";
    }
  } else {
    style = style.replace(" fill: red;", "");
  }
  svgElement.setAttribute("style", style);
  pressedButtons[index] = button.value;
}

function getGamePad() {
  const gamepads = navigator.getGamepads();
  return gamepads.length > 0 ? gamepads[0] : null;
}

function updateGamePadUILoop(delta) {
  updateGamePadUI();
  requestAnimationFrame(updateGamePadUILoop);
}
updateGamePadUILoop(0);
