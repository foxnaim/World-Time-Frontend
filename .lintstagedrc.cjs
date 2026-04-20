module.exports = {
  '*.{ts,tsx}': ['prettier --write', 'eslint --fix --max-warnings 0'],
  '*.{js,cjs,mjs,json,yml,yaml,md}': ['prettier --write'],
  'packages/database/prisma/schema.prisma': ['prisma format'],
};
