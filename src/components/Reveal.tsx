import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Fades a block in the first time it enters the viewport, then stops observing.
 *
 * Reveal is the only thing making its content visible, so it fails open: threshold 0
 * means any sliver counts, which matters for blocks taller than the viewport and for
 * sections whose height changes asynchronously (the Instagram embeds). Where there is
 * no IntersectionObserver at all, content is shown rather than hidden.
 */
export function Reveal({ children, delay = 0, as: Tag = 'div', className = '' }: {
  children: ReactNode;
  delay?: number;
  as?: any;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('in');
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        timer = setTimeout(() => el.classList.add('in'), delay);
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [delay]);

  return <Tag ref={ref} className={`reveal ${className}`}>{children}</Tag>;
}
