const steps = [
  ["landing", "Landing"],
  ["account", "Contact Details"],
  ["connect", "Connect"],
  ["google", "Google Consent"],
  ["merchant", "Select Merchant"],
  ["merchant-open", "Merchant Menu"],
  ["merchant-selected", "Selected Account"],
  ["ready", "All Set"],
  ["error", "Error"]
];

const previewPassword = "feedops123";
const passwordGate = document.querySelector("[data-password-gate]");
const passwordForm = document.querySelector("[data-password-form]");
const passwordInput = document.querySelector("[data-password-input]");
const passwordError = document.querySelector("[data-password-error]");

function unlockPreview() {
  passwordGate.classList.add("is-unlocked");
  sessionStorage.setItem("feedopsAuditPreviewUnlocked", "true");
}

if (sessionStorage.getItem("feedopsAuditPreviewUnlocked") === "true") {
  unlockPreview();
}

passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (passwordInput.value === previewPassword) {
    unlockPreview();
    return;
  }

  passwordError.hidden = false;
  passwordInput.select();
});

const stage = document.querySelector(".prototype");
const label = document.getElementById("step-label");

function setStep(step) {
  stage.dataset.step = step;
  const current = steps.find((item) => item[0] === step);
  label.textContent = current ? current[1] : step;
}

function currentIndex() {
  return Math.max(0, steps.findIndex((item) => item[0] === stage.dataset.step));
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-go]");
  if (target) {
    setStep(target.dataset.go);
  }
});

document.querySelector("[data-prev]").addEventListener("click", () => {
  const index = currentIndex();
  setStep(steps[Math.max(0, index - 1)][0]);
});

document.querySelector("[data-next]").addEventListener("click", () => {
  const index = currentIndex();
  setStep(steps[Math.min(steps.length - 1, index + 1)][0]);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    document.querySelector("[data-prev]").click();
  }

  if (event.key === "ArrowRight") {
    document.querySelector("[data-next]").click();
  }
});

setStep("landing");
