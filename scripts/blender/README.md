# Blender assets via GitHub Actions

The workflow `.github/workflows/blender-assets.yml` runs Blender headlessly on GitHub-hosted Ubuntu, without the local Blender installation.

1. Run **Actions → Blender 3D Asset Preview → Run workflow**, or push a change to `scripts/blender/**`.
2. Download the `blender-medieval-preview` artifact containing `royal-hero.png`.
3. Review the render before replacing any original card art.

The script creates a **procedural 3D proof of concept** (stylized king, shield, sword and materialized magic rings). It does not silently overwrite the original characters or gameplay assets. For production, create unique models for every hero and optimize exported images/sprites for Safari on iPhone.
