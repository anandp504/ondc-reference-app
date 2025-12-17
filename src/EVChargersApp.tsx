import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import EVChargingDiscoverForm from './components/EVChargingDiscoverForm';
import CatalogView from './components/CatalogView';
import LoadingSpinner from './components/LoadingSpinner';
import type { CatalogResponse, RendererConfig } from './types';

// Import local renderer and catalog files for local testing
import evChargerRendererLocal from './data/ev-charger-renderer.json';
import evChargerCatalogLocal from './data/ev-charging-catalog-15-items.json';

// GitHub URL for remote renderer fetching
const EV_CHARGING_RENDERER_URL =
  'https://raw.githubusercontent.com/beckn/protocol-specifications-new/refs/heads/ondc-schema/schema/EvChargingService/v1/renderer.json';

// Toggle between local and GitHub sources
const USE_LOCAL_DATA = import.meta.env.VITE_USE_LOCAL_DATA === 'true';

type AppSection = 'bap';

function EVChargersApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentCatalog, setCurrentCatalog] = useState<CatalogResponse | null>(null);
  const [currentRenderer, setCurrentRenderer] = useState<RendererConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useLocalCatalog, setUseLocalCatalog] = useState(USE_LOCAL_DATA);
  const [useLocalRenderer, setUseLocalRenderer] = useState(USE_LOCAL_DATA);

  // Derive activeSection from current route
  const getActiveSection = (): AppSection => {
    return 'bap'; // default
  };

  const activeSection = getActiveSection();

  const setActiveSection = (section: AppSection) => {
    // For EV Chargers app, we only have BAP section
    // Navigate to the base path
    navigate('/ev-chargers/');
  };

  // Helper to load only the renderer
  const loadRenderer = useCallback(async (throwOnError: boolean = false) => {
    try {
      if (useLocalRenderer) {
        // Use local renderer file
        const rendererJson = evChargerRendererLocal as unknown as RendererConfig;
        setCurrentRenderer(rendererJson);
      } else {
        // Fetch renderer from GitHub URL
        const rendererRes = await fetch(EV_CHARGING_RENDERER_URL);
        
        if (!rendererRes.ok) {
          throw new Error('Failed to load renderer from remote specification URL');
        }

        const rendererJson = (await rendererRes.json()) as RendererConfig;
        setCurrentRenderer(rendererJson);
      }
    } catch (e: any) {
      console.error('Error loading renderer:', e);
      setError(e?.message || 'Unexpected error while loading renderer');
      setCurrentRenderer(null);
      if (throwOnError) {
        throw e;
      }
    }
  }, [useLocalRenderer]);

  // Load renderer on component mount and when useLocalRenderer changes
  useEffect(() => {
    loadRenderer(false); // Don't throw errors when called from useEffect
  }, [loadRenderer]);

  const handleDiscover = async (catalogResponse: CatalogResponse | null, error: string | null) => {
    setError(null);

    try {
      if (useLocalCatalog) {
        // Use local catalog data
        const localCatalog = evChargerCatalogLocal as unknown as CatalogResponse;
        setCurrentCatalog(localCatalog);
        // Load the renderer
        await loadRenderer(true);
      } else {
        // Use API response
        if (error) {
          setError(error);
          setCurrentCatalog(null);
          setCurrentRenderer(null);
          return;
        }

        if (catalogResponse) {
          setCurrentCatalog(catalogResponse);
          // Renderer should already be loaded from useEffect, but reload if needed
          if (!currentRenderer) {
            await loadRenderer(true); // Throw errors when called from handleDiscover
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Unexpected error');
      setCurrentCatalog(null);
      setCurrentRenderer(null);
    }
  };

  // BAP App Component for EV Chargers
  const BAPApp = () => (
    <main className="app-main two-column-layout">
      <section className="discover-pane">
        <div className="discover-card">
          <h2 className="pane-title">Discover EV Charging Stations</h2>
          <p className="pane-subtitle">
            Run sample Beckn <code>discover</code> requests for EV Charging Stations and inspect the rendered catalog.
          </p>
          <EVChargingDiscoverForm
            onDiscover={handleDiscover}
            onLoading={setIsLoading}
            useLocalCatalog={useLocalCatalog}
          />
        </div>
      </section>

      <section className="results-pane">
        <div className="results-card">
          <div className="results-header">
            <h2 className="pane-title">Search Results</h2>
            {!currentCatalog && !isLoading && !error && (
              <p className="results-empty">Run a discover to see matching EV charging stations.</p>
            )}
            {error && <p className="results-empty" style={{ color: '#b91c1c' }}>{error}</p>}
          </div>

          {isLoading && (
            <LoadingSpinner message={useLocalCatalog ? 'Loading local catalog...' : 'Discovering EV charging stations...'} />
          )}

          {!isLoading && currentCatalog && currentRenderer && (
            <div className="results-content">
              {currentCatalog.message.catalogs.map((catalog) => (
                <CatalogView
                  key={catalog['beckn:id']}
                  catalog={catalog}
                  rendererConfig={currentRenderer}
                  viewType="discoveryCard"
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );

  return (
    <div className={`app ${isSidebarCollapsed ? 'has-collapsed-sidebar' : ''}`}>
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        onCollapseChange={setIsSidebarCollapsed}
        visibleSections={['bap']}
      />
      <header className="app-header">
        <div className="app-header-inner">
          <div>
            <h1>EV Chargers Reference App</h1>
            <p>E-commerce frontend using Beckn Protocol</p>
          </div>
          <div className="app-header-badge">
            <span>EV Charging</span>
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<BAPApp />} />
        <Route path="*" element={<Navigate to="/ev-chargers/" replace />} />
      </Routes>
    </div>
  );
}

export default EVChargersApp;
