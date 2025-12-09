import { describe, it, expect } from 'vitest';
import { render } from '../../../test/utils';
import { Skeleton, SkeletonGroup, CardSkeleton } from '../SkeletonLoader';

describe('SkeletonLoader', () => {
  it('renders Skeleton component', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass('bg-gray-300');
  });

  it('renders SkeletonGroup with correct count', () => {
    const { container } = render(<SkeletonGroup count={5} />);
    const skeletons = container.querySelectorAll('.bg-gray-300');
    expect(skeletons).toHaveLength(5);
  });

  it('renders CardSkeleton', () => {
    const { container } = render(<CardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
