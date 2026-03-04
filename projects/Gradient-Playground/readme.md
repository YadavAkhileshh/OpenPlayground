
# Gradient Playground

>A small browser-based tool to interactively build and copy CSS gradients using CSS variables.

**What it does**
- Lets you rotate and shift hue for a layered gradient preview.
- Provides controls to `spin` the gradient, `randomize` angles and `copy` the generated CSS to clipboard.
- Uses CSS variables so the generated gradient can be adjusted or embedded easily.

**How to use**
1. Open [projects/Gradient-Playground/index.html](projects/Gradient-Playground/index.html) in a browser.
2. Use the `Rotate All` and `Hue` sliders to tweak the gradient.
3. Click `Spin` to animate a rotation, `Randomize Angles` to set random layer angles, or `Copy CSS` to copy the current gradient string.

**Notes**
- The page relies on Vue and Toastr from CDNs (already included in the HTML).
- When copying, the script extracts the computed `background-image` and places it on the clipboard.
- Serving the folder via a local static server is recommended for development.

**Development**
- Quick local server examples:

	- `npx http-server .`
	- `python -m http.server 8000`

**License**
- See repository root for license details.
