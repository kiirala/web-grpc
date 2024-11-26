# Building the React web app

## Configuring the Vite development server

Few edits to the default `vite.config.ts` are needed. A `server` block is required.

The `host: true` setting allows the development server to be reachable in case the server is
running inside a Docker container (such as the VSCode devcontainer defined in this project).

The `proxy` setting defines which paths are to be forwarded to the .NET server. All server
endpoints defined in this example share the `/api` prefix, so we'll forward that. We will also
set up a Swagger UI on the server to view what APIs are available, so let's forward that, too.

```js
server: {
    host: true,
    proxy: {
        '/api': 'http://localhost:5073',
        '/swagger': 'http://localhost:5073',
    },
},
```

The application server is configured to redirect non-encrypted http connections to https. The Vite
development server, however, will not proxy connections to a https server using self-signed development certificates. To circumvent this, we can move `app.UseHttpsRedirection();` clause in
`/Server/Program.cs` so that it only gets run for production builds.
