set -e
pnpm run -r build 
cp -r ../dist .
python3 -m http.server 9000
