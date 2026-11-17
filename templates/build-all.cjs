// Builds every sample template into public/demos/.
const { execSync } = require('child_process')
const path = require('path')
for (const t of ['business-website', 'event-registration', 'ai-tool', 'ai-screening'])
  execSync('npx vite build', { cwd: path.join(__dirname, t), stdio: 'inherit' })
