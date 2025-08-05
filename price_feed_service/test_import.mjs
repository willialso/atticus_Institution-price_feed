const { idlFactory } = await import('./institutional_options_backend.did.mjs');

console.log('✅ ES6 Module Import Test Successful!');
console.log('IDL Factory:', typeof idlFactory);
console.log('IDL Factory content:', idlFactory); 