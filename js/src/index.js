import { $init, id } from './my-component/my-component';

$init().then(() => {
  console.log('init');
});

export function f(d) {
  return id(d);
}
