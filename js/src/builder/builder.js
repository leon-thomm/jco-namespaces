import { ComponentHandle } from '../interfaces/wasmstudio-default-component-registry.d';

const base64Compile = str => WebAssembly.compile(typeof Buffer !== 'undefined' ? Buffer.from(str, 'base64') : Uint8Array.from(atob(str), b => b.charCodeAt(0)));

class ComponentError extends Error {
  constructor (value) {
    const enumerable = typeof value !== 'string';
    super(enumerable ? `${String(value)} (see error.payload)` : value);
    Object.defineProperty(this, 'payload', { value, enumerable });
  }
}

let curResourceBorrows = [];

let dv = new DataView(new ArrayBuffer());
const dataView = mem => dv.buffer === mem.buffer ? dv : dv = new DataView(mem.buffer);

const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
let _fs;
async function fetchCompile (url) {
  if (isNode) {
    _fs = _fs || await import('node:fs/promises');
    return WebAssembly.compile(await _fs.readFile(url));
  }
  return fetch(url).then(WebAssembly.compileStreaming);
}

function finalizationRegistryCreate (unregister) {
  if (typeof FinalizationRegistry === 'undefined') {
    return { unregister () {} };
  }
  return new FinalizationRegistry(unregister);
}

const handleTables = [];

const instantiateCore = WebAssembly.instantiate;

const T_FLAG = 1 << 30;

function rscTableCreateBorrow (table, rep) {
  const free = table[0] & ~T_FLAG;
  if (free === 0) {
    table.push(scopeId);
    table.push(rep);
    return (table.length >> 1) - 1;
  }
  table[0] = table[free];
  table[free << 1] = scopeId;
  table[(free << 1) + 1] = rep;
  return free;
}

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
let resourceCallBorrows = [];
function resourceTransferBorrow(handle, fromTid, toTid) {
  const fromTable = handleTables[fromTid];
  const isOwn = (fromTable[(handle << 1) + 1] & T_FLAG) !== 0;
  const rep = isOwn ? fromTable[(handle << 1) + 1] & ~T_FLAG : rscTableRemove(fromTable, handle).rep;
  if (definedResourceTables[toTid]) return rep;
  const toTable = handleTables[toTid] || (handleTables[toTid] = [T_FLAG, 0]);
  const newHandle = rscTableCreateBorrow(toTable, rep);
  resourceCallBorrows.push({ rid: toTid, handle: newHandle });
  return newHandle;
}

function resourceTransferOwn(handle, fromTid, toTid) {
  const { rep } = rscTableRemove(handleTables[fromTid], handle);
  const toTable = handleTables[toTid] || (handleTables[toTid] = [T_FLAG, 0]);
  return rscTableCreateOwn(toTable, rep);
}

let scopeId = 0;

const symbolCabiDispose = Symbol.for('cabiDispose');

const symbolRscHandle = Symbol('handle');

const symbolRscRep = Symbol.for('cabiRep');

const symbolDispose = Symbol.dispose || Symbol.for('dispose');

function throwUninitialized() {
  throw new TypeError('Wasm uninitialized use `await $init` first');
}

function toUint32(val) {
  return val >>> 0;
}

const utf8Decoder = new TextDecoder();

const utf8Encoder = new TextEncoder();

let utf8EncodedLen = 0;
function utf8Encode(s, realloc, memory) {
  if (typeof s !== 'string') throw new TypeError('expected a string');
  if (s.length === 0) {
    utf8EncodedLen = 0;
    return 1;
  }
  let buf = utf8Encoder.encode(s);
  let ptr = realloc(0, 0, 1, buf.length);
  new Uint8Array(memory.buffer).set(buf, ptr);
  utf8EncodedLen = buf.length;
  return ptr;
}

const definedResourceTables = [,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,,,];

let exports0;
let exports1;
let exports2;
let exports3;
let exports4;
let exports5;
let exports6;
let exports7;
let exports8;
let memory0;
let realloc0;
let memory1;
const handleTable112 = [T_FLAG, 0];
const captureTable0= new Map();
let captureCnt0 = 0;
handleTables[112] = handleTable112;

function trampoline18(arg0, arg1) {
  var handle1 = arg0;
  var rep2 = handleTable112[(handle1 << 1) + 1] & ~T_FLAG;
  var rsc0 = captureTable0.get(rep2);
  if (!rsc0) {
    rsc0 = Object.create(ComponentHandle.prototype);
    Object.defineProperty(rsc0, symbolRscHandle, { writable: true, value: handle1});
    Object.defineProperty(rsc0, symbolRscRep, { writable: true, value: rep2});
  }
  curResourceBorrows.push(rsc0);
  const ret = rsc0.clone();
  for (const rsc of curResourceBorrows) {
    rsc[symbolRscHandle] = undefined;
  }
  curResourceBorrows = [];
  var {name: v3_0, binary: v3_1, path: v3_2 } = ret;
  var ptr4 = utf8Encode(v3_0, realloc0, memory0);
  var len4 = utf8EncodedLen;
  dataView(memory0).setInt32(arg1 + 4, len4, true);
  dataView(memory0).setInt32(arg1 + 0, ptr4, true);
  var val5 = v3_1;
  var len5 = val5.byteLength;
  var ptr5 = realloc0(0, 0, 1, len5 * 1);
  var src5 = new Uint8Array(val5.buffer || val5, val5.byteOffset, len5 * 1);
  (new Uint8Array(memory0.buffer, ptr5, len5 * 1)).set(src5);
  dataView(memory0).setInt32(arg1 + 12, len5, true);
  dataView(memory0).setInt32(arg1 + 8, ptr5, true);
  var variant7 = v3_2;
  if (variant7 === null || variant7=== undefined) {
    dataView(memory0).setInt8(arg1 + 16, 0, true);
  } else {
    const e = variant7;
    dataView(memory0).setInt8(arg1 + 16, 1, true);
    var ptr6 = utf8Encode(e, realloc0, memory0);
    var len6 = utf8EncodedLen;
    dataView(memory0).setInt32(arg1 + 24, len6, true);
    dataView(memory0).setInt32(arg1 + 20, ptr6, true);
  }
}
let exports9;
let exports10;
let postReturn0;
let postReturn1;
let postReturn2;

