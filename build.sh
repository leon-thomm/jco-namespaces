set -e

pushd my-component
wit-bindgen c ../default.wit
$CC my_component_impl.c my_component.c my_component_component_type.o -o my-component-core.wasm -mexec-model=reactor --target=wasm32-wasi -Wl,--export-all -Wl,--no-entry
wasm-tools component new my-component-core.wasm -o my-component.wasm
popd

pushd js
npx jco transpile ../my-component/my-component.wasm -o src/my-component --tla-compat --map "jco-testing:default/I"="./interfaces/jco-testing-default-i.d"
# npm run build -- --no-cache
npm run build-rollup -- --no-cache
popd