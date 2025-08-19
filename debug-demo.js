console.log('import.meta.url:', import.meta.url)
console.log('process.argv[1]:', process.argv[1])
console.log('file://' + process.argv[1])
console.log('Comparison result:', import.meta.url === `file://${process.argv[1]}`)

// Test the demo function directly
import { runAssetClassDemo } from './src/assetclass/demo.js'

console.log('Running demo directly...')
runAssetClassDemo()