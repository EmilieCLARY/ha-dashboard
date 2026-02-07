import React, { useMemo } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { useDashboardStore, WidgetConfig } from '../../stores/dashboard-manager.store';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './DashboardGrid.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  children: (widgetConfig: WidgetConfig) => React.ReactNode;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ children }) => {
  const { dashboards, activeDashboardId, editMode, updateLayout } = useDashboardStore();

  const activeDashboard = useMemo(() => {
    return dashboards.find((d) => d.id === activeDashboardId);
  }, [dashboards, activeDashboardId]);

  if (!activeDashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">No dashboard selected</p>
      </div>
    );
  }

  const layout = activeDashboard.config.layout;
  const cols = activeDashboard.config.cols || 12;
  const rowHeight = activeDashboard.config.rowHeight || 100;

  // Convert WidgetConfig to react-grid-layout Layout format
  const gridLayout: Layout[] = layout.map((widget) => ({
    i: widget.i,
    x: widget.x,
    y: widget.y,
    w: widget.w,
    h: widget.h,
    minW: widget.minW,
    minH: widget.minH,
    maxW: widget.maxW,
    maxH: widget.maxH,
    static: widget.static || !editMode,
  }));

  const handleLayoutChange = (newLayout: Layout[]) => {
    if (!editMode) return;

    // Merge layout changes back into widget configs
    const updatedWidgets: WidgetConfig[] = layout.map((widget) => {
      const layoutItem = newLayout.find((l) => l.i === widget.i);
      if (!layoutItem) return widget;

      return {
        ...widget,
        x: layoutItem.x,
        y: layoutItem.y,
        w: layoutItem.w,
        h: layoutItem.h,
      };
    });

    updateLayout(updatedWidgets);
  };

  const breakpoints = activeDashboard.config.breakpoints || {
    lg: 1200,
    md: 996,
    sm: 768,
    xs: 480,
    xxs: 0,
  };

  const colsConfig = {
    lg: cols,
    md: Math.max(6, Math.floor(cols * 0.75)),
    sm: Math.max(4, Math.floor(cols * 0.5)),
    xs: 2,
    xxs: 1,
  };

  return (
    <div className={`dashboard-grid ${editMode ? 'edit-mode' : ''}`}>
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: gridLayout }}
        breakpoints={breakpoints}
        cols={colsConfig}
        rowHeight={rowHeight}
        onLayoutChange={handleLayoutChange}
        isDraggable={editMode}
        isResizable={editMode}
        compactType="vertical"
        preventCollision={false}
        margin={[16, 16]}
        containerPadding={[16, 16]}
        useCSSTransforms={true}
        draggableHandle=".widget-drag-handle"
      >
        {layout.map((widget) => (
          <div key={widget.i} className="grid-item">
            {children(widget)}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};
