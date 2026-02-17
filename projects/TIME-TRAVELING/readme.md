# Time Travelling

A curated, interactive exploration of the Metropolitan Museum of Art’s collection. This project fetches artworks via the MET API and pairs them with period-accurate background music to create an immersive historical atmosphere — best enjoyed with headphones.

Features
- Fetches artworks from the MET API and displays them with metadata
- Period-accurate background audio to match artwork eras
- Minimal loader and immersive UI

Usage
- Open `index.html` in a modern browser, or serve the folder with a simple static server:

```bash
python -m http.server 8000
# then open http://localhost:8000/ in your browser
```

Development notes
- The main entry is `index.html` within this folder. Styles and scripts are embedded in the page.
- Tested locally with Chrome and Firefox.

Credits
- Inspired by and adapted from the original Pen / project: https://github.com/notbigmuzzy/goghwiththeflow

License
- See the repository LICENSE file for terms.