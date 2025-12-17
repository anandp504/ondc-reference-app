import { useState } from 'react';
import './Sidebar.css';

type AppSection = 'bap' | 'bpp' | 'admin' | 'bpp-admin';

interface SidebarProps {
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
  visibleSections?: AppSection[]; // Optional prop to filter visible sections
}

export default function Sidebar({ activeSection, onSectionChange, onCollapseChange, visibleSections }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapseChange?.(newState);
  };

  const allSections = [
    { id: 'bap' as AppSection, label: 'BAP', description: 'Consumer App', icon: '🛒' },
    { id: 'bpp' as AppSection, label: 'BPP', description: 'Seller App', icon: '🏬' },
    { id: 'admin' as AppSection, label: 'Admin', description: 'ONDC Admin', icon: '⚙️' },
    { id: 'bpp-admin' as AppSection, label: 'BPP Admin', description: 'BPP Configuration', icon: '🔧' },
  ];

  // Filter sections based on visibleSections prop, or show all if not provided
  const sections = visibleSections 
    ? allSections.filter(section => visibleSections.includes(section.id))
    : allSections;

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <button
        className="sidebar-toggle"
        onClick={handleToggle}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? '→' : '←'}
      </button>
      
      {!isCollapsed && (
        <nav className="sidebar-nav">
          <div className="sidebar-header">
            <h3>Navigation</h3>
          </div>
          <ul className="sidebar-menu">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  className={`sidebar-item ${activeSection === section.id ? 'sidebar-item-active' : ''}`}
                  onClick={() => onSectionChange(section.id)}
                  title={section.description}
                >
                  <span className="sidebar-icon">{section.icon}</span>
                  <div className="sidebar-label-group">
                    <span className="sidebar-label">{section.label}</span>
                    {section.description && (
                      <span className="sidebar-description">{section.description}</span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </aside>
  );
}

