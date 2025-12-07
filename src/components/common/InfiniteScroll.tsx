import { ReactNode, useEffect, useRef, useState } from 'react';
import { Skeleton } from './SkeletonLoader';

interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  threshold?: number;
  loader?: ReactNode;
  endMessage?: ReactNode;
  className?: string;
}

export function InfiniteScroll<T>({
  items,
  renderItem,
  loadMore,
  hasMore,
  loading = false,
  threshold = 100,
  loader,
  endMessage,
  className = '',
}: InfiniteScrollProps<T>) {
  const [isFetching, setIsFetching] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isFetching && !loading) {
          setIsFetching(true);
          try {
            await loadMore();
          } finally {
            setIsFetching(false);
          }
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, isFetching, loading, loadMore, threshold]);

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={index}>{renderItem(item, index)}</div>
      ))}

      {(loading || isFetching) && (
        <div className="py-4">
          {loader || (
            <div className="space-y-3">
              <Skeleton height={80} />
              <Skeleton height={80} />
              <Skeleton height={80} />
            </div>
          )}
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          {endMessage || 'No more items to load'}
        </div>
      )}

      <div ref={loaderRef} className="h-4" />
    </div>
  );
}

export default InfiniteScroll;
