import { $init, id } from './my-component/my-component';
// import { $init } from './builder/builder';

$init().then(() => {
  console.log('init');
});

// TODO: why does this work, while component-studio2 does not?

export function get(d) {
  return id(d);
}
