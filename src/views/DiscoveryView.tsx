import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Chip,
    Stack,
    Button,
    Card,
    CardContent,
    CardMedia,
    Rating,
    CircularProgress,
    Grid,
    Paper,
    Slider,
    alpha,
    InputBase
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PublicIcon from '@mui/icons-material/Public';
import CodeIcon from '@mui/icons-material/Code';
import { useConfig } from '../config/ConfigProvider';
import type { DiscoveryViewConfig } from '../config/types';

const DiscoveryView: React.FC = () => {
    const { config } = useConfig();
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [radius, setRadius] = useState<number>(1000);
    const [searchMode, setSearchMode] = useState(0); // 0: AI Text, 1: Discovery (Location/JSONPath)

    if (!config) return null;

    const viewConfig = Object.values(config.views).find((v: any) => v.type === 'search') as DiscoveryViewConfig | undefined;

    if (!viewConfig) {
        return <Box p={4}>Discovery View not configured.</Box>;
    }

    const { search, filters: filterDefinitions } = viewConfig;

    const handleSearch = () => {
        setIsLoading(true);
        // Simulate different API calls based on mode
        console.log(searchMode === 0 ? 'Calling AI Text Search API...' : 'Calling Discovery API...');

        setTimeout(() => {
            setIsLoading(false);
            setResults([
                {
                    id: 1,
                    name: 'Premium Organic Basmati Rice',
                    price: '₹285',
                    rating: 4.5,
                    image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Rice',
                    category: 'Grocery',
                    description: 'Aged for perfection, this premium basmati rice offers delightful aroma and fluffy texture.'
                },
                {
                    id: 2,
                    name: 'Fresh Farm Tomatoes',
                    price: '₹42/kg',
                    rating: 4.2,
                    image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Tomatoes',
                    category: 'Vegetables',
                    description: 'Locally sourced, vine-ripened tomatoes perfect for curries and salads.'
                },
                {
                    id: 3,
                    name: 'Cold Pressed Sunflower Oil',
                    price: '₹195',
                    rating: 4.8,
                    image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Oil',
                    category: 'Grocery',
                    description: 'Pure, organic cold-pressed oil for healthy cooking.'
                }
            ]);
        }, 1500);
    };

    // Derived filtering for JSONPath/Category based on config
    const categoryFilter = filterDefinitions?.find(f => f.id === 'category');
    const jsonpathFilter = filterDefinitions?.find(f => f.id === 'jsonpath');

    // Validation for Discovery Mode
    const isDiscoveryValid = () => {
        // Example check: Need Location OR JSONPath
        // In a real app, check specific state values. 
        // For now, assuming default 'Location' location is valid if untouched, 
        // so we just return true or check if fields are cleared. 
        // Users mentioned "Location or JSONPath is mandatory".
        // Let's assume empty string checks if we were tracking them controlled fully.
        // For UI demo, default is valid.
        return true;
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: config.theme.backgroundColor }}>
            {/* Hero Section */}
            <Box
                sx={{
                    pt: 8,
                    pb: 6,
                    px: 3,
                    background: `linear-gradient(180deg, ${alpha(config.theme.primaryColor, 0.05)} 0%, ${config.theme.backgroundColor} 100%)`
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography
                            variant="h3"
                            component="h1"
                            fontWeight={800}
                            sx={{
                                fontFamily: config.theme.fontFamily,
                                letterSpacing: '-0.02em',
                                background: `linear-gradient(135deg, #1e293b 0%, ${config.theme.primaryColor} 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2
                            }}
                        >
                            {searchMode === 0 && <AutoAwesomeIcon sx={{ fontSize: 40, color: config.theme.primaryColor }} />}
                            {searchMode === 0 ? "AI Product Search" : "Network Discovery"}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontFamily: config.theme.fontFamily, maxWidth: 600, mx: 'auto' }}>
                            {searchMode === 0
                                ? "Experience the power of AI. Simply describe what you're looking for, and we'll find the best matches across the network."
                                : "Explore the ONDC network using advanced location filters and JSONPath expressions for developers and power users."
                            }
                        </Typography>
                    </Box>

                    {/* Custom Segmented Tabs */}
                    <Paper
                        elevation={0}
                        sx={{
                            display: 'inline-flex',
                            p: '3px',
                            mb: 5,
                            borderRadius: '40px',
                            bgcolor: '#ffffff',
                            mx: 'auto',
                            position: 'relative',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                        }}
                    >
                        {[
                            { label: 'AI Search', value: 0 },
                            { label: 'Network Discovery', value: 1 }
                        ].map((tab) => (
                            <Button
                                key={tab.value}
                                onClick={() => setSearchMode(tab.value)}
                                startIcon={tab.value === 0 ? <AutoAwesomeIcon sx={{ fontSize: 16 }} /> : <LocationOnIcon sx={{ fontSize: 16 }} />}
                                size="small"
                                sx={{
                                    borderRadius: '30px',
                                    px: 2.5,
                                    py: 0.6,
                                    minHeight: 32,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    fontFamily: config.theme.fontFamily,
                                    color: searchMode === tab.value ? '#fff' : 'text.secondary',
                                    background: searchMode === tab.value ? config.theme.primaryColor : 'transparent',
                                    boxShadow: searchMode === tab.value ? `0 2px 8px ${alpha(config.theme.primaryColor, 0.3)}` : 'none',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        color: searchMode === tab.value ? '#fff' : config.theme.primaryColor,
                                        background: searchMode === tab.value ? config.theme.primaryColor : alpha(config.theme.primaryColor, 0.05)
                                    }
                                }}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </Paper>

                    {/* MODE A: AI TEXT SEARCH */}
                    {searchMode === 0 && (
                        <Box sx={{ maxWidth: 860, mx: 'auto', position: 'relative', zIndex: 10 }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderRadius: '50px',
                                    bgcolor: '#ffffff',
                                    border: '1px solid',
                                    borderColor: 'rgba(0,0,0,0.08)',
                                    boxShadow: `0 16px 40px ${alpha(config.theme.primaryColor, 0.12)}`,
                                    transition: 'all 0.3s ease',
                                    '&:hover, &:focus-within': {
                                        boxShadow: `0 20px 48px ${alpha(config.theme.primaryColor, 0.18)}`,
                                        transform: 'scale(1.01)'
                                    }
                                }}
                            >
                                <Box sx={{ pl: 2.5, pr: 1, display: 'flex', color: config.theme.primaryColor }}>
                                    <AutoAwesomeIcon sx={{ fontSize: 22 }} />
                                </Box>
                                <InputBase
                                    fullWidth
                                    autoFocus
                                    placeholder="Describe what you want (e.g. 'Organic spices from Kerala')..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    sx={{
                                        pl: 0.5,
                                        fontFamily: config.theme.fontFamily,
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        color: '#334155'
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleSearch}
                                    sx={{
                                        minWidth: '46px',
                                        height: '46px',
                                        borderRadius: '50%',
                                        p: 0,
                                        ml: 1,
                                        color: '#ffffff', // Force white icon
                                        background: `linear-gradient(135deg, ${config.theme.primaryColor} 0%, ${alpha(config.theme.primaryColor, 0.9)} 100%)`,
                                        boxShadow: `0 8px 20px ${alpha(config.theme.primaryColor, 0.3)}`,
                                        '&:hover': {
                                            background: config.theme.primaryColor,
                                            transform: 'scale(1.05)'
                                        }
                                    }}
                                >
                                    {isLoading ? <CircularProgress size={22} color="inherit" /> : <SearchIcon sx={{ fontSize: 24 }} />}
                                </Button>
                            </Paper>
                        </Box>
                    )}

                    {/* MODE B: DISCOVERY (Location / JSONPath) */}
                    {searchMode === 1 && (
                        <Box sx={{ maxWidth: 780, mx: 'auto' }}>
                            {/* Unified Search Console */}
                            <Paper
                                elevation={0}
                                sx={{
                                    bgcolor: '#ffffff',
                                    borderRadius: 6,
                                    boxShadow: '0 16px 48px rgba(0,0,0,0.08)',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Row 1: Location & Radius */}
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                                    {/* Location */}
                                    <Box sx={{ flex: 1, p: 2.5, display: 'flex', alignItems: 'center' }}>
                                        <LocationOnIcon sx={{ color: config.theme.primaryColor, fontSize: 24, mr: 2 }} />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                                                Target Location
                                            </Typography>
                                            <InputBase
                                                fullWidth
                                                placeholder="12.9716, 77.5946"
                                                defaultValue="12.9716, 77.5946"
                                                sx={{
                                                    fontFamily: config.theme.fontFamily,
                                                    fontWeight: 500,
                                                    fontSize: '1rem',
                                                    color: '#1e293b'
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    {/* Vertical Divider for Desktop */}
                                    <Box sx={{ width: '1px', bgcolor: 'divider', display: { xs: 'none', md: 'block' } }} />
                                    {/* Horizontal Divider for Mobile */}
                                    <Box sx={{ height: '1px', bgcolor: 'divider', display: { xs: 'block', md: 'none' } }} />

                                    {/* Radius */}
                                    <Box sx={{ width: { xs: '100%', md: '35%' }, p: 2.5, bgcolor: '#fbfbfb' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Search Radius
                                            </Typography>
                                            <Typography variant="caption" fontWeight={700} sx={{ color: config.theme.primaryColor }}>
                                                {radius}m
                                            </Typography>
                                        </Box>
                                        <Slider
                                            value={radius}
                                            onChange={(_, v) => setRadius(v as number)}
                                            min={100}
                                            max={10000}
                                            step={100}
                                            size="small"
                                            sx={{
                                                color: config.theme.primaryColor,
                                                height: 4,
                                                p: 1,
                                                '& .MuiSlider-thumb': {
                                                    width: 14,
                                                    height: 14,
                                                    transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                                                    '&:before': { boxShadow: 'none' },
                                                    '&:hover, &.Mui-focusVisible': {
                                                        boxShadow: `0 0 0 6px ${alpha(config.theme.primaryColor, 0.1)}`
                                                    }
                                                },
                                                '& .MuiSlider-rail': { opacity: 0.2 }
                                            }}
                                        />
                                    </Box>
                                </Box>

                                <Box sx={{ height: '1px', bgcolor: 'divider' }} />

                                {/* Row 2: Advanced Filter */}
                                {jsonpathFilter && (
                                    <Box sx={{ p: 2.5, bgcolor: alpha(config.theme.primaryColor, 0.01) }}>
                                        <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                                            <CodeIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 2, transform: 'translateY(4px)' }} />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                                                    Advanced Query (JSONPath)
                                                </Typography>
                                                <InputBase
                                                    fullWidth
                                                    multiline
                                                    rows={1} // Compact by default
                                                    placeholder="$.message.catalog.bpp/providers[?(@.id=='P1')]"
                                                    value={filters[jsonpathFilter.id] || ''}
                                                    onChange={(e) => setFilters({ ...filters, [jsonpathFilter.id]: e.target.value })}
                                                    sx={{
                                                        fontFamily: 'Consolas, Monaco, monospace',
                                                        fontSize: '0.9rem',
                                                        color: '#334155'
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                )}
                            </Paper>

                            {/* Category Chips - Outside */}
                            {categoryFilter && (
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" useFlexGap sx={{ maxWidth: 600 }}>
                                        {categoryFilter.options.map(opt => (
                                            <Chip
                                                key={opt.value}
                                                label={opt.label}
                                                clickable
                                                onClick={() => setFilters({
                                                    ...filters,
                                                    [categoryFilter.id]: filters[categoryFilter.id] === opt.value ? '' : opt.value
                                                })}
                                                sx={{
                                                    bgcolor: filters[categoryFilter.id] === opt.value ? config.theme.primaryColor : '#fff',
                                                    color: filters[categoryFilter.id] === opt.value ? '#fff' : 'text.secondary',
                                                    fontFamily: config.theme.fontFamily,
                                                    fontWeight: filters[categoryFilter.id] === opt.value ? 600 : 500,
                                                    boxShadow: filters[categoryFilter.id] === opt.value
                                                        ? `0 4px 12px ${alpha(config.theme.primaryColor, 0.4)}`
                                                        : '0 2px 8px rgba(0,0,0,0.05)',
                                                    '&:hover': {
                                                        bgcolor: filters[categoryFilter.id] === opt.value ? config.theme.primaryColor : alpha(config.theme.primaryColor, 0.05),
                                                        transform: 'translateY(-1px)'
                                                    }
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                </Box>
                            )}


                            {/* Action Button */}
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleSearch}
                                        startIcon={!isLoading && <PublicIcon sx={{ fontSize: 20 }} />}
                                        sx={{
                                            borderRadius: '30px',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            fontSize: '0.95rem',
                                            px: 6,
                                            py: 1.2,
                                            color: '#ffffff', // Force white text
                                            letterSpacing: '0.02em',
                                            background: `linear-gradient(135deg, ${config.theme.primaryColor} 0%, ${alpha(config.theme.primaryColor, 0.85)} 100%)`,
                                            boxShadow: `0 8px 20px -6px ${alpha(config.theme.primaryColor, 0.4)}`,
                                            '&:hover': {
                                                background: config.theme.primaryColor,
                                                boxShadow: `0 12px 24px -6px ${alpha(config.theme.primaryColor, 0.5)}`,
                                                transform: 'translateY(-1px)'
                                            },
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Start Network Discovery'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Box>
                    )}
                </Container>
            </Box>
            <Container maxWidth="xl" sx={{ py: 4 }}>

                {/* Results */}
                <Box>
                    {results.length > 0 && (
                        <Box sx={{ mb: 3, ml: 1 }}>
                            <Typography
                                variant="caption"
                                sx={{
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    color: 'text.secondary',
                                    fontWeight: 700,
                                    fontFamily: config.theme.fontFamily
                                }}
                            >
                                Found {results.length} Matches
                            </Typography>
                        </Box>
                    )}

                    {results.length === 0 && !isLoading ? (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 8,
                                textAlign: 'center',
                                bgcolor: 'rgba(255,255,255,0.6)',
                                border: '2px dashed',
                                borderColor: 'divider',
                                borderRadius: 4
                            }}
                        >
                            <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                            <Typography variant="h6" gutterBottom sx={{ fontFamily: config.theme.fontFamily, color: 'text.secondary' }}>
                                Start by searching for items
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: config.theme.fontFamily }}>
                                Use typical keywords like "Grocery" or "Coffee"
                            </Typography>
                        </Paper>
                    ) : (
                        <Grid container spacing={4} alignItems="stretch">
                            {results.map(item => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id} sx={{ display: 'flex' }}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 4,
                                            overflow: 'visible', // For floating elements
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            bgcolor: '#fff',
                                            position: 'relative',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                                                '& .card-image': {
                                                    transform: 'scale(1.1)'
                                                }
                                            }
                                        }}
                                    >
                                        <Box sx={{ position: 'relative', pt: '75%', overflow: 'hidden', borderRadius: '16px 16px 0 0', bgcolor: alpha(config.theme.primaryColor, 0.1) }}>
                                            <CardMedia
                                                image={item.image}
                                                className="card-image"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    transition: 'transform 0.5s ease'
                                                }}
                                            />
                                            {/* Floating Badges */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    left: 12,
                                                    display: 'flex',
                                                    gap: 1
                                                }}
                                            >
                                                <Chip
                                                    label={item.category}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                                                        backdropFilter: 'blur(4px)',
                                                        color: config.theme.primaryColor,
                                                        fontWeight: 700,
                                                        fontSize: '0.7rem',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                            </Box>
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 12,
                                                    right: 12,
                                                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                                                    backdropFilter: 'blur(4px)',
                                                    color: '#fff',
                                                    borderRadius: 20,
                                                    px: 1,
                                                    py: 0.5,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5
                                                }}
                                            >
                                                <Rating value={1} max={1} size="small" readOnly sx={{ color: '#FFD700', fontSize: '1rem' }} />
                                                <Typography variant="caption" fontWeight={700}>
                                                    {item.rating}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                                            <Typography
                                                variant="h6"
                                                fontWeight={700}
                                                sx={{
                                                    mb: 1,
                                                    fontFamily: config.theme.fontFamily,
                                                    lineHeight: 1.3,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    minHeight: '2.6em' // Guarantee height for 2 lines
                                                }}
                                            >
                                                {item.name}
                                            </Typography>

                                            <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box>
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        Price
                                                    </Typography>
                                                    <Typography
                                                        variant="h5"
                                                        fontWeight={800}
                                                        sx={{
                                                            color: config.theme.primaryColor,
                                                            fontFamily: config.theme.fontFamily,
                                                            letterSpacing: '-0.5px'
                                                        }}
                                                    >
                                                        {item.price}
                                                    </Typography>
                                                </Box>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        borderRadius: 20,
                                                        borderColor: alpha(config.theme.primaryColor, 0.3),
                                                        color: config.theme.primaryColor,
                                                        minWidth: 'auto',
                                                        px: 2,
                                                        '&:hover': {
                                                            borderColor: config.theme.primaryColor,
                                                            bgcolor: alpha(config.theme.primaryColor, 0.05)
                                                        }
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Container>
        </Box>
    );
};

export default DiscoveryView;
