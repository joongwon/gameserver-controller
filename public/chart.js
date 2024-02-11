import { Chart, LinearScale, LineController, TimeScale, PointElement, LineElement, Legend }
  from "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/+esm";
import "https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/+esm";

Chart.register(LinearScale, LineController, TimeScale, PointElement, LineElement, Legend);

const ctx = document.getElementById("chart");
const data = [];

// const GIGA = 1024*1024*1024;
const GIGA = 1000*1000*1000;
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    datasets: [
      {
        label: "서버 가상 메모리 사용량",
        data: data,
        parsing: {
          yAxisKey: "vm",
        },
        borderColor: "#8888FF",
      },
      {
        label: "서버 실제 메모리 사용량",
        data: data,
        parsing: {
          yAxisKey: "rss",
        },
        borderColor: "#FFFF00",
      },
      {
        label: "시스템 총 메모리 사용량",
        data: data,
        parsing: {
          yAxisKey: "totusage",
        },
        borderColor: "#55FF55",
      },
      {
        label: "남은 시스템 메모리",
        data: data,
        parsing: {
          yAxisKey: "freemem",
        },
        borderColor: "#FF8888",
      },
    ]
  },
  options: {
    animation: false,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        ticks: {
          callback: (tick) => `${(tick/GIGA).toFixed(2)}G`,
        },
      },
      x: {
        type: 'time',
      }
    },
  }
});

export function addData(j) {
  j.x = (new Date()).toISOString();
  j.totusage = j.totalmem - j.freemem;
  data.push(j);
  if (data.length > 600) {
    data.shift();
  }
  // chart.options.scales.y.max = j.totalmem;
  // chart.options.scales.y2.max = j.totalmem;
  chart.update();
}

export function clearData() {
  data.splice(0, data.length);
  chart.update();
}
