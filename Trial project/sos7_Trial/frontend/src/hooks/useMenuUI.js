import { useEffect, useRef, useState } from "react";

const useMenuUI = () => {
  const [showSticky, setShowSticky] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const stickyRef = useRef(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const current = window.scrollY;

      if (!stickyRef.current) return;

      const rect = stickyRef.current.getBoundingClientRect();
      const isAtTop = rect.top <= 10;

      if (isAtTop) {
        setShowSticky(current < lastScrollY);
      } else {
        setShowSticky(true);
      }

      setHasScrolled(current > 150);
      lastScrollY = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { showSticky, hasScrolled, stickyRef };
};

export default useMenuUI;