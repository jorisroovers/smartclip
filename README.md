# Smartclip #

Smart clipboard app for macOS written in NodeJS using electron, Ecmascript 6 and React. Focus on developer and power-user convenience.

I believe I have some good ideas, but it's very early stages at this point! Using this opportunity to learn ReactJS along the way :-)

I'm currently not really looking at code quality or keeping git commits small and contained, it's really all about having fun.

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

NOTE: materialdesignicons.min.css was modified to remove any reference to other fonts but the woff2 format (this was only at the top of the file).

**Production**
```bash
# Production build:
node_modules/.bin/webpack
#  Run
npm start .

# Run in background
nohup npm start . & echo $! > PID
# Kill backgroun
kill `cat PID`
```

# TODO

## General

- Storing clips in encrypted file
    - Generate encryption key on first install (this is for later)
- Make things configurable
- Edit before copy
- Logging
- Delete specific item
- Blacklist certain application sources (i.e. don't show on clipboard if copied from certain apps)

# Formatters
- image resizing and cropping from tray
- autoformat json, yaml, etc
- convert from json to e.g. yaml
- trim whitespace
- base64, md5, encode, etc
- markdown to MS Office markup
- tabs-to-spaces
- Replace newlines/tabs in clip representation with newline/tab symbols

- Pin clips
- Search/replace in clip
- Open Clip in editor
- Save clip as file, Save as file and open

- Custom Actions
- Details page
- Themes/Darkmode
- Auto-detect dark mode on mac
- URL: only match URL, not text incl URL
- About page with link to github

- Email recognition
- Linting
- Website Icon/Help icon link

# Components
- Editor
- Short-Representation
- Actions
- EditorActions
- 