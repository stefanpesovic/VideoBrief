import "@testing-library/jest-dom";

// Mock IntersectionObserver for framer-motion whileInView
class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== "undefined" && !window.IntersectionObserver) {
  window.IntersectionObserver = IntersectionObserverMock;
  global.IntersectionObserver = IntersectionObserverMock;
}
