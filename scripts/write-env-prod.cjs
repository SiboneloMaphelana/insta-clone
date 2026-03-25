const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'src',
  'environments',
  'environment.prod.ts',
);
const url = process.env.API_BASE_URL;

if (!url) {
  console.log(
    'API_BASE_URL not set; using committed src/environments/environment.prod.ts',
  );
  process.exit(0);
}

const content = `export const environment = {
  production: true,
  apiUrl: ${JSON.stringify(url)},
};
`;
fs.writeFileSync(target, content);
console.log('Wrote environment.prod.ts from API_BASE_URL');
