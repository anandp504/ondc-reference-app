import { useEffect, useRef, useState } from 'react';
import { Catalog, RendererConfig, Item } from '../types';
import { renderTemplate } from '../utils/templateRenderer';

interface CatalogViewProps {
  catalog: Catalog;
  rendererConfig: RendererConfig | null;
  viewType?: 'discoveryCard' | 'detailView' | 'compactCard';
}

function RenderedItem({ item, catalog, rendererConfig, viewType }: { item: Item; catalog: Catalog; rendererConfig: RendererConfig | null; viewType: string }) {
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rendererConfig || !rendererConfig.templates) {
      setRenderedHtml('');
      return;
    }
    
    const template = rendererConfig.templates[viewType as keyof typeof rendererConfig.templates];
    if (template && template.html) {
      try {
        const html = renderTemplate(template.html, item, catalog);
        setRenderedHtml(html);
      } catch (error) {
        console.error('Error rendering template:', error);
        setRenderedHtml('');
      }
    } else {
      setRenderedHtml('');
    }
  }, [item, catalog, rendererConfig, viewType]);

  useEffect(() => {
    if (!containerRef.current || !renderedHtml || !rendererConfig) {
      return;
    }

    try {
      // Apply styling hints if available - Grocery dietary badges
      const dietaryClassification = item['beckn:itemAttributes']?.dietaryClassification;
      if (dietaryClassification && rendererConfig.stylingHints?.dietaryBadge) {
        const badgeStyle = rendererConfig.stylingHints.dietaryBadge[dietaryClassification];
        if (badgeStyle) {
          const badges = containerRef.current.querySelectorAll('.dietary-badge');
          badges.forEach((badge) => {
            (badge as HTMLElement).style.backgroundColor = badgeStyle.backgroundColor;
            (badge as HTMLElement).style.color = badgeStyle.color;
          });
        }
      }

      // Apply styling hints for EV Charging - Charging Speed badges
      const chargingSpeed = item['beckn:itemAttributes']?.chargingSpeed;
      if (chargingSpeed && rendererConfig.stylingHints?.chargingSpeedBadge) {
        const badgeStyle = rendererConfig.stylingHints.chargingSpeedBadge[chargingSpeed];
        if (badgeStyle) {
          const badges = containerRef.current.querySelectorAll('.charging-speed-badge');
          badges.forEach((badge) => {
            (badge as HTMLElement).style.backgroundColor = badgeStyle.backgroundColor;
            (badge as HTMLElement).style.color = badgeStyle.color;
          });
        }
      }

      // Apply styling hints for EV Charging - Station Status badges
      const stationStatus = item['beckn:itemAttributes']?.stationStatus;
      if (stationStatus && rendererConfig.stylingHints?.stationStatus) {
        const badgeStyle = rendererConfig.stylingHints.stationStatus[stationStatus];
        if (badgeStyle) {
          const statusBadges = containerRef.current.querySelectorAll('.status-badge');
          statusBadges.forEach((badge) => {
            if (badge.classList.contains(`status-${stationStatus}`)) {
              (badge as HTMLElement).style.backgroundColor = badgeStyle.backgroundColor;
              (badge as HTMLElement).style.color = badgeStyle.color;
            }
          });
        }
      }

      // Color stars based on rating
      const ratingContainers = containerRef.current.querySelectorAll('.rating-stars-container');
      ratingContainers.forEach((container) => {
        const ratingAttr = (container as HTMLElement).getAttribute('data-rating');
        if (ratingAttr) {
          const rating = parseFloat(ratingAttr);
          const stars = container.querySelectorAll('.star');
          stars.forEach((star, index) => {
            const starIndex = index + 1;
            if (rating >= starIndex) {
              (star as HTMLElement).style.color = '#fbbf24'; // Full star - bright yellow
            } else if (rating >= starIndex - 0.5) {
              (star as HTMLElement).style.color = '#fcd34d'; // Half star - lighter yellow
            } else {
              (star as HTMLElement).style.color = '#e5e7eb'; // Empty star - gray
            }
          });
        }
      });
    } catch (error) {
      console.error('Error applying styling hints:', error);
    }
  }, [renderedHtml, item, rendererConfig]);

  if (!renderedHtml) {
    return <div>Loading...</div>;
  }

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
      className={`item-card item-card-${viewType}`}
    />
  );
}

export default function CatalogView({ catalog, rendererConfig, viewType = 'discoveryCard' }: CatalogViewProps) {
  const items = catalog['beckn:items'] || [];

  if (!rendererConfig || !rendererConfig.templates) {
    return <div>Renderer configuration not available</div>;
  }

  return (
    <div className="catalog-view">
      <div className="catalog-header">
        <h2>{catalog['beckn:descriptor']?.['schema:name'] || 'Catalog'}</h2>
        <p>{catalog['beckn:descriptor']?.['beckn:shortDesc'] || ''}</p>
      </div>
      
      <div className="items-grid">
        {items.map((item) => (
          <RenderedItem
            key={item['beckn:id']}
            item={item}
            catalog={catalog}
            rendererConfig={rendererConfig}
            viewType={viewType}
          />
        ))}
      </div>
    </div>
  );
}

