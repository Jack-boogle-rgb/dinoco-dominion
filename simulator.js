let previousData = null;
let chartAnimationId = 0;
const previousValues = {
  invested: 0,
  returns: 0,
  final: 0
};

/* formatCurrency(value) — formats to $1K $100K $1M */
function formatCurrency(value) {
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1000000) {
    const millions = value / 1000000;
    return `$${Number.isInteger(millions) ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }

  if (absoluteValue >= 1000) {
    return `$${Math.round(value / 1000)}K`;
  }

  return `$${Math.round(value)}`;
}

/* calculateGrowth(monthly, years, rate) — returns array of {year, invested, total} */
function calculateGrowth(monthly, years, rate = 0.08) {
  const data = [{ year: 0, invested: 0, total: 0 }];
  const monthlyRate = rate / 12;
  let invested = 0;
  let total = 0;

  for (let year = 1; year <= years; year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      invested += monthly;
      total = (total + monthly) * (1 + monthlyRate);
    }

    data.push({
      year,
      invested,
      total
    });
  }

  return data;
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function resizeCanvas(canvas) {
  const pixelRatio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * pixelRatio;
  canvas.height = 240 * pixelRatio;
  const context = canvas.getContext("2d");
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  return { context, width: rect.width, height: 240 };
}

function drawArea(context, data, width, height, padding, maxValue, key, stroke, fill) {
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const finalYear = data[data.length - 1].year || 1;

  context.beginPath();
  data.forEach((point, index) => {
    const x = padding.left + (point.year / finalYear) * plotWidth;
    const y = padding.top + plotHeight - (point[key] / maxValue) * plotHeight;

    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });

  context.strokeStyle = stroke;
  context.lineWidth = 2;
  context.stroke();

  const lastPoint = data[data.length - 1];
  context.lineTo(padding.left + (lastPoint.year / finalYear) * plotWidth, padding.top + plotHeight);
  context.lineTo(padding.left, padding.top + plotHeight);
  context.closePath();
  context.fillStyle = fill;
  context.fill();
}

/* drawChart(data) — vanilla canvas: clear, draw grid, draw two area paths, draw labels */
function drawChart(data) {
  const canvas = document.getElementById("growth-chart");

  if (!canvas || !data.length) return;

  const { context, width, height } = resizeCanvas(canvas);
  const padding = { top: 24, right: 24, bottom: 34, left: 58 };
  const plotHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(...data.map((point) => point.total), 1) * 1.12;
  const finalYear = data[data.length - 1].year;

  context.clearRect(0, 0, width, height);
  roundedRect(context, 0, 0, width, height, 12);
  context.fillStyle = "#141414";
  context.fill();

  context.save();
  context.setLineDash([5, 7]);
  context.strokeStyle = "rgba(255,255,255,0.06)";
  context.lineWidth = 1;
  context.fillStyle = "#505050";
  context.font = "12px Inter, sans-serif";

  for (let i = 0; i < 4; i += 1) {
    const y = padding.top + (plotHeight / 3) * i;
    const value = maxValue - (maxValue / 3) * i;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    context.fillText(formatCurrency(value), 12, y + 4);
  }

  context.restore();

  drawArea(context, data, width, height, padding, maxValue, "invested", "#00D4FF", "rgba(0,212,255,0.1)");
  drawArea(context, data, width, height, padding, maxValue, "total", "#00FF88", "rgba(0,255,136,0.08)");

  context.fillStyle = "#505050";
  context.font = "12px Inter, sans-serif";
  context.fillText("0", padding.left, height - 12);
  context.textAlign = "right";
  context.fillText(`${finalYear} yrs`, width - padding.right, height - 12);
  context.textAlign = "left";
}

function interpolateData(fromData, toData, progress) {
  if (!fromData || !fromData.length) {
    return toData.map((point) => ({
      year: point.year,
      invested: point.invested * progress,
      total: point.total * progress
    }));
  }

  const fromLast = fromData[fromData.length - 1];

  return toData.map((point, index) => {
    const fromPoint = fromData[index] || {
      year: point.year,
      invested: fromLast.invested,
      total: fromLast.total
    };

    return {
      year: point.year,
      invested: fromPoint.invested + (point.invested - fromPoint.invested) * progress,
      total: fromPoint.total + (point.total - fromPoint.total) * progress
    };
  });
}

function animateChart(toData) {
  const fromData = previousData;
  const startTime = performance.now();

  cancelAnimationFrame(chartAnimationId);

  function drawFrame(currentTime) {
    const elapsed = Math.min((currentTime - startTime) / 400, 1);
    const progress = 1 - Math.pow(1 - elapsed, 3);
    drawChart(interpolateData(fromData, toData, progress));

    if (elapsed < 1) {
      chartAnimationId = requestAnimationFrame(drawFrame);
    } else {
      previousData = toData;
    }
  }

  chartAnimationId = requestAnimationFrame(drawFrame);
}

/* animateValue(element, from, to, duration) — smooth number count animation */
function animateValue(element, from, to, duration) {
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = Math.min((currentTime - startTime) / duration, 1);
    const progress = 1 - Math.pow(1 - elapsed, 3);
    const currentValue = from + (to - from) * progress;
    element.textContent = formatCurrency(currentValue);

    if (elapsed < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function setSliderFill(slider) {
  const min = Number(slider.min);
  const max = Number(slider.max);
  const value = Number(slider.value);
  const fill = ((value - min) / (max - min)) * 100;
  slider.style.setProperty("--fill", `${fill}%`);
}

/* updateSimulator() — reads both sliders, calls calculateGrowth, animates values, calls drawChart */
function updateSimulator() {
  const monthlySlider = document.getElementById("monthly-slider");
  const yearsSlider = document.getElementById("years-slider");
  const monthlyDisplay = document.getElementById("monthly-display");
  const yearsDisplay = document.getElementById("years-display");
  const totalInvested = document.getElementById("total-invested");
  const totalReturns = document.getElementById("total-returns");
  const finalValue = document.getElementById("final-value");

  if (!monthlySlider || !yearsSlider || !monthlyDisplay || !yearsDisplay || !totalInvested || !totalReturns || !finalValue) return;

  const monthly = Number(monthlySlider.value);
  const years = Number(yearsSlider.value);
  const data = calculateGrowth(monthly, years, 0.08);
  const lastPoint = data[data.length - 1];
  const invested = lastPoint.invested;
  const final = lastPoint.total;
  const returns = final - invested;

  monthlyDisplay.textContent = `$${monthly.toLocaleString("en-US")}`;
  yearsDisplay.textContent = `$${years} yrs`;
  setSliderFill(monthlySlider);
  setSliderFill(yearsSlider);

  animateValue(totalInvested, previousValues.invested, invested, 300);
  animateValue(totalReturns, previousValues.returns, returns, 300);
  animateValue(finalValue, previousValues.final, final, 300);

  previousValues.invested = invested;
  previousValues.returns = returns;
  previousValues.final = final;

  animateChart(data);
}

/* Input event listeners on both sliders — call updateSimulator */
function setupSimulatorListeners() {
  const monthlySlider = document.getElementById("monthly-slider");
  const yearsSlider = document.getElementById("years-slider");

  if (!monthlySlider || !yearsSlider) return;

  monthlySlider.addEventListener("input", updateSimulator);
  yearsSlider.addEventListener("input", updateSimulator);
  window.addEventListener("resize", updateSimulator);
}

/* DOMContentLoaded — call updateSimulator with defaults to render initial state */
document.addEventListener("DOMContentLoaded", () => {
  setupSimulatorListeners();
  updateSimulator();
});
