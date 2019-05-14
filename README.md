# NetQuake.io

**WebQuake** is an HTML5 WebGL port of the game Quake by id Software.

Based on JS port of GLQuake by Triang3l
[WebQuake](https://github.com/Triang3l/WebQuake)

[Live](http://www.netquake.io)

# This repository contains three major components with two targets

# The compnoents 

- Quake JS Engine
- Quake NodeJS server bindings
- Frontend app using Vue framework with bindings for running the engine in a browser

# Targets

- NodeJS Quake server
- Frontend assets for app (served with nginx, but any webserver supporing XHR range requests will work)

# Installing

Install Node.js version 8 or above (lower versions my work, I haven't tested)
All other dependencies are managed by NPM

# Running game server

`npm install`
`npm run build:justserver`

Standalone
`npm run start:gameserver -- <command args>`

Development
`npm run debug:gameserver -- <command args>`

# Running frontend

`npm install`
`npm run build`

Standalone
Serve with nginx using nginx.conf, or a webserver of your choise

Development
`npm run start:dev`