// Face assets
const features = {
  eyes: ['assets/eyes1.png', 'assets/eyes2.png', 'assets/eyes3.png',"assets/eyes4.png"],
  nose: ['assets/nose1.png', 'assets/nose2.png', 'assets/nose3.png',"assets/nose4.png"],
  mouth: ['assets/mouth1.png', 'assets/mouth2.png', 'assets/mouth3.png',"assets/mouth4.png"]
};

//player's current guess
let current = {
  eyes: 0,
  nose: 0,
  mouth: 0
};

//hidden target face
let target = {
  eyes: 0,
  nose: 0,
  mouth: 0
};

let turns = 0;

//generate target randomly
function generateTarget() {
  target.eyes = Math.floor(Math.random() * features.eyes.length);
  target.nose = Math.floor(Math.random() * features.nose.length);
  target.mouth = Math.floor(Math.random() * features.mouth.length);

  //hide randomly generated target face
  document.getElementById("target-eyes").style.visibility = "hidden";
  document.getElementById("target-nose").style.visibility = "hidden";
  document.getElementById("target-mouth").style.visibility = "hidden";
}

//display player's current face
function updateFace() {
  document.getElementById("eyes").src = features.eyes[current.eyes];
  document.getElementById("nose").src = features.nose[current.nose];
  document.getElementById("mouth").src = features.mouth[current.mouth];
}

function next(part) {
  current[part] = (current[part] + 1) % features[part].length;
  updateFace();
}

function prev(part) {
  current[part] = (current[part] - 1 + features[part].length) % features[part].length;
  updateFace();
}

//checking 
function checkMatch() {
  turns++;
  const resultBox = document.getElementById("result");
  const feedback = [];

  //eyes compare
  if (current.eyes === target.eyes) {
    feedback.push("✔ Eyes correct");
    document.getElementById("target-eyes").src = features.eyes[target.eyes];
    document.getElementById("target-eyes").style.visibility = "visible";
  } else {
    feedback.push("✘ Eyes wrong");
  }

  //nose compare
  if (current.nose === target.nose) {
    feedback.push("✔ Nose correct");
    document.getElementById("target-nose").src = features.nose[target.nose];
    document.getElementById("target-nose").style.visibility = "visible";
  } else {
    feedback.push("✘ Nose wrong");
  }

  //mouth compare
  if (current.mouth === target.mouth) {
    feedback.push("✔ Mouth correct");
    document.getElementById("target-mouth").src = features.mouth[target.mouth];
    document.getElementById("target-mouth").style.visibility = "visible";
  } else {
    feedback.push("✘ Mouth wrong");
  }

  resultBox.innerHTML = `
    <p>${feedback.join("<br>")}</p>
    <p>Turns taken: ${turns}</p>
  `;

 //victory msg display condition
if (
  current.eyes === target.eyes &&
  current.nose === target.nose &&
  current.mouth === target.mouth
) {
  // feedback message
  resultBox.innerHTML += `<p style="color: lightgreen; font-weight: bold;">🎉 You matched the face in ${turns} turn(s)!</p>`;

  //winning overlay
  document.getElementById("win-turns").textContent = `You took ${turns} turn(s).`;
  document.getElementById("win-overlay").classList.remove("hidden");
}

}

// reset the game for a new round
function resetGame() {
 document.getElementById("win-overlay").classList.add("hidden");
  current = { eyes: 0, nose: 0, mouth: 0 };
  turns = 0;
  generateTarget();
  updateFace();
  document.getElementById("result").innerHTML = "";
  document.getElementById("target-eyes").style.visibility = "hidden";
  document.getElementById("target-nose").style.visibility = "hidden";
  document.getElementById("target-mouth").style.visibility = "hidden";
}

window.onload = () => {
  generateTarget();
  updateFace();
};

