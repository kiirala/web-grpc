# Building .proto files for client project

First we'll need to add various dependencies.

* [grpc-tools](https://www.npmjs.com/package/grpc-tools): contains `protoc`, the protocol buffer
  compiler
* [ts-proto](https://www.npmjs.com/package/ts-proto): contains a Typescript plugin for `protoc`,
  allowing the compiler to generate Typescript files
* [google-proto-files](https://www.npmjs.com/package/google-proto-files): contains definition of
  `option (google.api.http)` that is used in the example `.proto` files, and a vast amount of other
  definitions, mainly for Google Cloud services.

```
$ cd web-client/

$ yarn add --dev google-proto-files grpc-tools ts-proto
➤ YN0000: · Yarn 4.5.3
➤ YN0000: ┌ Resolution step
➤ YN0085: │ + grpc-tools@npm:1.12.4, ts-proto@npm:2.4.0, @bufbuild/protobuf@npm:2.2.2, @mapbox/node-pre-gyp@npm:1.0.11, abbrev@npm:1.1.1, agent-base@npm:6.0.2, aproba@npm:2.0.0, are-we-there-yet@npm:2.0.0, case-anything@npm:2.1.13, and 34 more.
➤ YN0000: └ Completed in 0s 697ms
➤ YN0000: ┌ Fetch step
➤ YN0013: │ 43 packages were added to the project (+ 27.32 MiB).
➤ YN0000: └ Completed in 1s 634ms
➤ YN0000: ┌ Link step
➤ YN0000: │ ESM support for PnP uses the experimental loader API and is therefore experimental
➤ YN0007: │ grpc-tools@npm:1.12.4 must be built because it never has been before or the last one failed
➤ YN0000: └ Completed in 0s 995ms
➤ YN0000: · Done with warnings in 3s 360ms
```

We'll also need to add [@bufbuild/protobuf](https://www.npmjs.com/package/@bufbuild/protobuf)
package as it's used by the generated code.

```
$ yarn add @bufbuild/protobuf
➤ YN0000: · Yarn 4.5.3
➤ YN0000: ┌ Resolution step
➤ YN0000: └ Completed
➤ YN0000: ┌ Fetch step
➤ YN0000: └ Completed in 0s 387ms
➤ YN0000: ┌ Link step
➤ YN0000: │ ESM support for PnP uses the experimental loader API and is therefore experimental
➤ YN0000: └ Completed
➤ YN0000: · Done with warnings in 0s 545ms
```

Some files need to be extracted from their NPM packages into regular files on disk: `protoc`
compiler program, the Typescript plugin for it and the common `.proto` definitions from
Google. The `grpc-tools` package containing `protoc` is already configured for that, but we'll need
to configure the other two separately. Add following to `package.json`.

```json
"dependenciesMeta": {
    "google-proto-files@4.2.0": {
        "unplugged": true
    },
    "ts-proto@2.4.0": {
        "unplugged": true
    }
},
```

Note that the packages are specified by their exact version. This version needs to match what is
installed. It's a good idea to edit `devDependencies` so that the imports are by exact version, too.
Otherwise this may suddenly break in the future, as the packages get updated.

We'll use the `afterInstall` plugin for Yarn to run the proto compilation script.

```
$ yarn plugin import https://raw.githubusercontent.com/mhassan1/yarn-plugin-after-install/v0.6.0/bundles/@yarnpkg/plugin-after-install.js
➤ YN0000: Downloading https://raw.githubusercontent.com/mhassan1/yarn-plugin-after-install/v0.6.0/bundles/@yarnpkg/plugin-after-install.js
➤ YN0000: Saving the new plugin in .yarn/plugins/@yarnpkg/plugin-after-install.cjs
➤ YN0000: Done in 0s 207ms
```

With this plugin installed, we can run things at every install. Add the command to `.yarnrc.yml`

```yml
afterInstall: yarn node bin/build-proto.js ../proto
```

With this, our setup is complete and the proto files are generated at install.

```
$ yarn
➤ YN0000: · Yarn 4.5.3
➤ YN0000: ┌ Resolution step
➤ YN0000: └ Completed
➤ YN0000: ┌ Fetch step
➤ YN0000: └ Completed in 0s 259ms
➤ YN0000: ┌ Link step
➤ YN0000: │ ESM support for PnP uses the experimental loader API and is therefore experimental
➤ YN0000: └ Completed
Running `afterInstall` hook...
Working directory: /workspaces/web-grpc/web-client
Script directory: /workspaces/web-grpc/web-client/bin
Script name /workspaces/web-grpc/web-client/bin/build-proto.js
/workspaces/web-grpc/web-client/.yarn/unplugged/google-proto-files-npm-4.2.0-28512554de/node_modules/google-proto-files/
Running protoc [
  '/workspaces/web-grpc/web-client/.yarn/unplugged/grpc-tools-npm-1.12.4-956df6794d/node_modules/grpc-tools/bin/protoc',
  '--plugin=/workspaces/web-grpc/web-client/.yarn/unplugged/ts-proto-npm-2.4.0-c5c2c1ec55/node_modules/ts-proto/protoc-gen-ts_proto',
  '--ts_proto_out=src/proto',
  '--ts_proto_opt=esModuleInterop=true',
  '--proto_path=../proto',
  '--proto_path=/workspaces/web-grpc/web-client/.yarn/unplugged/google-proto-files-npm-4.2.0-28512554de/node_modules/google-proto-files/',
  '../proto/notes.proto',
  '../proto/ping.proto'
]
child process exited with code 0
➤ YN0000: · Done with warnings in 1s 101ms
```

The files are generated to `/web-client/src/proto` You may want to add that directory to
`.gitignore` so you don't store the generated files unnecessarily. To change the target directory,
you need to edit `/web-client/bin/build-proto.js` file.
