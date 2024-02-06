import {
  checkStatusOnce,
  clearLog, login,
  onFilterChange,
  sendStart,
  sendStop,
  startCheckStatus,
  startLogCommunication
} from "./actions.js";

function addOnClick(id, func) {
  document.getElementById(id).addEventListener("click", func);
}

function addOnSubmit(id, func) {
  document.getElementById(id).addEventListener("submit", (e) => {
    e.preventDefault();
    func();
  });
}

function addOnFilterChange(type) {
  document.getElementById(`btn-check-${type}`).addEventListener("change", e => {
    onFilterChange(type, e.target.checked);
  });
}

addOnClick("btn-start", sendStart);
addOnClick("btn-stop", sendStop);
addOnClick("btn-clear", clearLog);
addOnSubmit("form-login", login);
["client", "req", "err", "out", "info", "ping"].forEach(addOnFilterChange);
startCheckStatus();
addOnClick("btn-refresh", checkStatusOnce);
startLogCommunication();
