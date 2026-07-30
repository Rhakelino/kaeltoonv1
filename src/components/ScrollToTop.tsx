import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Attempt multiple scroll methods for broader compatibility, including container scrolling
    window.scrollTo(0, 0);
    
    // Also scroll the main content area in the layout
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
