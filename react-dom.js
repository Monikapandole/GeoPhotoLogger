// Mock file for react-dom in React Native
// This prevents Metro from failing when @react-aria/utils tries to import react-dom
module.exports = {
  // Mock commonly used react-dom exports
  render: () => {},
  createPortal: () => {},
  findDOMNode: () => {},
  unmountComponentAtNode: () => {},
  createElement: () => {},
  createContext: () => {},
  Fragment: 'Fragment',
  StrictMode: 'StrictMode',
  Suspense: 'Suspense',
  // Add any other exports that might be needed
}; 