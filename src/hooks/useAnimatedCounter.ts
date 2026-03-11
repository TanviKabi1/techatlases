import { useState, useEffect, useRef } from "react";

export function useAnimatedCounter(target: number, duration = 1500, startOnMount = true) {
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!startOnMount || startedRef.current || target === 0) return;
    startedRef.current = true;

    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, startOnMount]);

  return count;
}
