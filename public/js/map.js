// Google Maps Polygon Drawing Utility
class TerritoryMap {
  constructor(mapContainerId, options = {}) {
    this.mapContainerId = mapContainerId;
    this.map = null;
    this.drawingManager = null;
    this.polygon = null;
    this.markers = [];
    this.polygons = [];
    this.searchMarker = null;
    this.autocomplete = null;
    this.options = {
      center: options.center || { lat: 20.5937, lng: 78.9629 }, // Default to India center
      zoom: options.zoom || 6,
      enableDrawing: options.enableDrawing !== false,
      onPolygonComplete: options.onPolygonComplete || null,
      onMarkerComplete: options.onMarkerComplete || null,
      onMarkerMove: options.onMarkerMove || null,
      existingPolygon: options.existingPolygon || null
    };
  }

  init() {
    const apiKey = 'AIzaSyCBeMKby4VT9fX_nOX22HlyPHs5wn-6QCg';

    // Load Google Maps script if not already loaded
    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing,geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = () => this.initMap();
      document.head.appendChild(script);
    } else {
      this.initMap();
    }
  }

  initMap() {
    const container = document.getElementById(this.mapContainerId);
    if (!container) {
      console.error(`Map container #${this.mapContainerId} not found`);
      return;
    }

    // Initialize map
    this.map = new google.maps.Map(container, {
      center: this.options.center,
      zoom: this.options.zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      fullscreenControl: true
    });

    // Load existing polygon if provided
    if (this.options.existingPolygon) {
      this.loadPolygon(this.options.existingPolygon);
    }

    // Initialize drawing manager if drawing is enabled
    if (this.options.enableDrawing) {
      this.initDrawingManager();
    }

    // Initialize autocomplete if search input exists
    this.initAutocomplete();
  }

  initAutocomplete() {
    const searchInput = document.getElementById('location-search');
    if (!searchInput || !window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }

    // Create autocomplete instance
    this.autocomplete = new google.maps.places.Autocomplete(searchInput, {
      types: ['geocode', 'establishment'], // Limit to addresses and places
      fields: ['geometry', 'formatted_address', 'name']
    });

    // When a place is selected from autocomplete
    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      
      if (!place.geometry) {
        console.error('No geometry found for place');
        return;
      }

      // Center map on selected place
      if (place.geometry.viewport) {
        this.map.fitBounds(place.geometry.viewport);
      } else {
        this.map.setCenter(place.geometry.location);
        this.map.setZoom(15);
      }

      // Add marker at selected location
      if (this.searchMarker) {
        this.searchMarker.setMap(null);
      }

      this.searchMarker = new google.maps.Marker({
        position: place.geometry.location,
        map: this.map,
        title: place.formatted_address || place.name,
        animation: google.maps.Animation.DROP
      });

      // Show info window
      const infoWindow = new google.maps.InfoWindow({
        content: `<div class="p-2">
          <p class="font-semibold">${place.formatted_address || place.name}</p>
          <p class="text-xs text-gray-600 mt-1">You can now draw your territory boundary from here.</p>
        </div>`
      });

      infoWindow.open(this.map, this.searchMarker);

      // Auto-close info window after 5 seconds
      setTimeout(() => {
        infoWindow.close();
      }, 5000);
    });
  }

  initDrawingManager() {
    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.POLYGON,
          google.maps.drawing.OverlayType.MARKER
        ]
      },
      polygonOptions: {
        fillColor: '#4285F4',
        fillOpacity: 0.35,
        strokeWeight: 2,
        strokeColor: '#4285F4',
        clickable: false,
        editable: true,
        zIndex: 1
      },
      markerOptions: {
        draggable: true
      }
    });

    this.drawingManager.setMap(this.map);

    // Listen for drawing completion (polygon or marker)
    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (event) => {
      if (event.type === google.maps.drawing.OverlayType.POLYGON) {
        // Remove previous polygon if exists
        if (this.polygon) {
          this.polygon.setMap(null);
        }

        this.polygon = event.overlay;
        const path = this.polygon.getPath();
        const coordinates = this.getPolygonCoordinates(path);

        // Store coordinates in hidden input
        this.updatePolygonInput(coordinates);

        // Call callback if provided
        if (this.options.onPolygonComplete) {
          this.options.onPolygonComplete(coordinates);
        }

        // Make polygon editable
        google.maps.event.addListener(path, 'set_at', () => {
          const updatedCoords = this.getPolygonCoordinates(path);
          this.updatePolygonInput(updatedCoords);
          if (this.options.onPolygonComplete) {
            this.options.onPolygonComplete(updatedCoords);
          }
        });

        google.maps.event.addListener(path, 'insert_at', () => {
          const updatedCoords = this.getPolygonCoordinates(path);
          this.updatePolygonInput(updatedCoords);
          if (this.options.onPolygonComplete) {
            this.options.onPolygonComplete(updatedCoords);
          }
        });

        google.maps.event.addListener(path, 'remove_at', () => {
          const updatedCoords = this.getPolygonCoordinates(path);
          this.updatePolygonInput(updatedCoords);
          if (this.options.onPolygonComplete) {
            this.options.onPolygonComplete(updatedCoords);
          }
        });
      } else if (event.type === google.maps.drawing.OverlayType.MARKER) {
        // Only keep one marker at a time
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [event.overlay];

        const marker = event.overlay;

        const emitMarkerPosition = () => {
          const pos = marker.getPosition();
          const data = { lat: pos.lat(), lng: pos.lng() };
          if (this.options.onMarkerComplete) {
            this.options.onMarkerComplete(data);
          }
          if (this.options.onMarkerMove) {
            this.options.onMarkerMove(data);
          }
        };

        // Initial position
        emitMarkerPosition();

        // When user drags the marker, update again
        google.maps.event.addListener(marker, 'dragend', emitMarkerPosition);
      }
    });
  }

  getPolygonCoordinates(path) {
    const coordinates = [];
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordinates.push({
        lat: point.lat(),
        lng: point.lng()
      });
    }
    return coordinates;
  }

  updatePolygonInput(coordinates) {
    const input = document.getElementById('polygon_coordinates');
    if (input) {
      input.value = JSON.stringify(coordinates);
    }
  }

  loadPolygon(coordinates) {
    if (!this.map || !coordinates) return;

    try {
      // Parse coordinates if string
      const coords = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
      
      if (!Array.isArray(coords) || coords.length === 0) return;

      // Convert to Google Maps LatLng array
      const path = coords.map(coord => ({
        lat: coord.lat || coord[1],
        lng: coord.lng || coord[0]
      }));

      // Create polygon
      this.polygon = new google.maps.Polygon({
        paths: path,
        editable: true,
        draggable: false,
        fillColor: '#4285F4',
        fillOpacity: 0.35,
        strokeWeight: 2,
        strokeColor: '#4285F4',
        map: this.map
      });

      // Fit map to polygon bounds
      const bounds = new google.maps.LatLngBounds();
      path.forEach(point => bounds.extend(point));
      this.map.fitBounds(bounds);

      // Make editable and listen for changes
      const polygonPath = this.polygon.getPath();
      google.maps.event.addListener(polygonPath, 'set_at', () => {
        const updatedCoords = this.getPolygonCoordinates(polygonPath);
        this.updatePolygonInput(updatedCoords);
      });

      google.maps.event.addListener(polygonPath, 'insert_at', () => {
        const updatedCoords = this.getPolygonCoordinates(polygonPath);
        this.updatePolygonInput(updatedCoords);
      });

      google.maps.event.addListener(polygonPath, 'remove_at', () => {
        const updatedCoords = this.getPolygonCoordinates(polygonPath);
        this.updatePolygonInput(updatedCoords);
      });
    } catch (error) {
      console.error('Error loading polygon:', error);
    }
  }

  addTerritoryPolygon(territory, color = '#4285F4') {
    if (!this.map || !territory.polygon_coordinates) return null;

    try {
      const coords = typeof territory.polygon_coordinates === 'string' 
        ? JSON.parse(territory.polygon_coordinates) 
        : territory.polygon_coordinates;

      if (!Array.isArray(coords) || coords.length === 0) return null;

      const path = coords.map(coord => ({
        lat: coord.lat || coord[1],
        lng: coord.lng || coord[0]
      }));

      const polygon = new google.maps.Polygon({
        paths: path,
        fillColor: color,
        fillOpacity: 0.2,
        strokeWeight: 2,
        strokeColor: color,
        map: this.map
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold">${territory.name}</h3>
            <p class="text-sm text-gray-600">${territory.description || 'No description'}</p>
            <a href="/territories/${territory.id}/edit" class="text-blue-600 text-sm">Edit</a>
          </div>
        `
      });

      polygon.addListener('click', () => {
        infoWindow.open(this.map, polygon);
      });

      this.polygons.push({ polygon, territory });
      return polygon;
    } catch (error) {
      console.error('Error adding territory polygon:', error);
      return null;
    }
  }

  clearPolygons() {
    this.polygons.forEach(({ polygon }) => {
      polygon.setMap(null);
    });
    this.polygons = [];
  }

  fitBounds(polygons) {
    if (!this.map || polygons.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    polygons.forEach(({ polygon }) => {
      const path = polygon.getPath();
      for (let i = 0; i < path.getLength(); i++) {
        bounds.extend(path.getAt(i));
      }
    });
    this.map.fitBounds(bounds);
  }

  searchLocation(query) {
    return new Promise((resolve, reject) => {
      if (!this.map || !window.google || !window.google.maps) {
        reject(new Error('Map not initialized'));
        return;
      }

      if (!window.google.maps.places) {
        reject(new Error('Places library not loaded'));
        return;
      }

      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ address: query }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const location = results[0].geometry.location;
          const bounds = results[0].geometry.viewport;
          
          // Center map on the location
          this.map.setCenter(location);
          
          // If there's a viewport, fit to it; otherwise zoom to a reasonable level
          if (bounds) {
            this.map.fitBounds(bounds);
          } else {
            this.map.setZoom(15);
          }
          
          // Add a marker at the searched location
          if (this.searchMarker) {
            this.searchMarker.setMap(null);
          }
          
          this.searchMarker = new google.maps.Marker({
            position: location,
            map: this.map,
            title: results[0].formatted_address,
            animation: google.maps.Animation.DROP
          });
          
          // Show info window with address
          const infoWindow = new google.maps.InfoWindow({
            content: `<div class="p-2">
              <p class="font-semibold">${results[0].formatted_address}</p>
              <p class="text-xs text-gray-600 mt-1">You can now draw your territory boundary from here.</p>
            </div>`
          });
          
          infoWindow.open(this.map, this.searchMarker);
          
          // Auto-close info window after 5 seconds
          setTimeout(() => {
            infoWindow.close();
          }, 5000);
          
          resolve(location);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TerritoryMap;
}

