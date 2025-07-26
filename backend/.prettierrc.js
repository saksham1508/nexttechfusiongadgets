// Prettier configuration for consistent code formatting (Lean methodology)
module.exports = {
  // Basic formatting
  semi: true,
  trailingComma: 'none',
  singleQuote: true,
  doubleQuote: false,
  
  // Indentation
  tabWidth: 2,
  useTabs: false,
  
  // Line length
  printWidth: 100,
  
  // Spacing
  bracketSpacing: true,
  bracketSameLine: false,
  
  // Arrow functions
  arrowParens: 'avoid',
  
  // Objects
  objectCurlySpacing: true,
  
  // Arrays
  arrayBracketSpacing: false,
  
  // Quotes in objects
  quoteProps: 'as-needed',
  
  // JSX (if applicable)
  jsxSingleQuote: true,
  jsxBracketSameLine: false,
  
  // End of line
  endOfLine: 'lf',
  
  // Embedded languages
  embeddedLanguageFormatting: 'auto',
  
  // HTML
  htmlWhitespaceSensitivity: 'css',
  
  // Vue (if applicable)
  vueIndentScriptAndStyle: false,
  
  // Prose
  proseWrap: 'preserve',
  
  // File-specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2
      }
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 80
      }
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
        singleQuote: false
      }
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
        singleQuote: false
      }
    }
  ]
};