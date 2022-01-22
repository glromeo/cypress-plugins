const esbuild = require("esbuild");
const {sassPlugin} = require("esbuild-sass-plugin");

esbuild.build({
    entryPoints: ["src/index.tsx"],
    outdir: "public/lib",
    plugins: [
        sassPlugin({
            type: "style",
            sourceMap: false
        })
    ],
    bundle: true,
    minify: true, // TODO: Do I need to map the identifiers?
    sourcemap: true,
    treeShaking: false
}).then(()=>console.log("OK"), (e)=>console.error(e));