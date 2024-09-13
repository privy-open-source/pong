import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      input  : './src/core/',
      builder: 'mkdist',
      outDir : 'dist/core',
      ext    : 'js',
    },
    {
      input  : './src/nhp/',
      builder: 'mkdist',
      outDir : 'dist/nhp',
      ext    : 'js',
    },
  ],
  externals  : ['#imports'],
  declaration: true,
  rollup     : {
    emitCJS  : true,
    cjsBridge: false,
  },
})
