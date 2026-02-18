// Simple cached current year component for site-wide reuse
// Computes once at module load to avoid re-renders doing Date math
const CURRENT_YEAR = new Date().getFullYear();

export default function FooterYear() {
  return <>{CURRENT_YEAR}</>;
}