function instantiate(arg0) {
  if (!_initialized) throwUninitialized();
  if (!(arg0 instanceof ComponentHandle)) {
    throw new TypeError('Resource error: Not a valid "ComponentHandle" resource.');
  }
  var handle0 = arg0[symbolRscHandle];
  if (!handle0) {
    const rep = arg0[symbolRscRep] || ++captureCnt0;
    captureTable0.set(rep, arg0);
    handle0 = rscTableCreateOwn(handleTable112, rep);
  }
  const ret = exports6.instantiate(handle0);
  let variant2;
  switch (dataView(memory0).getUint8(ret + 0, true)) {
    case 0: {
      variant2= {
        tag: 'ok',
        val: dataView(memory0).getInt32(ret + 4, true) >>> 0
      };
      break;
    }
    case 1: {
      var ptr1 = dataView(memory0).getInt32(ret + 4, true);
      var len1 = dataView(memory0).getInt32(ret + 8, true);
      var result1 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr1, len1));
      variant2= {
        tag: 'err',
        val: result1
      };
      break;
    }
    default: {
      throw new TypeError('invalid variant discriminant for expected');
    }
  }
  const retVal = variant2;
  postReturn0(ret);
  if (typeof retVal === 'object' && retVal.tag === 'err') {
    throw new ComponentError(retVal.val);
  }
  return retVal.val;
}

function removeInstance(arg0) {
  if (!_initialized) throwUninitialized();
  exports6['remove-instance'](toUint32(arg0));
}

function connectPorts(arg0, arg1, arg2, arg3) {
  if (!_initialized) throwUninitialized();
  var ptr0 = utf8Encode(arg1, realloc0, memory0);
  var len0 = utf8EncodedLen;
  var ptr1 = utf8Encode(arg3, realloc0, memory0);
  var len1 = utf8EncodedLen;
  const ret = exports6['connect-ports'](toUint32(arg0), ptr0, len0, toUint32(arg2), ptr1, len1);
  let variant4;
  switch (dataView(memory0).getUint8(ret + 0, true)) {
    case 0: {
      var ptr2 = dataView(memory0).getInt32(ret + 4, true);
      var len2 = dataView(memory0).getInt32(ret + 8, true);
      var result2 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr2, len2));
      variant4= {
        tag: 'ok',
        val: result2
      };
      break;
    }
    case 1: {
      var ptr3 = dataView(memory0).getInt32(ret + 4, true);
      var len3 = dataView(memory0).getInt32(ret + 8, true);
      var result3 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr3, len3));
      variant4= {
        tag: 'err',
        val: result3
      };
      break;
    }
    default: {
      throw new TypeError('invalid variant discriminant for expected');
    }
  }
  const retVal = variant4;
  postReturn1(ret);
  if (typeof retVal === 'object' && retVal.tag === 'err') {
    throw new ComponentError(retVal.val);
  }
  return retVal.val;
}

function disconnectPorts(arg0, arg1, arg2, arg3) {
  if (!_initialized) throwUninitialized();
  var ptr0 = utf8Encode(arg1, realloc0, memory0);
  var len0 = utf8EncodedLen;
  var ptr1 = utf8Encode(arg3, realloc0, memory0);
  var len1 = utf8EncodedLen;
  const ret = exports6['disconnect-ports'](toUint32(arg0), ptr0, len0, toUint32(arg2), ptr1, len1);
  let variant4;
  switch (dataView(memory0).getUint8(ret + 0, true)) {
    case 0: {
      var ptr2 = dataView(memory0).getInt32(ret + 4, true);
      var len2 = dataView(memory0).getInt32(ret + 8, true);
      var result2 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr2, len2));
      variant4= {
        tag: 'ok',
        val: result2
      };
      break;
    }
    case 1: {
      var ptr3 = dataView(memory0).getInt32(ret + 4, true);
      var len3 = dataView(memory0).getInt32(ret + 8, true);
      var result3 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr3, len3));
      variant4= {
        tag: 'err',
        val: result3
      };
      break;
    }
    default: {
      throw new TypeError('invalid variant discriminant for expected');
    }
  }
  const retVal = variant4;
  postReturn1(ret);
  if (typeof retVal === 'object' && retVal.tag === 'err') {
    throw new ComponentError(retVal.val);
  }
  return retVal.val;
}

function markForExport(arg0, arg1) {
  if (!_initialized) throwUninitialized();
  var ptr0 = utf8Encode(arg1, realloc0, memory0);
  var len0 = utf8EncodedLen;
  const ret = exports6['mark-for-export'](toUint32(arg0), ptr0, len0);
  let variant3;
  switch (dataView(memory0).getUint8(ret + 0, true)) {
    case 0: {
      var ptr1 = dataView(memory0).getInt32(ret + 4, true);
      var len1 = dataView(memory0).getInt32(ret + 8, true);
      var result1 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr1, len1));
      variant3= {
        tag: 'ok',
        val: result1
      };
      break;
    }
    case 1: {
      var ptr2 = dataView(memory0).getInt32(ret + 4, true);
      var len2 = dataView(memory0).getInt32(ret + 8, true);
      var result2 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr2, len2));
      variant3= {
        tag: 'err',
        val: result2
      };
      break;
    }
    default: {
      throw new TypeError('invalid variant discriminant for expected');
    }
  }
  const retVal = variant3;
  postReturn1(ret);
  if (typeof retVal === 'object' && retVal.tag === 'err') {
    throw new ComponentError(retVal.val);
  }
  return retVal.val;
}

