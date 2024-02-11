import { ChildProcess, spawn } from "child_process";
import { readFile } from "node:fs/promises";
import * as os from "node:os";

let gameServer: ChildProcess | null = null;

export function startGameServer(
  broadcast: (type: string, message: string) => void
) {
  if (gameServer) {
    broadcast("info", "이미 실행중");
    return;
  }

  const binPath = process.env.BIN_PATH;
  if (binPath === undefined) {
    console.error("BIN_PATH environment variable is not set");
    broadcast("error", "server error; contact to server admin");
    return;
  }
  gameServer = spawn(
    binPath,
    process.env.BIN_ARG?.split(' ') ?? [],
    {
      cwd: process.env.CWD,
    }
  );
  gameServer.on("error", (err) => {
    broadcast("error", err.message);
  });
  gameServer.on("spawn", () => {
    broadcast("info", `spawn success: PID=${gameServer?.pid}`);

  });
  gameServer.stdout?.on("data", (chunk) => {
    const data = chunk.toString();
    broadcast("out", data);
  });
  gameServer.stderr?.on("data", (chunk) => {
    const data = chunk.toString();
    broadcast("err", data);
  });
  gameServer.on("exit", (code, signal) => {
    gameServer = null;
    broadcast("info", `exited with ${code} (${signal})`);
  });
}

export function stopGameServer(
  broadcast: (type: string, message: string) => void
) {
  if (!gameServer) {
    broadcast("info", "이미 정지됨");
  } else {
    gameServer.kill('SIGTERM');
  }
}

export function killGameServer() {
    gameServer?.kill('SIGKILL');
}

export async function gameServerStatus() {
  const freemem = os.freemem();
  const totalmem = os.totalmem();

  if (gameServer === null) {
    return {
      status: "off",
      freemem: freemem,
      totalmem: totalmem,
    };
  }

  const pid = gameServer.pid;
  const statFileName = `/proc/${pid}/statm`;
  try {
    const statContent = await readFile(statFileName, { encoding: "utf-8" });
    const statArray = statContent.split(' ').map(elem => parseInt(elem));

    // all measured in bytes
    const vm = statArray[0] * 4096;
    const rss = statArray[1] * 4096;
    return {
      status: "on",
      vm: vm,
      rss: rss,
      freemem: freemem,
      totalmem: totalmem,
    };
  } catch (e) {
    return {
      status: "on",
      freemem: freemem,
      totalmem: totalmem,
    };
  }
}
