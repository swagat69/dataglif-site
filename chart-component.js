// Data Exhaustion Chart - Vanilla JS Component
(function() {
  'use strict';

  const CHART_DATA = {
    source: {
      chartTitle: "Data Exhaustion Projection: Training Data vs. Available Stock",
      sourceUrl: "https://arxiv.org/html/2601.14053"
    },
    axes: {
      x: { min: 2018.5, max: 2030.5, ticks: [2020, 2022, 2024, 2026, 2028, 2030], label: "Year" },
      y: { min: 0, max: 30, ticks: [0, 5, 10, 15, 20, 25, 30], label: "Dataset Size (Trillion Tokens)" }
    },
    bounds: { lower: 9, upper: 27 },
    current: { year: 2025, label: "Current (2025)" },
    modelPoints: [
      { id: "model-2019-01", year: 2019, tokensTrillions: 0.1 },
      { id: "gpt-3", year: 2020, tokensTrillions: 0.35, label: "GPT-3" },
      { id: "model-2021-01", year: 2021, tokensTrillions: 1.4 },
      { id: "model-2022-01", year: 2022, tokensTrillions: 1.4 },
      { id: "model-2023-01", year: 2023, tokensTrillions: 1.4 },
      { id: "llama-2", year: 2023, tokensTrillions: 2, label: "Llama 2" },
      { id: "model-2023-03", year: 2023, tokensTrillions: 12 },
      { id: "model-2023-04", year: 2023, tokensTrillions: 13 },
      { id: "model-2024-01", year: 2024, tokensTrillions: 10 },
      { id: "model-2024-02", year: 2024, tokensTrillions: 12 },
      { id: "llama-3", year: 2024, tokensTrillions: 15, label: "Llama 3" },
      { id: "deepseek-v3", year: 2025, tokensTrillions: 14.8, label: "DeepSeek-V3" }
    ],
    historicalTrend: [
      { year: 2019, tokensTrillions: 0.02 },
      { year: 2020, tokensTrillions: 0.08 },
      { year: 2021, tokensTrillions: 0.24 },
      { year: 2022, tokensTrillions: 0.68 },
      { year: 2023, tokensTrillions: 1.75 },
      { year: 2024, tokensTrillions: 4.7 },
      { year: 2025, tokensTrillions: 12 }
    ],
    projection: [
      { year: 2025, tokensTrillions: 15 },
      { year: 2025.5, tokensTrillions: 16.7 },
      { year: 2026, tokensTrillions: 19 },
      { year: 2026.5, tokensTrillions: 22.2 },
      { year: 2027, tokensTrillions: 25.5 },
      { year: 2027.4, tokensTrillions: 27 },
      { year: 2030, tokensTrillions: 27 }
    ]
  };

  const SVG_WIDTH = 720;
  const SVG_HEIGHT = 520;
  const PLOT = { left: 94, top: 28, width: 600, height: 390 };

  const LABEL_LAYOUTS = {
    "gpt-3": { dx: 15, dy: -18 },
    "llama-2": { dx: 15, dy: -24 },
    "llama-3": { dx: 13, dy: -28 },
    "deepseek-v3": { dx: -15, dy: 31, end: true }
  };

  function plotX(year) {
    const { min, max } = CHART_DATA.axes.x;
    return PLOT.left + ((year - min) / (max - min)) * PLOT.width;
  }

  function plotY(tokensTrillions) {
    const { min, max } = CHART_DATA.axes.y;
    return PLOT.top + (1 - (tokensTrillions - min) / (max - min)) * PLOT.height;
  }

  function createSmoothPath(points) {
    const coords = points.map(p => ({ x: plotX(p.year), y: plotY(p.tokensTrillions) }));
    if (coords.length === 0) return "";
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const prev = coords[i - 1] || coords[i];
      const curr = coords[i];
      const next = coords[i + 1];
      const afterNext = coords[i + 2] || next;

      const c1 = {
        x: curr.x + (next.x - prev.x) / 6,
        y: curr.y + (next.y - prev.y) / 6
      };
      const c2 = {
        x: next.x - (afterNext.x - curr.x) / 6,
        y: next.y - (afterNext.y - curr.y) / 6
      };

      path += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${next.x} ${next.y}`;
    }
    return path;
  }

  function createProjectionPath(points) {
    const start = points[0];
    const fc = points[1];
    const sc = points[4];
    const ceiling = points[points.length - 2];
    const end = points[points.length - 1];

    return [
      `M ${plotX(start.year)} ${plotY(start.tokensTrillions)}`,
      `C ${plotX(fc.year)} ${plotY(fc.tokensTrillions)}, ${plotX(sc.year)} ${plotY(sc.tokensTrillions)}, ${plotX(ceiling.year)} ${plotY(ceiling.tokensTrillions)}`,
      `L ${plotX(end.year)} ${plotY(end.tokensTrillions)}`
    ].join(" ");
  }

  function renderChart() {
    const root = document.getElementById('chart-root');
    if (!root) return;

    const historicalPath = createSmoothPath(CHART_DATA.historicalTrend);
    const projectionPath = createProjectionPath(CHART_DATA.projection);
    const plotRight = PLOT.left + PLOT.width;
    const plotBottom = PLOT.top + PLOT.height;
    const lowerBoundY = plotY(CHART_DATA.bounds.lower);
    const upperBoundY = plotY(CHART_DATA.bounds.upper);
    const currentX = plotX(CHART_DATA.current.year);
    const exhaustionY = plotY(27);
    const exhaustionX = plotX(2027.4);

    const html = `
      <figure class="dex-chart" data-animation-state="idle">
        <header class="dex-chart__header">
          <p class="dex-chart__eyebrow">Training data availability</p>
          <h2 class="dex-chart__title">${CHART_DATA.source.chartTitle}</h2>
        </header>

        <ul class="dex-chart__legend" aria-label="Chart legend">
          <li class="dex-chart__legend-item">
            <span class="dex-chart__legend-swatch dex-chart__legend-swatch--actual" aria-hidden="true"></span>
            <span>Actual Models</span>
          </li>
          <li class="dex-chart__legend-item">
            <span class="dex-chart__legend-swatch dex-chart__legend-swatch--historical" aria-hidden="true"></span>
            <span>Historical Trend</span>
          </li>
          <li class="dex-chart__legend-item">
            <span class="dex-chart__legend-swatch dex-chart__legend-swatch--projection" aria-hidden="true"></span>
            <span>Compute-Optimal Projection</span>
          </li>
          <li class="dex-chart__legend-item">
            <span class="dex-chart__legend-swatch dex-chart__legend-swatch--bounds" aria-hidden="true"></span>
            <span>Data Bounds (9-27T tokens)</span>
          </li>
          <li class="dex-chart__legend-item">
            <span class="dex-chart__legend-swatch dex-chart__legend-swatch--current" aria-hidden="true"></span>
            <span>Current (2025)</span>
          </li>
        </ul>

        <svg class="dex-chart__svg" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" role="img">
          <title>${CHART_DATA.source.chartTitle}</title>

          <!-- Stock Band -->
          <rect class="dex-chart__stock-band"
                x="${PLOT.left}"
                y="${upperBoundY}"
                width="${PLOT.width}"
                height="${lowerBoundY - upperBoundY}" />

          <!-- Grid -->
          <g class="dex-chart__grid" aria-hidden="true">
            ${CHART_DATA.axes.y.ticks.map(tick => {
              const y = plotY(tick);
              return `<line x1="${PLOT.left}" y1="${y}" x2="${plotRight}" y2="${y}" />`;
            }).join('')}
            ${CHART_DATA.axes.x.ticks.map(tick => {
              const x = plotX(tick);
              return `<line x1="${x}" y1="${PLOT.top}" x2="${x}" y2="${plotBottom}" />`;
            }).join('')}
          </g>

          <!-- Bounds -->
          <line class="dex-chart__bound"
                x1="${PLOT.left}" y1="${lowerBoundY}"
                x2="${plotRight}" y2="${lowerBoundY}" />
          <line class="dex-chart__bound"
                x1="${PLOT.left}" y1="${upperBoundY}"
                x2="${plotRight}" y2="${upperBoundY}" />

          <!-- Historical Trend -->
          <path class="dex-chart__historical" d="${historicalPath}" fill="none" />

          <!-- Current Marker -->
          <line class="dex-chart__current-marker"
                x1="${currentX}" y1="${PLOT.top}"
                x2="${currentX}" y2="${plotBottom}" />

          <!-- Projection -->
          <path class="dex-chart__projection" d="${projectionPath}" fill="none" />

          <!-- Model Points -->
          ${CHART_DATA.modelPoints.map((point, index) => {
            const x = plotX(point.year);
            const y = plotY(point.tokensTrillions);
            const layout = LABEL_LAYOUTS[point.id];

            if (layout && point.label) {
              const labelX = x + layout.dx;
              const labelY = y + layout.dy;
              const lineEndX = layout.end ? labelX + 6 : labelX - 6;
              const lineEndY = labelY - 4;
              const anchor = layout.end ? 'end' : 'start';

              return `
                <g class="dex-chart__model-point" style="--dex-point-index: ${index}">
                  <circle class="dex-chart__model-dot" cx="${x}" cy="${y}" r="7.25" />
                  <line class="dex-chart__leader" x1="${x}" y1="${y}" x2="${lineEndX}" y2="${lineEndY}" />
                  <text class="dex-chart__model-label" x="${labelX}" y="${labelY}" text-anchor="${anchor}">${point.label}</text>
                </g>
              `;
            } else {
              return `
                <g class="dex-chart__model-point" style="--dex-point-index: ${index}">
                  <circle class="dex-chart__model-dot" cx="${x}" cy="${y}" r="7.25" />
                </g>
              `;
            }
          }).join('')}

          <!-- Annotations -->
          <g class="dex-chart__annotations">
            <text class="dex-chart__current-label" x="${currentX + 10}" y="${PLOT.top + 18}">
              ${CHART_DATA.current.label}
            </text>

            <g class="dex-chart__callout">
              <rect x="500" y="206" width="166" height="63" rx="10" />
              <text x="516" y="230">Available data</text>
              <text x="516" y="249">stock range · 9–27T</text>
            </g>

            <circle class="dex-chart__exhaustion-pulse" cx="${exhaustionX}" cy="${exhaustionY}" r="9" />
            <circle class="dex-chart__exhaustion-dot" cx="${exhaustionX}" cy="${exhaustionY}" r="4.5" />
          </g>

          <!-- Axes -->
          <g class="dex-chart__axes">
            <rect class="dex-chart__frame" x="${PLOT.left}" y="${PLOT.top}" width="${PLOT.width}" height="${PLOT.height}" />

            ${CHART_DATA.axes.y.ticks.map(tick => {
              const y = plotY(tick);
              return `
                <line class="dex-chart__tick" x1="${PLOT.left - 6}" y1="${y}" x2="${PLOT.left}" y2="${y}" />
                <text class="dex-chart__tick-label" x="${PLOT.left - 13}" y="${y + 5}" text-anchor="end">${tick}</text>
              `;
            }).join('')}

            ${CHART_DATA.axes.x.ticks.map(tick => {
              const x = plotX(tick);
              return `
                <line class="dex-chart__tick" x1="${x}" y1="${plotBottom}" x2="${x}" y2="${plotBottom + 6}" />
                <text class="dex-chart__tick-label" x="${x}" y="${plotBottom + 27}" text-anchor="middle">${tick}</text>
              `;
            }).join('')}

            <text class="dex-chart__axis-title" x="${PLOT.left + PLOT.width / 2}" y="${SVG_HEIGHT - 16}" text-anchor="middle">
              ${CHART_DATA.axes.x.label}
            </text>
            <text class="dex-chart__axis-title" x="24" y="${PLOT.top + PLOT.height / 2}" text-anchor="middle"
                  transform="rotate(-90 24 ${PLOT.top + PLOT.height / 2})">
              ${CHART_DATA.axes.y.label}
            </text>
          </g>
        </svg>

        <figcaption class="dex-chart__caption">
          Projection shown as published: "Current (2025)" is the source figure's baseline. Values are reconstructed from the supplied figure; anonymous marks remain intentionally unlabeled.
          Source: <a href="${CHART_DATA.source.sourceUrl}" target="_blank" rel="noreferrer">Patro &amp; Agneeswaran, <em>LLMOrbit</em> (2026)</a>.
        </figcaption>
      </figure>
    `;

    root.innerHTML = html;

    // Setup intersection observer for animation
    const chart = root.querySelector('.dex-chart');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      chart.setAttribute('data-animation-state', 'complete');
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && chart.getAttribute('data-animation-state') === 'idle') {
              chart.setAttribute('data-animation-state', 'playing');
              observer.disconnect();
            }
          });
        },
        { threshold: 0.35, rootMargin: '0px 0px -10% 0px' }
      );
      observer.observe(chart);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderChart);
  } else {
    renderChart();
  }
})();
