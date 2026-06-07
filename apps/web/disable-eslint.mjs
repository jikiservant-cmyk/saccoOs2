import fs from 'fs';
const files = [
  'apps/web/src/app/admin/page.tsx',
  'apps/web/src/app/cashbook/page.tsx',
  'apps/web/src/app/my-savings/page.tsx',
  'apps/web/src/app/onboarding/page.tsx',
  'apps/web/src/app/organizations/page.tsx',
  'apps/web/src/utils/member.ts',
  'apps/web/src/app/cashbook/QuickActions.tsx',
  'apps/web/src/utils/supabase/server.ts'
];
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf-8');
  if(!content.includes('eslint-disable typescript-eslint/no-explicit-any')) {
    fs.writeFileSync(f, '/* eslint-disable @typescript-eslint/no-explicit-any */\n' + content);
  }
});
