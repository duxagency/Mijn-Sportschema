/**
 * Vaste achtergrond-laag met losse, onafhankelijk bewegende kleur-"blobs".
 * Puur decoratief; styling en animaties staan in globals.css (.ambient).
 */
export function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <span className="ambient__blob ambient__blob--1" />
      <span className="ambient__blob ambient__blob--2" />
      <span className="ambient__blob ambient__blob--3" />
      <span className="ambient__blob ambient__blob--4" />
    </div>
  );
}
