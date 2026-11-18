import L from 'leaflet';

// Esri Canvas basemaps work without an API key (CARTO now requires one).
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas';
const ATTRIBUTION =
  'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors';

const tileUrl = (dark: boolean, layer: 'Base' | 'Reference') =>
  `${ESRI}/World_${dark ? 'Dark' : 'Light'}_Gray_${layer}/MapServer/tile/{z}/{y}/{x}`;

const isDarkTheme = () => document.documentElement.classList.contains('dark');

// Adds base + label layers that follow the site's light/dark theme.
// Returns a cleanup function that stops watching the theme.
export function addThemedBaseLayers(map: L.Map): () => void {
  const options = { attribution: ATTRIBUTION, maxNativeZoom: 16, maxZoom: 19 };
  const base = L.tileLayer('', options).addTo(map);
  const labels = L.tileLayer('', { ...options, attribution: '' }).addTo(map);

  let dark: boolean | null = null;
  const apply = () => {
    const next = isDarkTheme();
    if (next === dark) return;
    dark = next;
    base.setUrl(tileUrl(next, 'Base'));
    labels.setUrl(tileUrl(next, 'Reference'));
  };
  apply();

  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}
