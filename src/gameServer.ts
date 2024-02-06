import { ChildProcess, spawn } from "child_process";

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

export function isGameServerConnected() {
  return gameServer !== null;
}
