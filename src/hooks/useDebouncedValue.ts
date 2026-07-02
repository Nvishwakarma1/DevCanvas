import { useState, useEffect } from 'react';

/**
 * useDebouncedValue — Returns a debounced copy of the given value.
 * The returned value only updates after `delay` ms of inactivity.
 *
 * Usage: decouple expensive computations (e.g. generateFullHtml)
 * from fast-changing state (e.g. dragging a component).
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
