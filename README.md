# Creating the Harvest Game with Roblox

Project developed during the Lua Developer Training Bootcamp, under the guidance of specialist [Rafael Skoberg](https://github.com/rafaskb "Rafael Skoberg").
Creating a Harvest game from scratch with Roblox Studio, bringing together everything we've learned so far, plus basic knowledge about this promising platform.

## Features

- Dark/Light theme with moon and sun icons
- Multilanguage: **EN-US** (default), **PT-BR**, **ES-ES**
- Canvas grid with tiles that grow and can be harvested for coins
- Accessible controls: keyboard and screen reader friendly
- Responsive layout for desktop, tablet and smartphone
- No external libraries required

## Technologies Used

- **HTML** - main markup and UI
- **CSS** - styles using Flexbox and responsive rules
- **JavaScript** - game logic, rendering loop, theme and language handling

## How to run

1. Open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari).
2. The game runs locally; coins and preferences are saved in `localStorage`.

## Accessibility notes

- The canvas has an ARIA label and there is a grid of buttons for keyboard/screen reader interaction.
- Theme toggle and language select are focusable and have accessible labels.
- Colors and contrast are chosen to be readable in both themes.

## Customization ideas

- Increase grid size by editing `state.grid.cols` and `state.grid.rows` in `script.js`.
- Adjust growth speed by changing the `speed` constant inside `Tile.grow`.
- Replace simple shapes with sprites or images for richer visuals.

[LICENSE](./LICENSE)

See [original repository](https://github.com/digitalinnovationone/trilha-lua/tree/main/M%C3%B3dulo%204/Hello%20Roblox).
