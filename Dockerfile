# Serve the pre-built static SPA from nginx. `dist/` is built on the host
# (`bun run build`) before `docker build` — building under amd64 QEMU emulation
# crashes Bun, and a static copy keeps the image tiny + the build cross-arch safe.
FROM nginx:1.27-alpine
COPY dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
