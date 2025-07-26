// Virtualized List Component - O(1) rendering for large datasets
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import performanceOptimizer from '../utils/performanceOptimizer';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  className?: string;
  loadMore?: () => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
}

// O(1) - Virtualized list component for optimal rendering
function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  onScroll,
  className = '',
  loadMore,
  hasNextPage = false,
  isLoading = false
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  // O(1) - Calculate visible items
  const visibleRange = useMemo(() => {
    return performanceOptimizer.calculateVisibleItems(
      containerHeight,
      itemHeight,
      scrollTop,
      items.length,
      overscan
    );
  }, [containerHeight, itemHeight, scrollTop, items.length, overscan]);

  // O(1) - Throttled scroll handler
  const handleScroll = useCallback(
    performanceOptimizer.throttle((event: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = event.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);

      // Infinite scrolling
      if (loadMore && hasNextPage && !isLoading) {
        const { scrollHeight, clientHeight } = event.currentTarget;
        if (newScrollTop + clientHeight >= scrollHeight - itemHeight * 3) {
          loadMore();
        }
      }

      // Track scrolling state
      isScrolling.current = true;
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        isScrolling.current = false;
      }, 150);
    }, 16), // ~60fps
    [onScroll, loadMore, hasNextPage, isLoading, itemHeight]
  );

  // O(k) where k is number of visible items - Render visible items
  const visibleItems = useMemo(() => {
    const items_to_render = [];
    
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      if (i >= items.length) break;
      
      const item = items[i];
      const top = i * itemHeight;
      
      items_to_render.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            top,
            left: 0,
            right: 0,
            height: itemHeight,
          }}
        >
          {renderItem(item, i)}
        </div>
      );
    }
    
    return items_to_render;
  }, [items, visibleRange, itemHeight, renderItem]);

  // O(1) - Scroll to specific index
  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current) {
      const scrollTop = index * itemHeight;
      containerRef.current.scrollTop = scrollTop;
      setScrollTop(scrollTop);
    }
  }, [itemHeight]);

  // O(1) - Scroll to top
  const scrollToTop = useCallback(() => {
    scrollToIndex(0);
  }, [scrollToIndex]);

  return (
    <div
      ref={containerRef}
      className={`virtual-list-container ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
    >
      {/* Total height spacer */}
      <div
        style={{
          height: visibleRange.totalHeight,
          position: 'relative',
        }}
      >
        {/* Visible items */}
        {visibleItems}
        
        {/* Loading indicator */}
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: items.length * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className="loading-spinner">Loading...</div>
          </div>
        )}
      </div>
    </div>
  );
}

// O(1) - Memoized virtualized list
const MemoizedVirtualizedList = React.memo(VirtualizedList) as typeof VirtualizedList;

export default MemoizedVirtualizedList;

// O(1) - Hook for virtualized list state management
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const visibleRange = useMemo(() => {
    return performanceOptimizer.calculateVisibleItems(
      containerHeight,
      itemHeight,
      scrollTop,
      items.length
    );
  }, [containerHeight, itemHeight, scrollTop, items.length]);

  const scrollToIndex = useCallback((index: number) => {
    setScrollTop(index * itemHeight);
  }, [itemHeight]);

  const handleScroll = useCallback((newScrollTop: number) => {
    setScrollTop(newScrollTop);
    setIsScrolling(true);
    
    // Debounce scrolling state
    const timeoutId = setTimeout(() => setIsScrolling(false), 150);
    return () => clearTimeout(timeoutId);
  }, []);

  return {
    scrollTop,
    isScrolling,
    visibleRange,
    scrollToIndex,
    handleScroll,
  };
}