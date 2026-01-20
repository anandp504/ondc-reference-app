
import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, useTheme, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useConfig } from '../config/ConfigProvider';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { config } = useConfig();
    const theme = useTheme();

    if (!config) return null;

    const { header } = config.layout;

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: theme.zIndex.drawer + 1,
                bgcolor: header.background,
                color: header.color
            }}
            elevation={0}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {header.logo && (
                        <Avatar
                            src={header.logo}
                            alt="Logo"
                            variant="square"
                            sx={{ width: 40, height: 40, bgcolor: 'transparent' }}
                        />
                    )}
                    <Box>
                        <Typography variant="h6" noWrap component="div" sx={{ lineHeight: 1.2 }}>
                            {header.title}
                        </Typography>
                        {header.subtitle && (
                            <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                                {header.subtitle}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
