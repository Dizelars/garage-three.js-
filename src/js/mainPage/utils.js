export const isAutoplayVideoScreenSize = () => {
    return window.innerWidth <= 1199;
  };
  
  export const isElementVisible = (el) => {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
  
    return (
      cs.display !== "none" && cs.visibility !== "none" && cs.opacity !== "0" && rect.width && rect.height
    );
  };
  
  export const isElementInViewport = (el) => {
    let rect = el.getBoundingClientRect();
  
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight ||
          document.documentElement.clientHeight) /* or $(window).height() */ &&
      rect.right <=
        (window.innerWidth ||
          document.documentElement.clientWidth) /* or $(window).width() */
    );
  };
  
  export const observeElementVisibility = (el, onVisible, onHidden) => {
    const options = {
      root: null, // используем viewport в качестве корня
      rootMargin: '0px',
      threshold: 0, // порог видимости
    };
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // элемент стал видимым
          onVisible();
        } else {
          // элемент стал невидимым
          onHidden();
        }
      });
    }, options);
  
    observer.observe(el);
  
    // возвращаем объект observer, чтобы можно было прекратить отслеживание позже
    return observer;
  };
  