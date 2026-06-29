/**
 * Gedeeld app-icoon: een halter (dumbbell) op een donkere gradient. Wordt door
 * de icon-routes via next/og ImageResponse naar PNG gerenderd, zodat we geen
 * losse beeldbestanden hoeven te beheren.
 */
export function IconArt({ size }: { size: number }) {
  const color = "#f4f4f5";
  const radius = Math.max(2, Math.round(size * 0.03));
  const gap = Math.round(size * 0.015);

  const plate = (w: number, h: number) => ({
    width: Math.round(size * w),
    height: Math.round(size * h),
    background: color,
    borderRadius: radius,
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap,
        background: "linear-gradient(135deg, #2c2668 0%, #0a3a4a 100%)",
      }}
    >
      {/* linker platen */}
      <div style={plate(0.075, 0.3)} />
      <div style={plate(0.1, 0.46)} />
      {/* stang */}
      <div style={plate(0.26, 0.1)} />
      {/* rechter platen */}
      <div style={plate(0.1, 0.46)} />
      <div style={plate(0.075, 0.3)} />
    </div>
  );
}
