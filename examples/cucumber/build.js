const esbuild = require("esbuild");
const {sassPlugin} = require("esbuild-sass-plugin");

esbuild.build({
    entryPoints: ["src/index.tsx"],
    outdir: "public/lib",
    plugins: [
        sassPlugin({type: "style"})
    ],
    bundle: true,
    minify: false,
    sourcemap: true
}).then(()=>console.log("OK"), (e)=>console.error(e));