# TriSlot

A GNOME Shell window-tiling extension based on [Tactile](https://gitlab.com/lundal/tactile). It moves the focused window directly without showing a grid.

## Shortcuts

- **Super+D** cycles the active window back and forth through the left, center, and right thirds of its monitor's work area.
- **Super+F** cycles the active window between the left two-thirds and right two-thirds of its monitor's work area.
- **Super+G** cycles the active window between the left and right halves of its monitor's work area.

All shortcuts can be changed in the extension preferences. The work area excludes GNOME panels and reserved desktop space. Slot widths are calculated to cover the work area without rounding gaps.

## Build and install

```sh
npm ci
npm run check
npm run build
```

The extension can then be packaged and installed using the `Makefile` targets.

## License

This project is derived from Tactile and remains distributed under the GNU General Public License v3.0 or later. See [LICENSE](LICENSE).
