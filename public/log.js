export function addLog(message, type="client") {
  const li = document.createElement("li");
  const timeElem = document.createElement("div");
  timeElem.textContent = new Date().toLocaleString();
  const contentElem = document.createElement("div");
  contentElem.textContent = `[${type}] ${message}`;
  li.append(timeElem, contentElem);
  li.classList.add("list-group-item", `log-${type}`);
  li.dataset.type = type;
  li.hidden = !document.getElementById(`btn-check-${type}`).checked;

  document.getElementById("log").appendChild(li);
  li.scrollIntoView({behavior: "smooth"});
}
