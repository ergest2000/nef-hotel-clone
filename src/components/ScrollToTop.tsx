import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Skip scroll reset on admin pages
    if (pathname.startsWith("/admin")) return;
    const scrollable = document.querySelector("#root > div");
    if (scrollable) {
      scrollable.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
