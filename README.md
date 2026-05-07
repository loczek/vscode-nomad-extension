# Nomad

A VSCode extension for the [nomad-ls](https://github.com/loczek/nomad-ls) language server.

## Features

- Autocomplete
- Diagnostics
- Formatting
- Hover information
- Driver support (docker, exec, raw_exec, qemu, java)
- Multiple languages support (`Nomad Job`, `Nomad Agent`, ...)

## Configure file associations

The only default suffix is `.nomad` and it matches to `Nomad Job`, other languages need to be configured to work e.g.

```jsonc
// .vscode/settings.json
{
  "files.associations": {
    "*.nomad.acl": "nomad-acl",
    "**/agent/*.nomad": "nomad-agent",
    "**/csi/*.nomad.csi": "nomad-volume-csi",
    "**/host/*.nomad.dyn": "nomad-volume-dynamic-host",
    "*.nomad": "nomad-job",
    "*.nomad.ns": "nomad-namespace",
    "*.nomad.np": "nomad-node-pool",
    "*.nomad.rq": "nomad-resource-quota",
    "*.nomad.var": "nomad-variable",
  },
}
```
