#!/usr/bin/env node
import path from 'node:path';
import { spawn } from 'node:child_process';
import { readdir, mkdir } from 'node:fs/promises';
import { cwd, exit } from 'node:process';
import pnp from '../.pnp.cjs';

if (process.argv.length != 3) {
  console.error('Exactly one parameter required: directory where .proto files are located');
  exit(1);
}

const selfName = process.argv[1];
console.log('Working directory:', cwd());
console.log('Script directory:', path.dirname(process.argv[1]));
console.log('Script name', selfName);

const protoDir = process.argv[2];
const outputDir = 'src/proto';

pnp.setup();
console.log(pnp.resolveToUnqualified('google-proto-files', selfName));

const protocPath = pnp.resolveRequest('grpc-tools/bin/protoc', selfName).replaceAll('\\', '/');
const tsExtension = pnp.resolveRequest('ts-proto/protoc-gen-ts_proto', selfName).replaceAll('\\', '/');
const protoLibsPath = pnp.resolveToUnqualified('google-proto-files', selfName).replaceAll('\\', '/');

const protoFiles = (await readdir(protoDir))
  .filter((x) => x.endsWith('.proto'))
  .map((x) => path.join(protoDir, x).replaceAll('\\', '/'));

if (protoFiles.length == 0) {
  console.error(`No *.proto files found at ${protoDir}`);
  exit(2);
}

const args = [
  `--plugin=${tsExtension}`,
  `--ts_proto_out=${outputDir}`,
  '--ts_proto_opt=esModuleInterop=true',
  `--proto_path=${protoDir}`,
  `--proto_path=${protoLibsPath}`,
  ...protoFiles,
];

await mkdir(outputDir, { recursive: true });

console.log('Running protoc', [protocPath, ...args]);

const protoc = spawn(protocPath, args);
protoc.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

protoc.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

protoc.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