function unmarkForExport(arg0, arg1) {
  if (!_initialized) throwUninitialized();
  var ptr0 = utf8Encode(arg1, realloc0, memory0);
  var len0 = utf8EncodedLen;
  const ret = exports6['unmark-for-export'](toUint32(arg0), ptr0, len0);
  let variant3;
  switch (dataView(memory0).getUint8(ret + 0, true)) {
    case 0: {
      var ptr1 = dataView(memory0).getInt32(ret + 4, true);
      var len1 = dataView(memory0).getInt32(ret + 8, true);
      var result1 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr1, len1));
      variant3= {
        tag: 'ok',
        val: result1
      };
      break;
    }
    case 1: {
      var ptr2 = dataView(memory0).getInt32(ret + 4, true);
      var len2 = dataView(memory0).getInt32(ret + 8, true);
      var result2 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr2, len2));
      variant3= {
        tag: 'err',
        val: result2
      };
      break;
    }
    default: {
      throw new TypeError('invalid variant discriminant for expected');
    }
  }
  const retVal = variant3;
  postReturn1(ret);
  if (typeof retVal === 'object' && retVal.tag === 'err') {
    throw new ComponentError(retVal.val);
  }
  return retVal.val;
}

function currentWit() {
  if (!_initialized) throwUninitialized();
  const ret = exports6['current-wit']();
  let variant2;
  switch (dataView(memory0).getUint8(ret + 0, true)) {
    case 0: {
      var ptr0 = dataView(memory0).getInt32(ret + 4, true);
      var len0 = dataView(memory0).getInt32(ret + 8, true);
      var result0 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr0, len0));
      variant2= {
        tag: 'ok',
        val: result0
      };
      break;
    }
    case 1: {
      var ptr1 = dataView(memory0).getInt32(ret + 4, true);
      var len1 = dataView(memory0).getInt32(ret + 8, true);
      var result1 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr1, len1));
      variant2= {
        tag: 'err',
        val: result1
      };
      break;
    }
    default: {
      throw new TypeError('invalid variant discriminant for expected');
    }
  }
  const retVal = variant2;
  postReturn1(ret);
  if (typeof retVal === 'object' && retVal.tag === 'err') {
    throw new ComponentError(retVal.val);
  }
  return retVal.val;
}

function build(arg0) {
  if (!_initialized) throwUninitialized();
  var ptr0 = utf8Encode(arg0, realloc0, memory0);
  var len0 = utf8EncodedLen;
  const ret = exports6.build(ptr0, len0);
  let variant6;
  switch (dataView(memory0).getUint8(ret + 0, true)) {
    case 0: {
      var ptr1 = dataView(memory0).getInt32(ret + 4, true);
      var len1 = dataView(memory0).getInt32(ret + 8, true);
      var result1 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr1, len1));
      var ptr2 = dataView(memory0).getInt32(ret + 12, true);
      var len2 = dataView(memory0).getInt32(ret + 16, true);
      var result2 = new Uint8Array(memory0.buffer.slice(ptr2, ptr2 + len2 * 1));
      let variant4;
      switch (dataView(memory0).getUint8(ret + 20, true)) {
        case 0: {
          variant4 = undefined;
          break;
        }
        case 1: {
          var ptr3 = dataView(memory0).getInt32(ret + 24, true);
          var len3 = dataView(memory0).getInt32(ret + 28, true);
          var result3 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr3, len3));
          variant4 = result3;
          break;
        }
        default: {
          throw new TypeError('invalid variant discriminant for option');
        }
      }
      variant6= {
        tag: 'ok',
        val: {
          name: result1,
          binary: result2,
          path: variant4,
        }
      };
      break;
    }
    case 1: {
      var ptr5 = dataView(memory0).getInt32(ret + 4, true);
      var len5 = dataView(memory0).getInt32(ret + 8, true);
      var result5 = utf8Decoder.decode(new Uint8Array(memory0.buffer, ptr5, len5));
      variant6= {
        tag: 'err',
        val: result5
      };
      break;
    }
    default: {
      throw new TypeError('invalid variant discriminant for expected');
    }
  }
  const retVal = variant6;
  postReturn2(ret);
  if (typeof retVal === 'object' && retVal.tag === 'err') {
    throw new ComponentError(retVal.val);
  }
  return retVal.val;
}

function clear() {
  if (!_initialized) throwUninitialized();
  exports6.clear();
}
const handleTable1 = [T_FLAG, 0];
const finalizationRegistry1 = finalizationRegistryCreate((handle) => {
  const { rep } = rscTableRemove(handleTable1, handle);
  exports2['0'](rep);
});

handleTables[1] = handleTable1;
function trampoline0(handle) {
  const handleEntry = rscTableRemove(handleTable1, handle);
  if (handleEntry.own) {
    
    exports2['0'](handleEntry.rep);
  }
}
const handleTable2 = [T_FLAG, 0];
const finalizationRegistry2 = finalizationRegistryCreate((handle) => {
  const { rep } = rscTableRemove(handleTable2, handle);
  exports2['1'](rep);
});

handleTables[2] = handleTable2;
function trampoline1(handle) {
  const handleEntry = rscTableRemove(handleTable2, handle);
  if (handleEntry.own) {
    
    exports2['1'](handleEntry.rep);
  }
}
const handleTable3 = [T_FLAG, 0];
const finalizationRegistry3 = finalizationRegistryCreate((handle) => {
  const { rep } = rscTableRemove(handleTable3, handle);
  exports2['2'](rep);
});

handleTables[3] = handleTable3;
function trampoline2(handle) {
  const handleEntry = rscTableRemove(handleTable3, handle);
  if (handleEntry.own) {
    
    exports2['2'](handleEntry.rep);
  }
}
const handleTable4 = [T_FLAG, 0];
const finalizationRegistry4 = finalizationRegistryCreate((handle) => {
  const { rep } = rscTableRemove(handleTable4, handle);
  exports2['3'](rep);
});

handleTables[4] = handleTable4;
function trampoline3(handle) {
  const handleEntry = rscTableRemove(handleTable4, handle);
  if (handleEntry.own) {
    
    exports2['3'](handleEntry.rep);
  }
}
const handleTable5 = [T_FLAG, 0];
const finalizationRegistry5 = finalizationRegistryCreate((handle) => {
  const { rep } = rscTableRemove(handleTable5, handle);
  exports2['22'](rep);
});

