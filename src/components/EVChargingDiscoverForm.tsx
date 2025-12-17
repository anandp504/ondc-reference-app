import { useState, useEffect, useRef } from 'react';
import type { DiscoverRequest, CatalogResponse } from '../types';
import { generateUUID } from '../utils/uuid';

interface EVChargingDiscoverFormProps {
  onDiscover: (catalogResponse: CatalogResponse | null, error: string | null) => void;
  onLoading?: (isLoading: boolean) => void;
  defaultRequest?: DiscoverRequest;
  useLocalCatalog?: boolean;
}

const DISCOVER_API_URL = import.meta.env.VITE_DISCOVER_API_URL || '/api/beckn/discover';

type SearchMode = 'filters' | 'text';

// Default expression for EV Charging
const DEFAULT_EXPRESSION = "$[?(@.beckn:itemAttributes.connectorType=='CCS2' && @.beckn:itemAttributes.amenityFeature[*] == 'RESTROOM')]";

// Default coordinates for EV Charging
const DEFAULT_COORDINATES = '13.0820,80.2750';

export default function EVChargingDiscoverForm({ onDiscover, onLoading, defaultRequest, useLocalCatalog = false }: EVChargingDiscoverFormProps) {
  // Use ref to persist searchMode across component remounts
  const searchModeRef = useRef<SearchMode>(
    (() => {
      const saved = sessionStorage.getItem('evChargingDiscoverForm_searchMode');
      return (saved === 'text' || saved === 'filters') ? saved as SearchMode : 'filters';
    })()
  );
  
  // Track if user has manually modified expression/coordinates
  const expressionModifiedRef = useRef(false);
  const coordinatesModifiedRef = useRef(false);
  
  // Helper to get persisted or default expression
  const getInitialExpression = (): string => {
    const saved = sessionStorage.getItem('evChargingDiscoverForm_expression');
    return saved || DEFAULT_EXPRESSION;
  };
  
  // Helper to get persisted or default coordinates
  const getInitialCoordinates = (): string => {
    const saved = sessionStorage.getItem('evChargingDiscoverForm_coordinates');
    return saved || DEFAULT_COORDINATES;
  };
  
  // Helper to get persisted or default text search
  const getInitialTextSearch = (): string => {
    const saved = sessionStorage.getItem('evChargingDiscoverForm_textSearch');
    if (saved) return saved;
    return defaultRequest?.message.text_search || 'CCS2 fast charging station';
  };
  
  const [searchMode, setSearchMode] = useState<SearchMode>(searchModeRef.current);
  const [textSearch, setTextSearch] = useState(() => getInitialTextSearch());
  const [expression, setExpression] = useState(() => getInitialExpression());
  const [coordinates, setCoordinates] = useState(() => getInitialCoordinates());
  const [radius, setRadius] = useState(1000);
  const [coordinateError, setCoordinateError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync searchMode changes to ref and sessionStorage
  const updateSearchMode = (mode: SearchMode) => {
    searchModeRef.current = mode;
    sessionStorage.setItem('evChargingDiscoverForm_searchMode', mode);
    setSearchMode(mode);
  };

  // Validate coordinates input (comma-separated lat,long)
  const validateCoordinates = (value: string): boolean => {
    if (!value.trim()) {
      setCoordinateError(null);
      return true; // Empty is valid (optional field)
    }
    
    // Remove spaces and split by comma
    const parts = value.replace(/\s/g, '').split(',');
    
    if (parts.length !== 2) {
      setCoordinateError('Please enter coordinates as: latitude,longitude (e.g., 13.0820,80.2750)');
      return false;
    }
    
    const [lat, lon] = parts;
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    
    if (isNaN(latNum) || isNaN(lonNum)) {
      setCoordinateError('Both values must be valid numbers');
      return false;
    }
    
    // Validate latitude range (-90 to 90)
    if (latNum < -90 || latNum > 90) {
      setCoordinateError('Latitude must be between -90 and 90');
      return false;
    }
    
    // Validate longitude range (-180 to 180)
    if (lonNum < -180 || lonNum > 180) {
      setCoordinateError('Longitude must be between -180 and 180');
      return false;
    }
    
    setCoordinateError(null);
    return true;
  };

  const handleCoordinatesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow numbers, commas, spaces, and minus signs
    const validPattern = /^[\d\s,.-]*$/;
    if (!validPattern.test(value)) {
      return; // Don't update if invalid characters
    }
    
    // Mark coordinates as manually modified
    coordinatesModifiedRef.current = true;
    setCoordinates(value);
    // Persist to sessionStorage
    sessionStorage.setItem('evChargingDiscoverForm_coordinates', value);
    validateCoordinates(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs based on mode
    if (searchMode === 'text') {
      // Ensure text search is not empty (only if using API)
      if (!useLocalCatalog && !textSearch.trim()) {
        setTextSearch('CCS2 fast charging station');
        onDiscover(null, 'Search text cannot be empty');
        return;
      }
    } else {
      // Filters mode: validate coordinates if provided
      if (coordinates.trim() && !validateCoordinates(coordinates)) {
        onDiscover(null, coordinateError || 'Invalid coordinates');
        return;
      }
      
      // At least one of expression or coordinates should be provided
      if (!expression.trim() && !coordinates.trim()) {
        onDiscover(null, 'Please provide either an expression or coordinates (or both)');
        return;
      }
    }

    setIsLoading(true);
    onLoading?.(true); // Notify parent that we're loading

    // If using local catalog, skip API call
    if (useLocalCatalog) {
      setIsLoading(false);
      onLoading?.(false);
      onDiscover(null, null); // Signal to use local catalog
      return;
    }

    // Build message based on search mode
    const message: DiscoverRequest['message'] = {};
    
    if (searchMode === 'text') {
      message.text_search = textSearch.trim();
    } else {
      // Filters mode
      if (expression.trim()) {
        message.filters = {
          type: 'jsonpath',
          expression: expression.trim()
        };
      }
      
      if (coordinates.trim()) {
        const coords = coordinates.replace(/\s/g, '').split(',').map(Number);
        message.spatial = [
          {
            op: 's_dwithin',
            targets: "$['beckn:availableAt'][*]['geo']",
            geometry: {
              type: 'Point',
              coordinates: [coords[1], coords[0]] // Note: API expects [longitude, latitude]
            },
            distanceMeters: radius
          }
        ];
      }
    }

    // Make API call
    const request: DiscoverRequest = {
      context: {
        version: '2.0.0',
        action: 'discover',
        domain: 'beckn.one:deg:ev-charging:*',
        bap_id: 'sandbox-ev-charging-np1.com',
        bap_uri: 'https://sandbox-ev-charging-np1.com/bap',
        transaction_id: generateUUID(),
        message_id: generateUUID(),
        timestamp: new Date().toISOString(),
        ttl: 'PT30S',
        schema_context: [
          'https://raw.githubusercontent.com/beckn/protocol-specifications-new/refs/heads/draft/schema/EvChargingService/v1/context.jsonld#ChargingService'
        ]
      },
      message
    };

    try {
      console.log('Making API request to:', DISCOVER_API_URL);
      console.log('Request payload:', JSON.stringify(request, null, 2));
      
      const response = await fetch(DISCOVER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const catalogResponse = (await response.json()) as CatalogResponse;
      console.log('Successfully received catalog response');
      onDiscover(catalogResponse, null);
    } catch (error: any) {
      console.error('Discover API error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to fetch catalog from API';
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessage = 'Network error: Unable to connect to the API. This might be a CORS issue or the API server is unreachable.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      onDiscover(null, errorMessage);
    } finally {
      setIsLoading(false);
      onLoading?.(false);
    }
  };

  const isFormValid = () => {
    if (useLocalCatalog) return true;
    
    // Enable button if ANY input has a value
    if (searchMode === 'text') {
      return textSearch.trim().length > 0;
    } else {
      // In filters mode, enable if expression OR coordinates has value (and no coordinate errors)
      if (coordinateError) return false;
      return expression.trim().length > 0 || coordinates.trim().length > 0;
    }
  };

  const formatDistance = (meters: number): string => {
    if (meters <= 1000) {
      return `${meters.toLocaleString()} meters`;
    }
    const km = meters / 1000;
    // Show 1 decimal place if not a whole number, otherwise show as integer
    return km % 1 === 0 ? `${km} km` : `${km.toFixed(1)} km`;
  };

  return (
    <form onSubmit={handleSubmit} className="discover-form">
      {/* Toggle Bar */}
      <div className="search-mode-toggle">
        <button
          type="button"
          className={`toggle-option ${searchMode === 'filters' ? 'toggle-active' : ''}`}
          onClick={() => updateSearchMode('filters')}
          disabled={isLoading}
        >
          Filters
        </button>
        <button
          type="button"
          className={`toggle-option ${searchMode === 'text' ? 'toggle-active' : ''}`}
          onClick={() => updateSearchMode('text')}
          disabled={isLoading}
        >
          NL Search
        </button>
      </div>

      {/* Text Search Mode */}
      {searchMode === 'text' && (
        <div className="form-group">
          <label htmlFor="textSearch">Search EV charging stations</label>
          <input
            id="textSearch"
            type="text"
            value={textSearch}
            onChange={(e) => {
              const value = e.target.value;
              setTextSearch(value);
              // Persist to sessionStorage
              sessionStorage.setItem('evChargingDiscoverForm_textSearch', value);
            }}
            placeholder="e.g., CCS2 fast charging station"
            required={!useLocalCatalog}
            disabled={isLoading || useLocalCatalog}
          />
        </div>
      )}

      {/* Filters Mode */}
      {searchMode === 'filters' && (
        <>
          <div className="form-group">
            <label htmlFor="expression">JSONPath Expression (optional)</label>
            <textarea
              id="expression"
              value={expression}
              onChange={(e) => {
                const value = e.target.value;
                // Mark expression as manually modified
                expressionModifiedRef.current = true;
                setExpression(value);
                // Persist to sessionStorage
                sessionStorage.setItem('evChargingDiscoverForm_expression', value);
              }}
              placeholder="$[?(@.beckn:itemAttributes.connectorType=='CCS2' && @.beckn:itemAttributes.amenityFeature[*] == 'RESTROOM')]"
              rows={6}
              disabled={isLoading || useLocalCatalog}
              style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
            />
            <small style={{ color: '#64748b', fontSize: '0.8rem' }}>
              JSONPath expression for filtering EV charging stations
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="coordinates">Coordinates (optional)</label>
            <input
              id="coordinates"
              type="text"
              value={coordinates}
              onChange={handleCoordinatesChange}
              placeholder="latitude,longitude (e.g., 13.0820,80.2750)"
              disabled={isLoading || useLocalCatalog}
            />
            {coordinateError && (
              <small style={{ color: '#dc2626', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' }}>
                {coordinateError}
              </small>
            )}
            <small style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' }}>
              Enter as: latitude,longitude
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="radius">
              Distance within: {formatDistance(radius)}
            </label>
            <input
              id="radius"
              type="range"
              min="100"
              max="50000"
              step="100"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              disabled={isLoading || useLocalCatalog}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              <span>100m</span>
              <span>25km</span>
              <span>50km</span>
            </div>
          </div>
        </>
      )}
      
      <button 
        type="submit" 
        disabled={isLoading || (!useLocalCatalog && !isFormValid())}
      >
        {isLoading ? 'Discovering...' : 'Discover'}
      </button>
    </form>
  );
}
