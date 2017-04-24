# Smartclip #

Smart clipboard app for macOS written in NodeJS using electron, Ecmascript 6 and React. Focus on developer and power-user convenience.

I have some good ideas, but it's very early stages at this point! Using this opportunity to learn ReactJS along the way :-)

# Getting Started #

```bash
# Install dependencies
npm install
# For development
# In one terminal run:
npm run webpack-dev-server
# In another terminal
npm run dev
```

**Production**
```bash
# Production build:
node_modules/.bin/webpack
#  Run
npm start .
```


# TODO #
- Storing clips in encrypted file
    - Generate encryption key on first install (this is for later)
- image resizing and cropping from tray
- autoformat json, yaml, etc
- convert from json to e.g. yaml
- trim whitespace
- base64, md5, encode, etc
