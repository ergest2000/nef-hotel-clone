import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll the main scrollable container or window to top
    const scrollable = document.querySelector("#root > div");
    if (scrollable) {
      scrollable.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
