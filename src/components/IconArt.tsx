/**
 * Gedeeld app-icoon (wordmark "MS" op een donkere gradient). Wordt door de
 * icon-routes via next/og ImageResponse naar PNG gerenderd, zodat we geen
 * losse beeldbestanden hoeven te beheren.
 */
export function IconArt({ size }: { size: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #2c2668 0%, #0a3a4a 100%)",
        color: "#ededed",
        fontSize: Math.round(size * 0.42),
        fontWeight: 700,
      }}
    >
      MS
    </div>
  );
}
