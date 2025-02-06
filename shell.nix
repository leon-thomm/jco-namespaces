let
  rev = "d9d87c51960050e89c79e4025082ed965e770d68";  # rustc 1.82.0
  pkgs = import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/${rev}.tar.gz") { };
  external-deps = {
    wasi-sdk = pkgs.stdenvNoCC.mkDerivation rec {
      name = "wasi-sdk";
      WASI_OS = "linux";
      WASI_ARCH = "x86_64";
      WASI_VERSION = "24";
      WASI_VERSION_FULL = "${WASI_VERSION}.0";
      src = pkgs.fetchurl {
        url = "https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-${WASI_VERSION}/wasi-sdk-${WASI_VERSION_FULL}-${WASI_ARCH}-${WASI_OS}.tar.gz";
        sha256 = "sha256-xsOKq1bl3oit9sHrycOujacviOwrZW+wJO2o1BZ6C8U=";
      };
      buildInputs = [ ];
      buildPhase = ''
        mkdir -p $out
        tar -xzf $src --strip-components=1 -C $out
      '';
    };
  };
  env-shell = pkgs.writeShellApplication {
    name = "env-shell";
    text = ''
      #!/usr/bin/env bash
      export WASI_SDK_PATH=${external-deps.wasi-sdk.out}
      export LD_LIBRARY_PATH=$WASI_SDK_PATH
      export RUST_SRC_PATH=${pkgs.rust.packages.stable.rustPlatform.rustLibSrc}
      export CC="$WASI_SDK_PATH/bin/clang --sysroot=$WASI_SDK_PATH/share/wasi-sysroot"
      bash
    '';
  };
in (pkgs.buildFHSUserEnv {
  name = "wasi-env";
  targetPkgs = pkgs: [
    pkgs.nodejs_23
    pkgs.wit-bindgen
    pkgs.wasm-tools
    external-deps.wasi-sdk
  ];
  runScript = "${env-shell}/bin/env-shell";
}).env