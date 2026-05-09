/**
 * GlobalPlanet — shared planet image component
 *
 * A thin wrapper around <img> that enforces consistent rendering
 * for planet visuals used in both Level 1 (carousel) and Level 2
 * (background layers).
 *
 * Usage:
 *   import GlobalPlanet from '../components/GlobalPlanet';
 *   <GlobalPlanet src={planet.image} alt={planet.id} className="planet__body" />
 *
 * Note: Level 1 currently renders planet images via plain <img> tags in
 * index.html because the carousel is vanilla-GSAP. This component is ready
 * to adopt those images once Level 1 is migrated to React.
 */
export default function GlobalPlanet({ src, alt, className, style, ...rest }) {
  return (
    <img
      src={src}
      alt={alt ?? ''}
      className={className}
      style={style}
      draggable={false}
      {...rest}
    />
  );
}
