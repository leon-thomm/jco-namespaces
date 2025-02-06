If you use Nix, you should be able to run `./build.sh` after activating the Nix shell with `nix-shell`.

If you don't use Nix, you need to make available: NodeJS, wit-bindgen, wasm-tools, and set `$CC` to the clang in wasi-sdk.