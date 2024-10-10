import MagicString from 'magic-string'
import { EOL } from 'node:os'
import { basename } from 'node:path'
import { type Plugin } from 'rollup'

export default function injectDDTrace (packages: string[]): Plugin {
  let files: string[]

  return {
    name: 'rollup-plugin-dd-trace',
    buildStart () {
      files = packages.map((file) => {
        return this.emitFile({
          id      : file,
          type    : 'chunk',
          fileName: `${basename(file)}.mjs`,
        })
      })
    },
    renderChunk (code, chunk) {
      if (chunk.isEntry && chunk.fileName === 'index.mjs') {
        const s      = new MagicString(code)
        const inject = files.map((file) => {
          return `import './${this.getFileName(file)}';`
        }).join(EOL)

        s.prepend(`${inject}${EOL}`)

        return {
          code: s.toString(),
          map : s.generateMap({ source: chunk.fileName, hires: true }),
        }
      }
    },
  }
}
