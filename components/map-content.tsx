/**
 * Map Content Component
 *
 * The actual Leaflet map implementation
 * Separated from main component to handle SSR properly
 */

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon issue
const DefaultIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.setIcon(DefaultIcon);

export default function MapContent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    // Office location coordinates
    // San Francisco, CA - "123 Business Street"
    const latitude = 37.7749;
    const longitude = -122.4194;

    if (map.current) {
      return; // Map already initialized
    }

    if (mapContainer.current) {
      // Initialize map
      map.current = L.map(mapContainer.current).setView(
        [latitude, longitude],
        15,
      );

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map.current);

      // Add marker with office location
      L.marker([latitude, longitude], { icon: DefaultIcon })
        .bindPopup(
          `
          <div class="text-sm font-medium">Our Office</div>
          <div class="text-xs text-gray-600">123 Business Street</div>
          <div class="text-xs text-gray-600">San Francisco, CA 94102</div>
          <div class="text-xs text-gray-600 mt-1">Mon-Fri: 9am - 6pm</div>
        `,
        )
        .openPopup()
        .addTo(map.current);
    }

    // Cleanup function
    return () => {
      // Don't remove map, just keep it
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      className="w-full h-[400px] bg-muted rounded-lg"
      style={{ minHeight: "400px" }}
    />
  );
}
