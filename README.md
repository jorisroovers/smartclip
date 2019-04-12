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

NOTE: materialdesignicons.min.css was modified to remove any reference to other fonts but the woff2 format (this was only at the top of the file).

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
- markdown to MS Office markup
- tabs-to-spaces
- Replace newlines/tabs in clip representation with newline/tab symbols
- Make things configurable
- Edit before copy
- Pin clips
- Show entire clip in textarea
- Search/replace in clip
- Open Clip in editor
- Save clip as file, Save as file and open
- Logging
- Custom Actions
- Details page
- Themes/Darkmode
- Auto-detect dark mode on mac
- URL: only match URL, not text incl URL
- About page with link to github
- Delete specific item
- Email recognition
- Website Icon/Help icon link