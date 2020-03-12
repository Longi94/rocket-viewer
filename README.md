# Rocket Viewer (https://rocket-viewer.com)

[![Language Grade][lgtm]][lgtm-url]
[![Discord][discord]][discord-url]

[lgtm]: https://img.shields.io/lgtm/grade/javascript/github/Longi94/rocket-viewer.svg?label=code%20quality
[lgtm-url]: https://lgtm.com/projects/g/Longi94/rocket-viewer/
[discord]: https://img.shields.io/discord/609050910731010048.svg?colorB=7581dc&logo=discord&logoColor=white
[discord-url]: https://discord.gg/c8cArY9

A web Rocket League replay viewer focused on accurate replication. Built with [Angular 9](https://angular.io/) and [three.js](https://threejs.org/). Uses [boxcars](https://github.com/nickbabcock/boxcars) to deserialize replays client side without any servers involved.

## Development

`ng serve` to run a dev server at https://localhost:4200.

`ng build` to build the project.

Both of this commands will also compile the wasm module written in rust. To only compile the wasm module run `npm run wasm-pack`.
