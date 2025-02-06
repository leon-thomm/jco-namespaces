import { Data } from './interfaces/jco-testing-default-i.d';

const base64Compile = str => WebAssembly.compile(typeof Buffer !== 'undefined' ? Buffer.from(str, 'base64') : Uint8Array.from(atob(str), b => b.charCodeAt(0)));

let curResourceBorrows = [];

const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
let _fs;
async function fetchCompile (url) {
  if (isNode) {
    _fs = _fs || await import('node:fs/promises');
    return WebAssembly.compile(await _fs.readFile(url));
  }
  return fetch(url).then(WebAssembly.compileStreaming);
}

const handleTables = [];

const instantiateCore = WebAssembly.instantiate;

const T_FLAG = 1 << 30;

function rscTableCreateOwn (table, rep) {
  const free = table[0] & ~T_FLAG;
  if (free === 0) {
    table.push(0);
    table.push(rep | T_FLAG);
    return (table.length >> 1) - 1;
  }
  table[0] = table[free << 1];
  table[free << 1] = 0;
  table[(free << 1) + 1] = rep | T_FLAG;
  return free;
}

function rscTableRemove (table, handle) {
  const scope = table[handle << 1];
  const val = table[(handle << 1) + 1];
  const own = (val & T_FLAG) !== 0;
  const rep = val & ~T_FLAG;
  if (val === 0 || (scope & T_FLAG) !== 0) throw new TypeError('Invalid handle');
  table[handle << 1] = table[0] | T_FLAG;
  table[0] = handle | T_FLAG;
  return { rep, scope, own };
}

const symbolCabiDispose = Symbol.for('cabiDispose');

const symbolRscHandle = Symbol('handle');

const symbolRscRep = Symbol.for('cabiRep');

const symbolDispose = Symbol.dispose || Symbol.for('dispose');

function throwUninitialized() {
  throw new TypeError('Wasm uninitialized use `await $init` first');
}


const handleTable0 = [T_FLAG, 0];
const captureTable0= new Map();
let captureCnt0 = 0;
handleTables[0] = handleTable0;

function trampoline1(arg0) {
  var handle1 = arg0;
  var rep2 = handleTable0[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable0.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(Data.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  rsc0.f();
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = undefined;
  }
  curResourceBorrows = [];
}
let exports0;
let exports1;

function id(arg0) {
  if (!_initialized) throwUninitialized();
  if (!(arg0 instanceof Data)) {
    throw new TypeError('Resource error: Not a valid "Data" resource.');
  }
  var handle0 = arg0[symbolRscHandle];
  if (!handle0) {
    const rep = arg0[symbolRscRep] || ++captureCnt0;
    captureTable0.set(rep, arg0);
    handle0 = rscTableCreateOwn(handleTable0, rep);
  }
  const ret = exports0.id(handle0);
  var handle2 = ret;
  var rep3 = handleTable0[(handle2 << 1) + 1] & ~T_FLAG;
  var rsc1 = captureTable0.get(rep3);
  if (!rsc1) {
    rsc1 = Object.create(Data.prototype);
    Object.defineProperty(rsc1, symbolRscHandle, { writable: true, value: handle2});
    Object.defineProperty(rsc1, symbolRscRep, { writable: true, value: rep3});
  }
  else {
    captureTable0.delete(rep3);
  }
  rscTableRemove(handleTable0, handle2);
  return rsc1;
}
function trampoline0(handle) {
  const handleEntry = rscTableRemove(handleTable0, handle);
  if (handleEntry.own) {
    
    const rsc = captureTable0.get(handleEntry.rep);
    if (rsc) {
      if (rsc[symbolDispose]) rsc[symbolDispose]();
      captureTable0.delete(handleEntry.rep);
    } else if (Data[symbolCabiDispose]) {
      Data[symbolCabiDispose](handleEntry.rep);
    }
  }
}

let _initialized = false;
export const $init = (() => {
  let gen = (function* init () {
    const module0 = fetchCompile(new URL('./my-component.core.wasm', import.meta.url));
    const module1 = base64Compile('AGFzbQEAAAABBAFgAAACBQEAAAAACAEA');
    ({ exports: exports0 } = yield instantiateCore(yield module0, {
      'jco-testing:default/I': {
        '[method]data.f': trampoline1,
        '[resource-drop]data': trampoline0,
      },
    }));
    ({ exports: exports1 } = yield instantiateCore(yield module1, {
      '': {
        '': exports0._initialize,
      },
    }));
    _initialized = true;
  })();
  let promise, resolve, reject;
  function runNext (value) {
    try {
      let done;
      do {
        ({ value, done } = gen.next(value));
      } while (!(value instanceof Promise) && !done);
      if (done) {
        if (resolve) resolve(value);
        else return value;
      }
      if (!promise) promise = new Promise((_resolve, _reject) => (resolve = _resolve, reject = _reject));
      value.then(runNext, reject);
    }
    catch (e) {
      if (reject) reject(e);
      else throw e;
    }
  }
  const maybeSyncReturn = runNext(null);
  return promise || maybeSyncReturn;
})();

export { id,  }