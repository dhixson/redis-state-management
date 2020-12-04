# redis-state-management
## Pre-requisits
- node
- npm
- redis server [windows](https://riptutorial.com/redis/example/29962/installing-and-running-redis-server-on-windows), [mac](https://medium.com/@petehouston/install-and-config-redis-on-mac-os-x-via-homebrew-eb8df9a4f298), [ubuntu](https://linuxize.com/post/how-to-install-and-configure-redis-on-ubuntu-20-04/)

## Install
### Server
`cd server && npm install && npm run-script build`
### Web App
`cd app && npm install && npm run-script build`

## Run
### Server
`cd server && node dist/index.js serve <port>`
### Web App
`cd app && npm run-script serve`
