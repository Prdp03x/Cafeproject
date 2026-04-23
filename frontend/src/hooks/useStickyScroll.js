import { useEffect, useRef, useState } from "react";

const useStickyScroll = () => {
  const [showSticky, setShowSticky] = useState(true);
  const stickyRef = useRef(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!stickyRef.current) return;

      const rect = stickyRef.current.getBoundingClientRect();

      // 📍 Only activate when section hits top
      const isAtTop = rect.top <= 10;

      if (isAtTop) {
        if (currentScrollY > lastScrollY) {
          // scrolling DOWN → hide
          setShowSticky(false);
        } else {
          // scrolling UP → show
          setShowSticky(true);
        }
      } else {
        // before reaching top → always visible
        setShowSticky(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return {
    showSticky,
    stickyRef,
  };
};

export default useStickyScroll;