# Vault entrance map reconstruction

- [Editable SVG](../../clientnpm/public/assets/maps/vault-entrance.svg)
- [PNG preview](vault-entrance-preview.png)
- [Python generator](../../scripts/generate_vault_map.py)

Reconstructed from the user-supplied `ake3m8n5mzs71.jpg`. This is a close, manually traced interpretation of the layout, not an exact pixel-for-pixel vectorization. Texture patterns differ from the source.

The SVG has a **1428 × 1680** viewBox matching the reference canvas. Named layers separate the terrain, water, stone terraces, walls, stairs, boulder, plates, and blocks. The source JPG is not embedded; shapes, gradients, and seeded SVG noise filters generate the artwork. Individual objects have IDs for editing in a vector editor or in code.

Regenerate from the repository root with Python 3 (no extra packages):

```powershell
python scripts/generate_vault_map.py
```

Edit the generator to make permanent changes; regenerating overwrites the SVG. For manual SVG edits, save a separate copy first.

Open the SVG in a modern browser to see its procedural textures. Some vector editors and SVG converters render filter effects differently. The PNG preview is a Chrome rendering for comparison.

With the client development server running, open `/assets/maps/vault-entrance.svg` on its localhost URL to view the asset. It is not yet connected to a Phaser scene. A tile grid, walkable regions, collision, pathfinding, and encounter logic are separate game data and have not been generated from this illustration.
