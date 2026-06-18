type Point = { label: string; value: number };

/**
 * Lichtgewicht SVG-lijngrafiek (geen dependency). Toont de waarde per training
 * over tijd, met de min/max op de y-as en de eerste/laatste datum op de x-as.
 */
export function ProgressChart({ points }: { points: Point[] }) {
  if (points.length === 0) return null;

  const W = 320;
  const H = 150;
  const padX = 12;
  const padTop = 14;
  const padBottom = 22;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const single = points.length <= 1;
  const xAt = (i: number) =>
    single ? W / 2 : padX + (i / (points.length - 1)) * innerW;
  const yAt = (v: number) => padTop + innerH - ((v - min) / range) * innerH;

  const linePts = points
    .map((p, i) => `${xAt(i).toFixed(1)},${yAt(p.value).toFixed(1)}`)
    .join(" ");

  const baseY = padTop + innerH;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Voortgangsgrafiek"
    >
      {/* basislijn */}
      <line
        x1={padX}
        y1={baseY}
        x2={W - padX}
        y2={baseY}
        stroke="#262626"
        strokeWidth="1"
      />

      {!single && (
        <>
          <polygon
            points={`${padX},${baseY} ${linePts} ${W - padX},${baseY}`}
            fill="#34d399"
            opacity="0.1"
          />
          <polyline
            points={linePts}
            fill="none"
            stroke="#34d399"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}

      {points.map((p, i) => (
        <circle key={i} cx={xAt(i)} cy={yAt(p.value)} r="3" fill="#34d399" />
      ))}

      {/* y-as: max boven, min onder */}
      <text x={padX} y={padTop - 4} fill="#737373" fontSize="9">
        {max}
      </text>
      {max !== min && (
        <text x={padX} y={baseY + 14} fill="#737373" fontSize="9">
          {min}
        </text>
      )}

      {/* x-as: eerste en laatste datum */}
      <text x={padX} y={H - 4} fill="#737373" fontSize="9">
        {points[0].label}
      </text>
      {!single && (
        <text x={W - padX} y={H - 4} fill="#737373" fontSize="9" textAnchor="end">
          {points[points.length - 1].label}
        </text>
      )}
    </svg>
  );
}
