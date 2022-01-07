const esbuild = require("esbuild");
const {sassPlugin} = require("esbuild-sass-plugin");

esbuild.build({
    entryPoints: ["src/index.js"],
    loader: {".js":"jsx"},
    outdir: "public/lib",
    plugins: [
        sassPlugin({type: "style"})
    ],
    define: { "process.env.NODE_ENV": "'production'" },
    bundle: true,
    minify: false,
    sourcemap: true,
    treeShaking: false
}).then(()=>console.log("OK"), (e)=>console.error(e));