handleTables[5] = handleTable5;
function trampoline4(handle) {
  const handleEntry = rscTableRemove(handleTable5, handle);
  if (handleEntry.own) {
    
    exports2['22'](handleEntry.rep);
  }
}
const trampoline5 = rscTableCreateOwn.bind(null, handleTable5);
const trampoline6 = rscTableCreateOwn.bind(null, handleTable1);
const trampoline7 = rscTableCreateOwn.bind(null, handleTable2);
const trampoline8 = rscTableCreateOwn.bind(null, handleTable3);
const trampoline9 = rscTableCreateOwn.bind(null, handleTable4);
function trampoline10(handle) {
  return handleTable3[(handle << 1) + 1] & ~T_FLAG;
}
const handleTable6 = [T_FLAG, 0];
const finalizationRegistry6 = finalizationRegistryCreate((handle) => {
  const { rep } = rscTableRemove(handleTable6, handle);
  exports2['23'](rep);
});

handleTables[6] = handleTable6;
const trampoline11 = rscTableCreateOwn.bind(null, handleTable6);
function trampoline12(handle) {
  const handleEntry = rscTableRemove(handleTable112, handle);
  if (handleEntry.own) {
    
    const rsc = captureTable0.get(handleEntry.rep);
    if (rsc) {
      if (rsc[symbolDispose]) rsc[symbolDispose]();
      captureTable0.delete(handleEntry.rep);
    } else if (ComponentHandle[symbolCabiDispose]) {
      ComponentHandle[symbolCabiDispose](handleEntry.rep);
    }
  }
}
const handleTable113 = [T_FLAG, 0];
const finalizationRegistry113 = finalizationRegistryCreate((handle) => {
  const { rep } = rscTableRemove(handleTable113, handle);
  exports2['22'](rep);
});

handleTables[113] = handleTable113;
function trampoline13(handle) {
  const handleEntry = rscTableRemove(handleTable113, handle);
  if (handleEntry.own) {
    
    exports2['22'](handleEntry.rep);
  }
}
const handleTable114 = [T_FLAG, 0];
const finalizationRegistry114 = finalizationRegistryCreate((handle) => {
  const { rep } = rscTableRemove(handleTable114, handle);
  exports2['3'](rep);
});

handleTables[114] = handleTable114;
function trampoline14(handle) {
  const handleEntry = rscTableRemove(handleTable114, handle);
  if (handleEntry.own) {
    
    exports2['3'](handleEntry.rep);
  }
}
const handleTable116 = [T_FLAG, 0];
const finalizationRegistry116 = finalizationRegistryCreate((handle) => {
  const { rep } = rscTableRemove(handleTable116, handle);
  exports2['0'](rep);
});

handleTables[116] = handleTable116;
function trampoline15(handle) {
  const handleEntry = rscTableRemove(handleTable116, handle);
  if (handleEntry.own) {
    
    exports2['0'](handleEntry.rep);
  }
}
const handleTable115 = [T_FLAG, 0];
const finalizationRegistry115 = finalizationRegistryCreate((handle) => {
  const { rep } = rscTableRemove(handleTable115, handle);
  exports2['2'](rep);
});

handleTables[115] = handleTable115;
function trampoline16(handle) {
  const handleEntry = rscTableRemove(handleTable115, handle);
  if (handleEntry.own) {
    
    exports2['2'](handleEntry.rep);
  }
}
const trampoline17 = resourceTransferOwn;
function trampoline19(from_ptr, len, to_ptr) {
  new Uint8Array(memory0.buffer, to_ptr, len).set(new Uint8Array(memory1.buffer, from_ptr, len));
}

function trampoline20() {
  scopeId++;
}
const trampoline21 = resourceTransferBorrow;
function trampoline22() {
  scopeId--;
  for (const { rid, handle } of resourceCallBorrows) {
    if (handleTables[rid][handle << 1] === scopeId)
    throw new TypeError('borrows not dropped for resource call');
  }
  resourceCallBorrows= [];
}

