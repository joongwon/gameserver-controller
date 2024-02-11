import {addLog} from "./log.js";
import {addData,clearData} from "./chart.js";

export function sendStart() {
  fetch("/api/start", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    }
  }).then(r => {
    if (r.status === 401) {
      addLog("로그인이 필요합니다");
      token = null;
      updateButtons();
    } else if (r.status !== 200) {
      addLog("서버 시작 실패");
    }
  }).catch(() => {
    addLog("서버 시작 실패");
  });
}

export function sendStop() {
  fetch("/api/stop", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    }
  }).then(r => {
    if (r.status === 401) {
      addLog("로그인이 필요합니다");
      token = null;
      updateButtons();
    } else if (r.status !== 200) {
      addLog("서버 정지 실패");
    }
  }).catch(() => {
    addLog("서버 정지 실패");
  });
}

let token = null;

function updateButtons() {
  document.getElementById("btn-open-login").disabled = token !== null;
  const buttons = document.querySelectorAll("button[data-need-token]");
  buttons.forEach(b => {
    b.disabled = token === null;
  });
}

export function login() {
  fetch("/api/auth", {
    method: "POST",
    body: JSON.stringify({
      username: document.getElementById("login-username").value,
      password: document.getElementById("login-password").value,
    }),
    headers: {
      "Content-Type": "application/json",
    }
  }).then(async r => {
    if (r.status === 200) {
      addLog("로그인 성공");
      const j = await r.json();
      token = j.token;
      updateButtons();
      document.getElementById("btn-close-login").click();
    } else {
      addLog("로그인 실패");
    }
  }).catch(() => {
    addLog("로그인 실패");
  });
}

function replaceBadge(status) {
  const span = document.createElement("span");
  span.textContent = status;
  span.classList.add("badge", "rounded-pill", {
    "on": "bg-success", "off": "bg-danger", "error": "bg-warning",
  }[status]);
  span.id = "status";
  document.getElementById("status").replaceWith(span);
}

export function checkStatusOnce() {
  fetch("/api/status", {method: "GET"}).then(r => {
    if (r.status === 200) {
      return r.json();
    } else {
      replaceBadge("error")
    }
  }).then(j => {
    replaceBadge(j.status);
    addData(j);
  });
}

function startSocketCommunication(absolutePath, onMessage) {
  const here = location.host;
  const wsDomain = `ws://${here}${absolutePath}`
  console.log("start socket: " + wsDomain);
  const socket = new WebSocket(wsDomain);
  socket.addEventListener("open", () => {
    addLog(`connected to ${absolutePath}`);
  });
  socket.addEventListener("error", () => {
    addLog(`error connecting to ${absolutePath}`);
  });
  socket.addEventListener("message", onMessage);
  socket.addEventListener("close", () => {
    addLog(`disconnected from ${absolutePath}; retry in 5s`);
    setTimeout(() => startSocketCommunication(absolutePath, onMessage), 5000);
  });
}

export function startCheckStatus() {
  checkStatusOnce();
  startSocketCommunication("/ws/status", e => {
    const j = JSON.parse(e.data.toString());
    replaceBadge(j.status);
    addData(j);
  });
}

export function clearLog() {
  document.getElementById("log").replaceChildren();
  clearData();
}

export function onFilterChange(type, checked) {
  const log = document.getElementById("log");
  const items = log.querySelectorAll(`li[data-type="${type}"]`);
  items.forEach(li => {
    li.hidden = !checked;
  });
}

export function startLogCommunication() {
  startSocketCommunication("/ws/log", e => {
    const data = JSON.parse(e.data.toString());
    addLog(data.message, data.type);
  });
}
