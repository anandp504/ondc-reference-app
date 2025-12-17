import { useEffect, useRef, useState } from 'react';
import { Item, Catalog, RendererConfig } from '../types';
import { renderTemplate } from '../utils/templateRenderer';

interface ItemCardProps {
  item: Item;
  catalog: Catalog;
  rendererConfig: RendererConfig;
  viewType?: 'discoveryCard' | 'detailView' | 'compactCard';
}

export default function ItemCard({ item, catalog, rendererConfig, viewType = 'discoveryCard' }: ItemCardProps) {
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const template = rendererConfig.templates[viewType];
    if (template) {
      const html = renderTemplate(template.html, item, catalog);
      setRenderedHtml(html);
    }
  }, [item, catalog, rendererConfig, viewType]);

  useEffect(() => {
    if (containerRef.current && renderedHtml) {
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