let _initialized = false;
export const $init = (() => {
  let gen = (function* init () {
    const module0 = fetchCompile(new URL('./builder.core.wasm', import.meta.url));
    const module1 = base64Compile('AGFzbQEAAAABBAFgAAACBQEAAAAACAEA');
    const module2 = fetchCompile(new URL('./builder.core2.wasm', import.meta.url));
    const module3 = base64Compile('AGFzbQEAAAABBQFgAX8AAxkYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAUBcAEYGAd6GQEwAAABMQABATIAAgEzAAMBNAAEATUABQE2AAYBNwAHATgACAE5AAkCMTAACgIxMQALAjEyAAwCMTMADQIxNAAOAjE1AA8CMTYAEAIxNwARAjE4ABICMTkAEwIyMAAUAjIxABUCMjIAFgIyMwAXCCRpbXBvcnRzAQAK8QEYCQAgAEEAEQAACwkAIABBAREAAAsJACAAQQIRAAALCQAgAEEDEQAACwkAIABBBBEAAAsJACAAQQURAAALCQAgAEEGEQAACwkAIABBBxEAAAsJACAAQQgRAAALCQAgAEEJEQAACwkAIABBChEAAAsJACAAQQsRAAALCQAgAEEMEQAACwkAIABBDREAAAsJACAAQQ4RAAALCQAgAEEPEQAACwkAIABBEBEAAAsJACAAQRERAAALCQAgAEESEQAACwkAIABBExEAAAsJACAAQRQRAAALCQAgAEEVEQAACwkAIABBFhEAAAsJACAAQRcRAAALAC8JcHJvZHVjZXJzAQxwcm9jZXNzZWQtYnkBDXdpdC1jb21wb25lbnQHMC4yMTIuMACkCgRuYW1lABMSd2l0LWNvbXBvbmVudDpzaGltAYcKGAAmZHRvci1bZXhwb3J0XXdhc2k6aW8vZXJyb3JAMC4yLjAtZXJyb3IBKGR0b3ItW2V4cG9ydF13YXNpOmlvL3BvbGxAMC4yLjAtcG9sbGFibGUCL2R0b3ItW2V4cG9ydF13YXNpOmlvL3N0cmVhbXNAMC4yLjAtaW5wdXQtc3RyZWFtAzBkdG9yLVtleHBvcnRdd2FzaTppby9zdHJlYW1zQDAuMi4wLW91dHB1dC1zdHJlYW0ERWR0b3ItW2V4cG9ydF13YXNpOnNvY2tldHMvaXAtbmFtZS1sb29rdXBAMC4yLjAtcmVzb2x2ZS1hZGRyZXNzLXN0cmVhbQUuZHRvci1bZXhwb3J0XXdhc2k6c29ja2V0cy90Y3BAMC4yLjAtdGNwLXNvY2tldAYuZHRvci1bZXhwb3J0XXdhc2k6c29ja2V0cy91ZHBAMC4yLjAtdWRwLXNvY2tldAc8ZHRvci1bZXhwb3J0XXdhc2k6c29ja2V0cy91ZHBAMC4yLjAtaW5jb21pbmctZGF0YWdyYW0tc3RyZWFtCDxkdG9yLVtleHBvcnRdd2FzaTpzb2NrZXRzL3VkcEAwLjIuMC1vdXRnb2luZy1kYXRhZ3JhbS1zdHJlYW0JKWR0b3ItW2V4cG9ydF13YXNpOmh0dHAvdHlwZXNAMC4yLjAtZmllbGRzCjNkdG9yLVtleHBvcnRdd2FzaTpodHRwL3R5cGVzQDAuMi4wLWluY29taW5nLXJlcXVlc3QLM2R0b3ItW2V4cG9ydF13YXNpOmh0dHAvdHlwZXNAMC4yLjAtb3V0Z29pbmctcmVxdWVzdAwyZHRvci1bZXhwb3J0XXdhc2k6aHR0cC90eXBlc0AwLjIuMC1yZXF1ZXN0LW9wdGlvbnMNNGR0b3ItW2V4cG9ydF13YXNpOmh0dHAvdHlwZXNAMC4yLjAtcmVzcG9uc2Utb3V0cGFyYW0ONGR0b3ItW2V4cG9ydF13YXNpOmh0dHAvdHlwZXNAMC4yLjAtaW5jb21pbmctcmVzcG9uc2UPMGR0b3ItW2V4cG9ydF13YXNpOmh0dHAvdHlwZXNAMC4yLjAtaW5jb21pbmctYm9keRAyZHRvci1bZXhwb3J0XXdhc2k6aHR0cC90eXBlc0AwLjIuMC1mdXR1cmUtdHJhaWxlcnMRNGR0b3ItW2V4cG9ydF13YXNpOmh0dHAvdHlwZXNAMC4yLjAtb3V0Z29pbmctcmVzcG9uc2USMGR0b3ItW2V4cG9ydF13YXNpOmh0dHAvdHlwZXNAMC4yLjAtb3V0Z29pbmctYm9keRM7ZHRvci1bZXhwb3J0XXdhc2k6aHR0cC90eXBlc0AwLjIuMC1mdXR1cmUtaW5jb21pbmctcmVzcG9uc2UUOWR0b3ItW2V4cG9ydF13YXNpOmNsaS90ZXJtaW5hbC1pbnB1dEAwLjIuMC10ZXJtaW5hbC1pbnB1dBU7ZHRvci1bZXhwb3J0XXdhc2k6Y2xpL3Rlcm1pbmFsLW91dHB1dEAwLjIuMC10ZXJtaW5hbC1vdXRwdXQWM2R0b3ItW2V4cG9ydF13YXNpOmZpbGVzeXN0ZW0vdHlwZXNAMC4yLjAtZGVzY3JpcHRvchc/ZHRvci1bZXhwb3J0XXdhc2k6ZmlsZXN5c3RlbS90eXBlc0AwLjIuMC1kaXJlY3RvcnktZW50cnktc3RyZWFt');
    const module4 = base64Compile('AGFzbQEAAAABBQFgAX8AApYBGQABMAAAAAExAAAAATIAAAABMwAAAAE0AAAAATUAAAABNgAAAAE3AAAAATgAAAABOQAAAAIxMAAAAAIxMQAAAAIxMgAAAAIxMwAAAAIxNAAAAAIxNQAAAAIxNgAAAAIxNwAAAAIxOAAAAAIxOQAAAAIyMAAAAAIyMQAAAAIyMgAAAAIyMwAAAAgkaW1wb3J0cwFwARgYCR4BAEEACxgAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcALwlwcm9kdWNlcnMBDHByb2Nlc3NlZC1ieQENd2l0LWNvbXBvbmVudAcwLjIxMi4wABwEbmFtZQAVFHdpdC1jb21wb25lbnQ6Zml4dXBz');
    const module5 = fetchCompile(new URL('./builder.core3.wasm', import.meta.url));
    const module6 = fetchCompile(new URL('./builder.core4.wasm', import.meta.url));
    const module7 = base64Compile('AGFzbQEAAAABLghgAn9/AGAEf39/fwF/YAJ/fwF/YAF/AGABfwBgA39+fwBgBH9/f38AYAJ+fwADExIAAQICAgMEAAUAAAAABgAGBwQEBQFwARISB1wTATAAAAExAAEBMgACATMAAwE0AAQBNQAFATYABgE3AAcBOAAIATkACQIxMAAKAjExAAsCMTIADAIxMwANAjE0AA4CMTUADwIxNgAQAjE3ABEIJGltcG9ydHMBAArhARILACAAIAFBABEAAAsPACAAIAEgAiADQQERAQALCwAgACABQQIRAgALCwAgACABQQMRAgALCwAgACABQQQRAgALCQAgAEEFEQMACwkAIABBBhEEAAsLACAAIAFBBxEAAAsNACAAIAEgAkEIEQUACwsAIAAgAUEJEQAACwsAIAAgAUEKEQAACwsAIAAgAUELEQAACwsAIAAgAUEMEQAACw8AIAAgASACIANBDREGAAsLACAAIAFBDhEAAAsPACAAIAEgAiADQQ8RBgALCwAgACABQRARBwALCQAgAEEREQQACwAvCXByb2R1Y2VycwEMcHJvY2Vzc2VkLWJ5AQ13aXQtY29tcG9uZW50BzAuMjE5LjAAxAgEbmFtZQATEndpdC1jb21wb25lbnQ6c2hpbQGnCBIATWluZGlyZWN0LXdhc21zdHVkaW86ZGVmYXVsdC9jb21wb25lbnQtcmVnaXN0cnktW21ldGhvZF1jb21wb25lbnQtaGFuZGxlLmNsb25lASVhZGFwdC13YXNpX3NuYXBzaG90X3ByZXZpZXcxLWZkX3dyaXRlAidhZGFwdC13YXNpX3NuYXBzaG90X3ByZXZpZXcxLXJhbmRvbV9nZXQDKGFkYXB0LXdhc2lfc25hcHNob3RfcHJldmlldzEtZW52aXJvbl9nZXQELmFkYXB0LXdhc2lfc25hcHNob3RfcHJldmlldzEtZW52aXJvbl9zaXplc19nZXQFJmFkYXB0LXdhc2lfc25hcHNob3RfcHJldmlldzEtcHJvY19leGl0BjNpbmRpcmVjdC13YXNpOmNsaS9lbnZpcm9ubWVudEAwLjIuMC1nZXQtZW52aXJvbm1lbnQHOmluZGlyZWN0LXdhc2k6ZmlsZXN5c3RlbS90eXBlc0AwLjIuMC1maWxlc3lzdGVtLWVycm9yLWNvZGUISGluZGlyZWN0LXdhc2k6ZmlsZXN5c3RlbS90eXBlc0AwLjIuMC1bbWV0aG9kXWRlc2NyaXB0b3Iud3JpdGUtdmlhLXN0cmVhbQlJaW5kaXJlY3Qtd2FzaTpmaWxlc3lzdGVtL3R5cGVzQDAuMi4wLVttZXRob2RdZGVzY3JpcHRvci5hcHBlbmQtdmlhLXN0cmVhbQpAaW5kaXJlY3Qtd2FzaTpmaWxlc3lzdGVtL3R5cGVzQDAuMi4wLVttZXRob2RdZGVzY3JpcHRvci5nZXQtdHlwZQs8aW5kaXJlY3Qtd2FzaTpmaWxlc3lzdGVtL3R5cGVzQDAuMi4wLVttZXRob2RdZGVzY3JpcHRvci5zdGF0DEBpbmRpcmVjdC13YXNpOmlvL3N0cmVhbXNAMC4yLjAtW21ldGhvZF1vdXRwdXQtc3RyZWFtLmNoZWNrLXdyaXRlDTppbmRpcmVjdC13YXNpOmlvL3N0cmVhbXNAMC4yLjAtW21ldGhvZF1vdXRwdXQtc3RyZWFtLndyaXRlDkNpbmRpcmVjdC13YXNpOmlvL3N0cmVhbXNAMC4yLjAtW21ldGhvZF1vdXRwdXQtc3RyZWFtLmJsb2NraW5nLWZsdXNoD01pbmRpcmVjdC13YXNpOmlvL3N0cmVhbXNAMC4yLjAtW21ldGhvZF1vdXRwdXQtc3RyZWFtLmJsb2NraW5nLXdyaXRlLWFuZC1mbHVzaBAyaW5kaXJlY3Qtd2FzaTpyYW5kb20vcmFuZG9tQDAuMi4wLWdldC1yYW5kb20tYnl0ZXMRN2luZGlyZWN0LXdhc2k6ZmlsZXN5c3RlbS9wcmVvcGVuc0AwLjIuMC1nZXQtZGlyZWN0b3JpZXM');
    const module8 = base64Compile('AGFzbQEAAAABLghgAn9/AGAEf39/fwF/YAJ/fwF/YAF/AGABfwBgA39+fwBgBH9/f38AYAJ+fwACchMAATAAAAABMQABAAEyAAIAATMAAgABNAACAAE1AAMAATYABAABNwAAAAE4AAUAATkAAAACMTAAAAACMTEAAAACMTIAAAACMTMABgACMTQAAAACMTUABgACMTYABwACMTcABAAIJGltcG9ydHMBcAESEgkYAQBBAAsSAAECAwQFBgcICQoLDA0ODxARAC8JcHJvZHVjZXJzAQxwcm9jZXNzZWQtYnkBDXdpdC1jb21wb25lbnQHMC4yMTkuMAAcBG5hbWUAFRR3aXQtY29tcG9uZW50OmZpeHVwcw');
    const module9 = base64Compile('AGFzbQEAAAABEANgAAF/YAN/f38Bf2ABfwACiAEHBWZsYWdzCWluc3RhbmNlNAN/AQVmbGFncwppbnN0YW5jZTMzA38BBmNhbGxlZQhhZGFwdGVyMAAACHJlc291cmNlDHRyYW5zZmVyLW93bgABBmNhbGxlZQhhZGFwdGVyMQAABmNhbGxlZQhhZGFwdGVyMgAABmNhbGxlZQhhZGFwdGVyMwACAwUEAAAAAgctBAhhZGFwdGVyMAAFCGFkYXB0ZXIxAAYIYWRhcHRlcjIABwhhZGFwdGVyMwAICs4CBE8BAX8jAUEBcUUEQAALIwBBAnFFBEAACyMAQX1xJAAjAEF+cSQAIwBBAXIkABAAIQAjAUF+cSQBIABBBEHyABABIwFBAXIkASMAQQJyJAALTwEBfyMBQQFxRQRAAAsjAEECcUUEQAALIwBBfXEkACMAQX5xJAAjAEEBciQAEAIhACMBQX5xJAEgAEEDQfMAEAEjAUEBciQBIwBBAnIkAAtPAQF/IwFBAXFFBEAACyMAQQJxRQRAAAsjAEF9cSQAIwBBfnEkACMAQQFyJAAQAyEAIwFBfnEkASAAQQRB8gAQASMBQQFyJAEjAEECciQAC1wAIwFBAXFFBEAACyMAQQJxRQRAAAsjAEF9cSQAIwBBfnEkAAJ/AkACQAJAIAAOAgECAAsAC0EADAELQQELIwBBAXIkABAEIwFBfnEkASMBQQFyJAEjAEECciQACw');
    const module10 = fetchCompile(new URL('./builder.core5.wasm', import.meta.url));
    const instanceFlags1 = new WebAssembly.Global({ value: "i32", mutable: true }, 3);
    const instanceFlags4 = new WebAssembly.Global({ value: "i32", mutable: true }, 3);
    const instanceFlags33 = new WebAssembly.Global({ value: "i32", mutable: true }, 3);
    ({ exports: exports0 } = yield instantiateCore(yield module0));
    ({ exports: exports1 } = yield instantiateCore(yield module1, {
      '': {
        '': exports0._initialize,
      },
    }));
    ({ exports: exports2 } = yield instantiateCore(yield module3));
    ({ exports: exports3 } = yield instantiateCore(yield module2, {
      '[export]wasi:filesystem/types@0.2.0': {
        '[resource-drop]descriptor': trampoline4,
        '[resource-new]descriptor': trampoline5,
        '[resource-new]directory-entry-stream': trampoline11,
      },
      '[export]wasi:io/error@0.2.0': {
        '[resource-drop]error': trampoline0,
        '[resource-new]error': trampoline6,
      },
      '[export]wasi:io/poll@0.2.0': {
        '[resource-drop]pollable': trampoline1,
        '[resource-new]pollable': trampoline7,
      },
      '[export]wasi:io/streams@0.2.0': {
        '[resource-drop]input-stream': trampoline2,
        '[resource-drop]output-stream': trampoline3,
        '[resource-new]input-stream': trampoline8,
        '[resource-new]output-stream': trampoline9,
        '[resource-rep]input-stream': trampoline10,
      },
    }));
    ({ exports: exports4 } = yield instantiateCore(yield module4, {
      '': {
        $imports: exports2.$imports,
        '0': exports3['wasi:io/error@0.2.0#[dtor]error'],
        '1': exports3['wasi:io/poll@0.2.0#[dtor]pollable'],
        '10': exports3['wasi:http/types@0.2.0#[dtor]fields'],
        '11': exports3['wasi:http/types@0.2.0#[dtor]fields'],
        '12': exports3['wasi:http/types@0.2.0#[dtor]request-options'],
        '13': exports3['wasi:http/types@0.2.0#[dtor]fields'],
        '14': exports3['wasi:http/types@0.2.0#[dtor]fields'],
        '15': exports3['wasi:http/types@0.2.0#[dtor]fields'],
        '16': exports3['wasi:http/types@0.2.0#[dtor]fields'],
        '17': exports3['wasi:http/types@0.2.0#[dtor]fields'],
        '18': exports3['wasi:http/types@0.2.0#[dtor]fields'],
        '19': exports3['wasi:http/types@0.2.0#[dtor]fields'],
        '2': exports3['wasi:io/streams@0.2.0#[dtor]input-stream'],
        '20': exports3['wasi:cli/terminal-input@0.2.0#[dtor]terminal-input'],
        '21': exports3['wasi:cli/terminal-output@0.2.0#[dtor]terminal-output'],
        '22': exports3['wasi:filesystem/types@0.2.0#[dtor]descriptor'],
        '23': exports3['wasi:filesystem/types@0.2.0#[dtor]directory-entry-stream'],
        '3': exports3['wasi:io/streams@0.2.0#[dtor]output-stream'],
        '4': exports3['wasi:sockets/ip-name-lookup@0.2.0#[dtor]resolve-address-stream'],
        '5': exports3['wasi:sockets/tcp@0.2.0#[dtor]tcp-socket'],
        '6': exports3['wasi:sockets/udp@0.2.0#[dtor]udp-socket'],
        '7': exports3['wasi:sockets/udp@0.2.0#[dtor]incoming-datagram-stream'],
        '8': exports3['wasi:sockets/udp@0.2.0#[dtor]outgoing-datagram-stream'],
        '9': exports3['wasi:http/types@0.2.0#[dtor]fields'],
      },
    }));
    ({ exports: exports5 } = yield instantiateCore(yield module7));
    ({ exports: exports6 } = yield instantiateCore(yield module5, {
      wasi_snapshot_preview1: {
        environ_get: exports5['3'],
        environ_sizes_get: exports5['4'],
        fd_write: exports5['1'],
        proc_exit: exports5['5'],
        random_get: exports5['2'],
      },
      'wasmstudio:default/component-registry': {
        '[method]component-handle.clone': exports5['0'],
        '[resource-drop]component-handle': trampoline12,
      },
    }));
    ({ exports: exports7 } = yield instantiateCore(yield module9, {
      callee: {
        adapter0: exports3['wasi:cli/stderr@0.2.0#get-stderr'],
        adapter1: exports3['wasi:cli/stdin@0.2.0#get-stdin'],
        adapter2: exports3['wasi:cli/stdout@0.2.0#get-stdout'],
        adapter3: exports3['wasi:http/types@0.2.0#[dtor]fields'],
      },
      flags: {
        instance33: instanceFlags33,
        instance4: instanceFlags4,
      },
      resource: {
        'transfer-own': trampoline17,
      },
    }));
    ({ exports: exports8 } = yield instantiateCore(yield module6, {
      __main_module__: {
        cabi_realloc: exports6.cabi_realloc,
      },
      env: {
        memory: exports6.memory,
      },
      'wasi:cli/environment@0.2.0': {
        'get-environment': exports5['6'],
      },
      'wasi:cli/exit@0.2.0': {
        exit: exports7.adapter3,
      },
      'wasi:cli/stderr@0.2.0': {
        'get-stderr': exports7.adapter0,
      },
      'wasi:cli/stdin@0.2.0': {
        'get-stdin': exports7.adapter1,
      },
      'wasi:cli/stdout@0.2.0': {
        'get-stdout': exports7.adapter2,
      },
      'wasi:filesystem/preopens@0.2.0': {
        'get-directories': exports5['17'],
      },
      'wasi:filesystem/types@0.2.0': {
        '[method]descriptor.append-via-stream': exports5['9'],
        '[method]descriptor.get-type': exports5['10'],
        '[method]descriptor.stat': exports5['11'],
        '[method]descriptor.write-via-stream': exports5['8'],
        '[resource-drop]descriptor': trampoline13,
        'filesystem-error-code': exports5['7'],
      },
      'wasi:io/error@0.2.0': {
        '[resource-drop]error': trampoline15,
      },
      'wasi:io/streams@0.2.0': {
        '[method]output-stream.blocking-flush': exports5['14'],
        '[method]output-stream.blocking-write-and-flush': exports5['15'],
        '[method]output-stream.check-write': exports5['12'],
        '[method]output-stream.write': exports5['13'],
        '[resource-drop]input-stream': trampoline16,
        '[resource-drop]output-stream': trampoline14,
      },
      'wasi:random/random@0.2.0': {
        'get-random-bytes': exports5['16'],
      },
    }));
    memory0 = exports6.memory;
    realloc0 = exports6.cabi_realloc;
    memory1 = exports3.memory;
    ({ exports: exports9 } = yield instantiateCore(yield module10, {
      augments: {
        'mem1 I32Load8U': (ptr, off) => new DataView(exports6.memory.buffer).getUint8(ptr + off, true),
        'mem1 I32Store': (ptr, val, offset) => {
          new DataView(exports6.memory.buffer).setInt32(ptr + offset, val, true);
        },
        'mem1 I32Store8': (ptr, val, offset) => {
          new DataView(exports6.memory.buffer).setInt8(ptr + offset, val, true);
        },
        'mem1 I64Store': (ptr, val, offset) => {
          new DataView(exports6.memory.buffer).setBigInt64(ptr + offset, val, true);
        },
        'mem1 MemorySize': ptr => exports6.memory.buffer.byteLength / 65536,
        'mem2 I32Load': (ptr, off) => new DataView(exports0.memory.buffer).getInt32(ptr + off, true),
        'mem2 I32Load8U': (ptr, off) => new DataView(exports0.memory.buffer).getUint8(ptr + off, true),
        'mem2 MemorySize': ptr => exports0.memory.buffer.byteLength / 65536,
      },
      callee: {
        adapter10: exports3['wasi:io/streams@0.2.0#[method]output-stream.check-write'],
        adapter11: exports3['wasi:io/streams@0.2.0#[method]output-stream.write'],
        adapter12: exports3['wasi:io/streams@0.2.0#[method]output-stream.flush'],
        adapter13: exports0['wasi:random/random@0.2.0#get-random-bytes'],
        adapter14: exports3['wasi:filesystem/preopens@0.2.0#get-directories'],
        adapter4: exports3['wasi:cli/environment@0.2.0#get-environment'],
        adapter5: exports3['wasi:filesystem/types@0.2.0#filesystem-error-code'],
        adapter6: exports3['wasi:filesystem/types@0.2.0#[method]descriptor.write-via-stream'],
        adapter7: exports3['wasi:filesystem/types@0.2.0#[method]descriptor.append-via-stream'],
        adapter8: exports3['wasi:filesystem/types@0.2.0#[method]descriptor.get-type'],
        adapter9: exports3['wasi:filesystem/types@0.2.0#[method]descriptor.stat'],
      },
      flags: {
        instance1: instanceFlags1,
        instance33: instanceFlags33,
        instance4: instanceFlags4,
      },
      memory: {
        m0: exports3.memory,
      },
      post_return: {
        adapter13: exports0['cabi_post_wasi:random/random@0.2.0#get-random-bytes'],
        adapter14: exports3['cabi_post_wasi:filesystem/preopens@0.2.0#get-directories'],
        adapter4: exports3['cabi_post_wasi:cli/environment@0.2.0#get-environment'],
      },
      realloc: {
        f0: exports8.cabi_import_realloc,
        f14: exports3.cabi_realloc,
      },
      resource: {
        'enter-call': trampoline20,
        'exit-call': trampoline22,
        'transfer-borrow': trampoline21,
        'transfer-own': trampoline17,
      },
      transcode: {
        'utf8-to-utf8 (mem0 => mem1)': trampoline19,
      },
    }));
    ({ exports: exports10 } = yield instantiateCore(yield module8, {
      '': {
        $imports: exports5.$imports,
        '0': trampoline18,
        '1': exports8.fd_write,
        '10': exports9.adapter8,
        '11': exports9.adapter9,
        '12': exports9.adapter10,
        '13': exports9.adapter11,
        '14': exports9.adapter12,
        '15': exports9.adapter11,
        '16': exports9.adapter13,
        '17': exports9.adapter14,
        '2': exports8.random_get,
        '3': exports8.environ_get,
        '4': exports8.environ_sizes_get,
        '5': exports8.proc_exit,
        '6': exports9.adapter4,
        '7': exports9.adapter5,
        '8': exports9.adapter6,
        '9': exports9.adapter7,
      },
    }));
    postReturn0 = exports6.cabi_post_instantiate;
    postReturn1 = exports6['cabi_post_connect-ports'];
    postReturn2 = exports6.cabi_post_build;
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

export { build, clear, connectPorts, currentWit, disconnectPorts, instantiate, markForExport, removeInstance, unmarkForExport,  }