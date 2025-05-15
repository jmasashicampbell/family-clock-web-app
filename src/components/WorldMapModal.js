import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import tzlookup from 'tz-lookup';
import '../styles/WorldMapModal.css';

// Fix for Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component to handle map clicks and place marker
function MapMarker({ position, setPosition }) {
  useMapEvents({
    click: (e) => {
      // Make sure e and e.latlng exist before accessing properties
      if (e && e.latlng && typeof e.latlng.lat === 'number' && typeof e.latlng.lng === 'number') {
        setPosition([e.latlng.lat, e.latlng.lng]);
      } else {
        console.error('Invalid map click event:', e);
      }
    },
  });

  // Only render marker if position is valid
  return (Array.isArray(position) && position.length === 2) ? 
    <Marker position={position} /> : null;
}

// Function to get timezone from coordinates using tz-lookup
function getTimezoneFromCoordinates(lat, lng) {
  try {
    // Get the IANA timezone identifier from coordinates
    const timezone = tzlookup(lat, lng);
    
    // Get a friendly location name based on the timezone
    const location = getLocationNameFromTimezone(timezone, lat, lng);
    
    return {
      timezone,
      location,
    };
  } catch (error) {
    console.error('Error determining timezone:', error);
    return estimateTimezoneFromCoordinates(lat, lng);
  }
}

// Function to get a friendly location name from timezone
function getLocationNameFromTimezone(timezone, lat, lng) {
  // Extract region and city from timezone (e.g., 'America/New_York' -> 'New York')
  const parts = timezone.split('/');
  
  if (parts.length >= 2) {
    // Convert 'New_York' to 'New York'
    let city = parts[parts.length - 1].replace(/_/g, ' ');
    
    // Special case for some common timezones
    const specialCases = {
      'America/Los_Angeles': 'Los Angeles',
      'America/New_York': 'New York',
      'Europe/London': 'London',
    };
    
    if (specialCases[timezone]) {
      return specialCases[timezone];
    }
    
    return city;
  }
  
  // If we can't extract a good name, estimate based on coordinates
  return estimateLocationFromCoordinates(lat, lng);
}

// Function to estimate location name from coordinates
function estimateLocationFromCoordinates(lat, lng) {
  // Simple estimation based on longitude and latitude
  // Determine continent/region
  let region;
  if (lng >= -168 && lng <= -52 && lat >= 15 && lat <= 72) {
    region = 'North America';
  } else if (lng >= -82 && lng <= -34 && lat >= -55 && lat <= 12) {
    region = 'South America';
  } else if (lng >= -25 && lng <= 65 && lat >= 35 && lat <= 72) {
    region = 'Europe';
  } else if (lng >= -25 && lng <= 65 && lat >= -35 && lat <= 35) {
    region = 'Africa';
  } else if (lng >= 65 && lng <= 180 && lat >= 0 && lat <= 82) {
    region = 'Asia';
  } else if (lng >= 110 && lng <= 180 && lat >= -50 && lat <= 0) {
    region = 'Oceania';
  } else {
    region = 'International Waters';
  }
  
  // Format the coordinates for display
  const latDeg = Math.abs(lat).toFixed(2) + '° ' + (lat >= 0 ? 'N' : 'S');
  const lngDeg = Math.abs(lng).toFixed(2) + '° ' + (lng >= 0 ? 'E' : 'W');
  
  return `${region} (${latDeg}, ${lngDeg})`;
}

// Fallback function to estimate timezone from coordinates
function estimateTimezoneFromCoordinates(lat, lng) {
  // Map of common locations by longitude range
  const locations = [
    { min: -180, max: -135, timezone: 'Pacific/Honolulu', name: 'Hawaii' },
    { min: -135, max: -115, timezone: 'America/Anchorage', name: 'Alaska' },
    { min: -115, max: -105, timezone: 'America/Los_Angeles', name: 'Pacific Time' },
    { min: -105, max: -90, timezone: 'America/Denver', name: 'Mountain Time' },
    { min: -90, max: -75, timezone: 'America/Chicago', name: 'Central Time' },
    { min: -75, max: -60, timezone: 'America/New_York', name: 'Eastern Time' },
    { min: -60, max: -30, timezone: 'America/Halifax', name: 'Atlantic Time' },
    { min: -30, max: 0, timezone: 'Europe/London', name: 'London' },
    { min: 0, max: 15, timezone: 'Europe/Paris', name: 'Paris' },
    { min: 15, max: 30, timezone: 'Europe/Athens', name: 'Athens' },
    { min: 30, max: 60, timezone: 'Asia/Dubai', name: 'Dubai' },
    { min: 60, max: 90, timezone: 'Asia/Kolkata', name: 'India' },
    { min: 90, max: 120, timezone: 'Asia/Bangkok', name: 'Bangkok' },
    { min: 120, max: 135, timezone: 'Asia/Shanghai', name: 'China' },
    { min: 135, max: 150, timezone: 'Asia/Tokyo', name: 'Japan' },
    { min: 150, max: 180, timezone: 'Australia/Sydney', name: 'Sydney' },
  ];
  
  // Find the matching location
  const location = locations.find(loc => lng >= loc.min && lng < loc.max);
  
  if (location) {
    return {
      timezone: location.timezone,
      location: location.name
    };
  }
  
  // Default fallback
  return {
    timezone: 'UTC',
    location: 'Coordinated Universal Time'
  };
}

function WorldMapModal({ isOpen, onClose, onSave, initialPosition }) {
  // Ensure initialPosition is a valid array with two numbers
  const validInitialPosition = Array.isArray(initialPosition) && 
    initialPosition.length === 2 && 
    typeof initialPosition[0] === 'number' && 
    typeof initialPosition[1] === 'number' ? 
    initialPosition : [0, 0];
    
  const [position, setPosition] = useState(validInitialPosition);
  const [isLoading, setIsLoading] = useState(false);
  
  // If modal is closed, reset state
  useEffect(() => {
    if (!isOpen) return;
    
    // Set initial position if provided and valid
    if (Array.isArray(initialPosition) && 
        initialPosition.length === 2 && 
        typeof initialPosition[0] === 'number' && 
        typeof initialPosition[1] === 'number') {
      setPosition(initialPosition);
    } else {
      // Default to a valid position if initialPosition is invalid
      setPosition([0, 0]);
    }
  }, [isOpen, initialPosition]);
  
  const handleSave = () => {
    // Ensure position is valid before proceeding
    if (!position || !Array.isArray(position) || position.length !== 2) {
      console.error('Invalid position data:', position);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const [lat, lng] = position;
      
      // Additional validation for lat/lng
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        throw new Error('Invalid latitude or longitude values');
      }
      
      const locationInfo = getTimezoneFromCoordinates(lat, lng);
      
      onSave({
        timezone: locationInfo.timezone,
        location: locationInfo.location,
        coordinates: position
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
      alert('There was an error saving the location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Select Location</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="map-container">
          <MapContainer 
            center={Array.isArray(position) && position.length === 2 ? position : [0, 0]} 
            zoom={2} 
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapMarker position={position} setPosition={setPosition} />
          </MapContainer>
          
          <div className="instructions">
            Click on the map to place a pin where the family member is located
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="cancel-button" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="save-button" 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Location'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorldMapModal;
