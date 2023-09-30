module.exports = {
  // this will check Typescript files
  '**/*.(ts)': () => 'pnpm tsc --noEmit',

  // This will lint and format TypeScript and JavaScript files
  /** @param {string[]} filenames */
  '**/*.(ts|js)': filenames => [
    `pnpm eslint --fix ${filenames.join(' ')}`,
    `pnpm prettier --write ${filenames.join(' ')}`
  ],

  // this will Format MarkDown and JSON
  /** @param {string[]} filenames */
  '**/*.(md|json)': filenames => `pnpm prettier --write ${filenames.join(' ')}`
}
