#!/usr/bin/env python3
"""Bundle the portfolio runner into a classic script for file:// previews."""

from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "portfolio-bundle.js"
MODULES = [
    "src/config.js",
    "src/pixel-font.js",
    "src/physics.js",
    "src/player.js",
    "src/animation.js",
    "src/score.js",
    "src/collision.js",
    "src/obstacles.js",
    "src/game.js",
    "src/assets.js",
    "src/input.js",
    "src/renderer.js",
    "portfolio-entry.js",
]

IMPORT_RE = re.compile(
    r"^import\s+\{([^}]+)\}\s+from\s+['\"]([^'\"]+)['\"];\s*$",
    re.MULTILINE,
)
EXPORT_RE = re.compile(
    r"^export\s+(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)",
    re.MULTILINE,
)


def module_id(path: Path) -> str:
    return path.as_posix()


def transform(path: Path) -> str:
    source = (ROOT / path).read_text(encoding="utf-8")

    def rewrite_import(match: re.Match[str]) -> str:
        bindings, request = match.groups()
        dependency = (path.parent / request).as_posix()
        return f"const {{{bindings}}} = __require({dependency!r});"

    source = IMPORT_RE.sub(rewrite_import, source)
    exported_names = EXPORT_RE.findall(source)
    source = re.sub(r"^export\s+", "", source, flags=re.MULTILINE)
    source = source.replace("import.meta.url", "__moduleUrl")
    if exported_names:
        source += "\nObject.assign(exports, {" + ", ".join(exported_names) + "});\n"
    return source


def main() -> None:
    modules = []
    for module in MODULES:
        module_path = Path(module)
        modules.append(
            f"  {module_id(module_path)!r}: function (module, exports, __require, __moduleUrl) {{\n"
            f"{transform(module_path)}\n"
            "  },"
        )

    bundle = """/* Generated from the neighboring source modules by tools/build_portfolio_bundle.py. */
(function () {
  const __bundleBase = new URL('./', document.currentScript.src);
  const __modules = {
""" + "\n".join(modules) + """
  };
  const __cache = Object.create(null);
  function __require(id) {
    if (__cache[id]) return __cache[id].exports;
    const module = { exports: {} };
    __cache[id] = module;
    const factory = __modules[id];
    if (!factory) throw new Error(`Unknown bundled module: ${id}`);
    factory(module, module.exports, __require, new URL(id, __bundleBase).href);
    return module.exports;
  }
  __require('portfolio-entry.js');
})();
"""
    OUTPUT.write_text(bundle, encoding="utf-8")
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
