
import React, { useState, useRef } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Stack,
    LinearProgress,
    Fade,
    IconButton,
    useTheme,
    alpha
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StorefrontIcon from '@mui/icons-material/Storefront'; // Added for Hero consistency
import { useConfig } from '../config/ConfigProvider';
import type { CatalogPublishViewConfig } from '../config/types';

const CatalogPublishView: React.FC = () => {
    const { config } = useConfig();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // This component relies entirely on the config context
    if (!config) return null;

    const viewConfig = Object.values(config.views).find((v: any) => v.type === 'form') as CatalogPublishViewConfig | undefined;

    if (!viewConfig) {
        return (
            <Box p={4} textAlign="center">
                <Typography color="error">Catalog Publish View not configured.</Typography>
            </Box>
        );
    }

    const primaryColor = config.theme.primaryColor;
    const fontFamily = config.theme.fontFamily;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
            setSuccess(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            // Simple validation for json/csv if needed, currently accepting all matching input accept
            if (droppedFile.name.endsWith('.json') || droppedFile.name.endsWith('.csv')) {
                setFile(droppedFile);
                setSuccess(false);
            }
        }
    };

    const handleUpload = () => {
        if (!file) return;

        setUploading(true);
        // Simulate upload
        setTimeout(() => {
            setUploading(false);
            setSuccess(true);
            setFile(null);
            if (inputRef.current) inputRef.current.value = '';
        }, 2000);
    };

    const clearFile = () => {
        setFile(null);
        setSuccess(false);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <Box
            sx={{
                bgcolor: config.theme.backgroundColor,
                minHeight: '100vh',
                py: 6,
                fontFamily: fontFamily
            }}
        >
            <Container maxWidth="md">
                <Box mb={6} textAlign="center">
                    <Typography
                        variant="h3"
                        component="h1"
                        fontWeight={800}
                        sx={{
                            fontFamily: fontFamily,
                            letterSpacing: '-0.02em',
                            background: `linear-gradient(135deg, #1e293b 0%, ${primaryColor} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2
                        }}
                    >
                        <StorefrontIcon sx={{ fontSize: 40, color: primaryColor }} />
                        {viewConfig.title}
                    </Typography>
                    {viewConfig.subtitle && (
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ fontFamily: fontFamily, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
                        >
                            {viewConfig.subtitle}
                        </Typography>
                    )}
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, md: 6 },
                        bgcolor: '#ffffff',
                        borderRadius: 6,
                        boxShadow: '0 16px 48px rgba(0,0,0,0.06)'
                    }}
                >
                    <Stack spacing={4}>
                        {!file && !success && (
                            <Box
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => inputRef.current?.click()}
                                sx={{
                                    border: '2px dashed',
                                    borderColor: dragActive ? primaryColor : alpha(primaryColor, 0.2),
                                    borderRadius: 4,
                                    py: 8,
                                    px: 4,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: dragActive ? alpha(primaryColor, 0.04) : '#fafafa',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&:hover': {
                                        borderColor: primaryColor,
                                        backgroundColor: alpha(primaryColor, 0.02),
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 12px 24px rgba(0,0,0,0.04)'
                                    }
                                }}
                            >
                                <input
                                    ref={inputRef}
                                    accept=".json,.csv"
                                    style={{ display: 'none' }}
                                    id="upload-file-input"
                                    type="file"
                                    onChange={handleFileChange}
                                />
                                <Stack spacing={3} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: `linear-gradient(135deg, ${alpha(primaryColor, 0.1)} 0%, ${alpha(primaryColor, 0.2)} 100%)`,
                                            color: primaryColor,
                                            mb: 1
                                        }}
                                    >
                                        <CloudUploadIcon sx={{ fontSize: 40 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontFamily: fontFamily, fontWeight: 700, mb: 1, color: '#334155' }}>
                                            Drag & Drop your catalog
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: fontFamily, mb: 2 }}>
                                            or file browser will open automatically
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                borderRadius: 20,
                                                textTransform: 'none',
                                                borderColor: alpha(primaryColor, 0.5),
                                                color: primaryColor,
                                                fontWeight: 600,
                                                px: 3,
                                                '&:hover': {
                                                    borderColor: primaryColor,
                                                    bgcolor: alpha(primaryColor, 0.05)
                                                }
                                            }}
                                        >
                                            Browse Files
                                        </Button>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: fontFamily, pt: 2, display: 'block' }}>
                                        Supports JSON and CSV formats
                                    </Typography>
                                </Stack>
                            </Box>
                        )}

                        {file && (
                            <Fade in>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        bgcolor: alpha(primaryColor, 0.05),
                                        border: '1px solid',
                                        borderColor: alpha(primaryColor, 0.2),
                                        borderRadius: 2
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <InsertDriveFileIcon sx={{ color: primaryColor, fontSize: 32 }} />
                                        <Box flexGrow={1}>
                                            <Typography variant="subtitle1" fontWeight={600} sx={{ fontFamily: fontFamily }}>
                                                {file.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: fontFamily }}>
                                                {(file.size / 1024).toFixed(2)} KB
                                            </Typography>
                                        </Box>
                                        {!uploading && (
                                            <IconButton onClick={clearFile} size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                                                <CloseIcon />
                                            </IconButton>
                                        )}
                                    </Stack>
                                    {uploading && (
                                        <Box mt={2}>
                                            <LinearProgress
                                                variant="indeterminate"
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    bgcolor: alpha(primaryColor, 0.1),
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: primaryColor
                                                    }
                                                }}
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center', fontFamily: fontFamily }}>
                                                Uploading catalog data...
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Fade>
                        )}

                        {success && (
                            <Fade in>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        borderRadius: 4,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        bgcolor: '#f0fdf4', // green-50
                                        border: '1px solid #bbf7d0' // green-200
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: '50%',
                                            bgcolor: '#dcfce7', // green-100
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#16a34a',
                                            mb: 2
                                        }}
                                    >
                                        <CheckCircleIcon sx={{ fontSize: 32 }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700} sx={{ fontFamily: fontFamily, color: '#166534', mb: 1 }}>
                                        Published Successfully!
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: fontFamily, color: '#15803d', mb: 3, textAlign: 'center' }}>
                                        Your catalog has been broadcast to the network.
                                    </Typography>
                                    <Button
                                        variant="text"
                                        onClick={() => setSuccess(false)}
                                        sx={{
                                            color: '#16a34a',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            '&:hover': { bgcolor: '#dcfce7' }
                                        }}
                                    >
                                        Upload Another Catalog
                                    </Button>
                                </Paper>
                            </Fade>
                        )}

                        <Box textAlign="center">
                            <Button
                                variant="contained"
                                size="large"
                                disabled={!file || uploading}
                                onClick={handleUpload}
                                sx={{
                                    px: 6,
                                    py: 1.2,
                                    borderRadius: 50,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    fontWeight: 700,
                                    color: '#ffffff', // Force white text
                                    fontFamily: fontFamily,
                                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${alpha(primaryColor, 0.8)} 100%)`,
                                    boxShadow: `0 8px 20px -6px ${alpha(primaryColor, 0.4)}`,
                                    '&:hover': {
                                        background: primaryColor,
                                        boxShadow: `0 12px 24px -6px ${alpha(primaryColor, 0.5)}`,
                                        transform: 'translateY(-1px)'
                                    },
                                    '&:disabled': {
                                        background: 'rgba(0,0,0,0.12)',
                                        boxShadow: 'none'
                                    },
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                {uploading ? 'Publishing...' : 'Publish Catalog'}
                            </Button>
                        </Box>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
};

export default CatalogPublishView;
