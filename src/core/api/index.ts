
// Re-export all functions from domain-specific modules
export * from './components';
export * from './categories';
export * from './users';
export * from './wordpress';
export * from './wordpress-sites';

// Add alias for backward compatibility
export { getComponent as getComponentById } from './components';
