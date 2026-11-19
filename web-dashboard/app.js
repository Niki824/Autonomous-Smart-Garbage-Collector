// Firebase Realtime Database Configuration
const firebaseConfig = {
  databaseURL: "https://waste-collection-robot-85d70-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// UI Elements
const garbageLevelEl = document.getElementById("garbage-level-percent");
const garbageStatusPill = document.getElementById("garbage-status-pill");
const ringProgress = document.getElementById("ring-progress");
const lidIndicator = document.getElementById("lid-indicator");
const lidStatusText = document.getElementById("lid-status-text");
const robotStateEl = document.getElementById("robot-state");
const robotTargetEl = document.getElementById("robot-target");
const robotObstacleEl = document.getElementById("robot-obstacle");
const connectionStatusEl = document.getElementById("connection-status");
const connectionStatusText = connectionStatusEl.querySelector(".status-text");

// Circle Gauge Circumference (r = 66)
const CIRCUMFERENCE = 2 * Math.PI * 66; // 414.69
ringProgress.style.strokeDasharray = `${CIRCUMFERENCE} ${CIRCUMFERENCE}`;
ringProgress.style.strokeDashoffset = CIRCUMFERENCE;

// Update Garbage Level in UI
function updateGarbageLevel(level) {
  const clamped = Math.min(100, Math.max(0, Number(level) || 0));
  garbageLevelEl.textContent = `${clamped}%`;

  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;
  ringProgress.style.strokeDashoffset = offset;

  garbageStatusPill.classList.remove("full-pill", "empty-pill");
  if (clamped >= 75) {
    ringProgress.style.stroke = "#ff3366";
    garbageStatusPill.textContent = "FULL";
    garbageStatusPill.classList.add("full-pill");
  } else if (clamped <= 20) {
    ringProgress.style.stroke = "#00e676";
    garbageStatusPill.textContent = "EMPTY";
    garbageStatusPill.classList.add("empty-pill");
  } else {
    ringProgress.style.stroke = "#ffb703";
    garbageStatusPill.textContent = "MODERATE";
  }

  // Push to history chart
  addHistoryPoint(clamped);
}

// Update Lid Status
function updateLidStatus(status) {
  const normStatus = (status || "CLOSED").toUpperCase();
  lidStatusText.textContent = normStatus;
  if (normStatus === "OPEN") {
    lidIndicator.classList.remove("closed");
    lidIndicator.classList.add("open");
  } else {
    lidIndicator.classList.remove("open");
    lidIndicator.classList.add("closed");
  }
}

// Update Robot Status
function updateRobotStatus(state, target, obstacle) {
  if (state !== undefined) robotStateEl.textContent = state;
  if (target !== undefined) robotTargetEl.textContent = target;
  if (obstacle !== undefined) robotObstacleEl.textContent = obstacle;
}

// Initialize Chart.js History Graph
const ctx = document.getElementById("historyChart").getContext("2d");

// Gradient fill
const gradient = ctx.createLinearGradient(0, 0, 0, 240);
gradient.addColorStop(0, "rgba(255, 51, 102, 0.45)");
gradient.addColorStop(1, "rgba(255, 51, 102, 0.0)");

const initialLabels = [];
const initialData = [];
const now = new Date();

// Generate last 10 points at 3-minute intervals
for (let i = 9; i >= 0; i--) {
  const t = new Date(now.getTime() - i * 3 * 60 * 1000);
  initialLabels.push(t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  initialData.push(Math.floor(20 + Math.random() * 45));
}

const historyChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: initialLabels,
    datasets: [{
      label: "Garbage Level (%)",
      data: initialData,
      borderColor: "#ff3366",
      borderWidth: 2.5,
      backgroundColor: gradient,
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: "#ffffff",
      pointBorderColor: "#ff3366"
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(27, 7, 53, 0.9)",
        titleFont: { family: 'Plus Jakarta Sans', size: 12 },
        bodyFont: { family: 'Plus Jakarta Sans', size: 13, weight: 'bold' },
        padding: 10,
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        callbacks: {
          label: (context) => ` Level: ${context.parsed.y}%`
        }
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.06)" },
        ticks: { color: "rgba(255, 255, 255, 0.6)", font: { size: 11 } }
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: "rgba(255, 255, 255, 0.06)" },
        ticks: {
          color: "rgba(255, 255, 255, 0.6)",
          font: { size: 11 },
          callback: (value) => `${value}%`
        }
      }
    }
  }
});

function addHistoryPoint(level) {
  const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  if (historyChart.data.labels.length > 20) {
    historyChart.data.labels.shift();
    historyChart.data.datasets[0].data.shift();
  }
  historyChart.data.labels.push(timeLabel);
  historyChart.data.datasets[0].data.push(level);
  historyChart.update();
}

// Connect to Firebase Realtime Database
function initFirebase() {
  try {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    // Listen to /dustbin
    db.ref("dustbin").on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.garbageLevel !== undefined) updateGarbageLevel(data.garbageLevel);
        if (data.lidStatus !== undefined) updateLidStatus(data.lidStatus);
      }
      setConnected(true);
    }, (error) => {
      console.warn("Firebase listener error:", error);
      setConnected(false, "Connection error (Running demo simulation)");
      startDemoSimulation();
    });

    // Listen to /robot
    db.ref("robot").on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        updateRobotStatus(data.state, data.target, data.obstacleDistance);
      }
    });

    // Connection state monitor
    db.ref(".info/connected").on("value", (snap) => {
      if (snap.val() === true) {
        setConnected(true);
      } else {
        setConnected(false, "Offline (Connecting...)");
      }
    });

  } catch (err) {
    console.warn("Firebase Init failed:", err);
    setConnected(false, "Demo Mode Active");
    startDemoSimulation();
  }
}

function setConnected(isConnected, customMsg) {
  if (isConnected) {
    connectionStatusEl.className = "connection-status connected";
    connectionStatusText.textContent = "Firebase Connected (Live)";
  } else {
    connectionStatusEl.className = "connection-status error";
    connectionStatusText.textContent = customMsg || "Offline";
  }
}

// Fallback interactive simulation if Firebase offline
let simInterval = null;
function startDemoSimulation() {
  if (simInterval) return;
  // Load default showcase state (matching screenshot)
  updateGarbageLevel(87);
  updateLidStatus("CLOSED");
  updateRobotStatus("IDLE", "0", 100);

  // Periodically update chart
  simInterval = setInterval(() => {
    const jitter = Math.min(100, Math.max(70, 87 + Math.floor((Math.random() - 0.5) * 6)));
    updateGarbageLevel(jitter);
  }, 30000);
}

// Start
document.addEventListener("DOMContentLoaded", () => {
  initFirebase();
  // If no response after 5 seconds, ensure demo state is rendered
  setTimeout(() => {
    if (!connectionStatusEl.classList.contains("connected")) {
      startDemoSimulation();
    }
  }, 4000);
});
