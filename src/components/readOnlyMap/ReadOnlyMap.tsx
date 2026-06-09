'use client';
import React, { useEffect, useRef } from 'react';

/**
 * ReadOnlyMap (Google Maps JS already loaded via <script>)
 * - Centers on given coordinates
 * - Draws a yellow circle (radius in meters)
 * - Map is READ-ONLY (no pan, no clicks), but zoom in/out is allowed
 * - Circle scales naturally with zoom because it's meter-based
 */

type ReadOnlyMapProps = {
  coordinates: { lat: number; lng: number };
  /** Circle radius in meters */
  radiusMeters?: number;
  /** Initial zoom level (used unless autoFitToCircle=true) */
  initialZoom?: number;
  /** Optional min/max zoom */
  minZoom?: number;
  maxZoom?: number;
  /** Optional Map ID (Cloud Styled Maps) */
  mapId?: string;
  /** Container height (tailwind or px via style) */
  heightClassName?: string; // e.g., 'h-[500px]'
  /** If true, fit to circle on first paint (overrides initialZoom) */
  autoFitToCircle?: boolean;
};

export default function ReadOnlyMap({
  coordinates,
  radiusMeters = 150,
  initialZoom = 15,
  minZoom,
  maxZoom,
  mapId,
  heightClassName = 'h-[420px]',
  autoFitToCircle = false,
}: ReadOnlyMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // -------- Wait for Google Maps to Load ----------
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 100; // 10 seconds max wait time

    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(checkGoogleMaps, 100);
      }
    };
    checkGoogleMaps();
  }, []);

  // --- init map once ---
  useEffect(() => {
    if (!isLoaded || !window.google?.maps || !mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: coordinates,
      zoom: initialZoom, // try to respect prop at construction
      minZoom,
      maxZoom,
      mapId,
      disableDefaultUI: true, // hide all
      zoomControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: false,
      keyboardShortcuts: false,
      draggable: false,
      clickableIcons: false,
      scrollwheel: false,
      gestureHandling: 'none',
      backgroundColor: '#f8f9fa',
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    mapInstance.current = map;

    // Yellow circle in meters — scales with zoom automatically
    circleRef.current = new google.maps.Circle({
      map,
      center: coordinates,
      radius: radiusMeters,
      strokeColor: '#FFC107',
      strokeOpacity: 0.95,
      strokeWeight: 2,
      fillColor: '#FFEB3B',
      fillOpacity: 0.25,
      clickable: false,
    });

    // Apply either fitBounds (if asked) or force the desired initial zoom
    if (autoFitToCircle) {
      const bounds = circleRef.current.getBounds();
      if (bounds) map.fitBounds(bounds, 40);
    }

    // Some layouts (hidden tabs/responsive containers) trigger a resize after init,
    // which can override zoom. Ensure our desired zoom after the first idle.
    google.maps.event.addListenerOnce(map, 'idle', () => {
      if (!autoFitToCircle && typeof initialZoom === 'number') {
        map.setZoom(initialZoom);
      }
    });

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      mapInstance.current = null;
    };

  }, [isLoaded]);

  // --- keep center in sync ---
  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.setCenter(coordinates);
    if (circleRef.current) circleRef.current.setCenter(coordinates);
  }, [coordinates.lat, coordinates.lng]);


  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.setRadius(radiusMeters);
  }, [radiusMeters]);


  useEffect(() => {
    if (!mapInstance.current) return;
    if (autoFitToCircle) return;
    if (typeof initialZoom === 'number') {
      mapInstance.current.setZoom(initialZoom);
    }
  }, [initialZoom, autoFitToCircle]);

  return (
    <div className="p-4">
      <div className={`rounded-2xl overflow-hidden ${heightClassName}`}>
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  );
}

