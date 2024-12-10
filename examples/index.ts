import { Lockbox } from '../src/Lockbox';

async function run() {
  const lockbox = new Lockbox();
  await lockbox.init();
  console.log(process.env);
}

run();
