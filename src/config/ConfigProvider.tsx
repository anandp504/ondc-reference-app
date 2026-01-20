
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppConfig, ClientConfig } from './types';
import { validateConfig } from './validator';
import { CircularProgress, Box, Typography, Alert, AlertTitle } from '@mui/material';

interface ConfigContextType {
    config: ClientConfig | null;
    isLoading: boolean;
    error: string | null;
}

const ConfigContext = createContext<ConfigContextType>({
    config: null,
    isLoading: true,
    error: null,
});

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<ClientConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/config.json');
                if (!response.ok) {
                    throw new Error(`Failed to load config: ${response.statusText}`);
                }
                const jsonData = await response.json();

                // Validate Schema
                const validation = validateConfig(jsonData);
                if (!validation.isValid) {
                    throw new Error(`Invalid Configuration:\n${validation.errors?.join('\n')}`);
                }

                const fullConfig = validation.config as AppConfig;

                // Determine active tenant based on URL
                // Logic: Find first config where pathname starts with config.endpoint
                const path = window.location.pathname;
                let activeConfig = fullConfig.find((c: ClientConfig) => path.startsWith(c.endpoint));

                // If no match (e.g. root path '/'), default to first config
                // NOTE: Proper handling should be a redirect in the Router, 
                // but for Context init we'll grab the first one if root.
                if (!activeConfig) {
                    if (path === '/' || path === '') {
                        activeConfig = fullConfig[0];
                    } else {
                        // If path is something like '/unknown', we won't find a config.
                        // We can either error out or default. 
                        // For strictly multi-tenant, maybe we should default to [0] 
                        // and let the Router handle the 404 or Redirect.
                        activeConfig = fullConfig[0];
                    }
                }

                setConfig(activeConfig || null);
            } catch (err: any) {
                setError(err.message || 'Unknown error loading configuration');
            } finally {
                setIsLoading(false);
            }
        };

        fetchConfig();
    }, []);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                <Alert severity="error">
                    <AlertTitle>Configuration Error</AlertTitle>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {error}
                    </Typography>
                </Alert>
            </Box>
        );
    }

    return (
        <ConfigContext.Provider value={{ config, isLoading, error }}>
            {children}
        </ConfigContext.Provider>
    );
};
