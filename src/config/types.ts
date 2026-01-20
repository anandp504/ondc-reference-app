
export type AppConfig = ClientConfig[];

export interface ClientConfig {
    endpoint: string; // e.g. "/retail", "/evcharging"
    app: {
        title: string;
        logo: string;
        favicon: string;
    };
    theme: {
        mode: 'light' | 'dark';
        fontFamily: string;
        primaryColor: string;
        backgroundColor: string;
    };
    layout: {
        header: {
            title: string;
            subtitle: string;
            logo: string;
            background: string;
            color: string;
        };
        sidebar: {
            background: string;
            color: string;
            activeColor: string;
            sectionTitle?: string;
            items: SidebarItem[];
        };
    };
    network: {
        domain: string;
    };
    schemas: Record<string, SchemaDefinition>;
    views: {
        [key: string]: ViewConfig;
    };
    security?: {
        validateSignatures: boolean;
    };
    apiBaseUrl?: string; // Optional override for API target
}

export interface SidebarItem {
    id: string;
    title: string;
    description?: string;
    icon: string;
    routes?: string[];
    children?: SidebarItem[];
}

export interface SchemaDefinition {
    label: string;
    contextUrl: string;
    rendererUrl: string;
}

export type ViewConfig = DiscoveryViewConfig | CatalogPublishViewConfig;

export interface BaseViewConfig {
    type: string;
    title: string;
    subtitle?: string;
    api: string;
    context?: Record<string, any>;
}

export interface DiscoveryViewConfig extends BaseViewConfig {
    type: 'search';
    ui: {
        layout: 'grid' | 'list';
        background: string;
    };
    search: {
        placeholder: string;
        radius: number;
    };
    filters: FilterConfig[];
}

export interface FilterConfig {
    id: string;
    label: string;
    type: 'select' | 'text';
    uiType?: 'dropdown' | 'chips' | 'radio' | 'buttons';
    options: FilterOption[];
}

export interface FilterOption {
    label: string;
    value: string;
    schema: string;
    defaultSearch?: {
        text?: string;
        location?: string;
    };
}

export interface CatalogPublishViewConfig extends BaseViewConfig {
    type: 'form';
}
