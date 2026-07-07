// Ambient declarations for stylesheet side-effect imports (e.g.
// `import "@/app/foo.css"`). Under `moduleResolution: bundler` +
// `isolatedModules`, TypeScript requires a module declaration for these or it
// reports ts(2882). Bundlers (Next.js) handle the actual import at build time.
declare module "*.css";
declare module "*.scss";
