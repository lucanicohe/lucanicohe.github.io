const assetUrls = {
  player: {
    run: [
      'kiwi-run-1.png',
      'kiwi-run-2.png',
      'kiwi-run-3.png',
      'kiwi-run-4.png',
    ],
    dead: 'kiwi-dead.png',
  },
  hazards: {
    cactus: 'hazard-cactus.png',
    harakeke: 'hazard-harakeke.png',
    tussock: 'hazard-tussock.png',
    ponga: 'hazard-ponga.png',
  },
};

function loadImage(filename) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${filename}`));
    image.src = new URL(`../assets/sprites/${filename}`, import.meta.url).href;
  });
}

export async function loadAssets() {
  const player = {};
  player.run = await Promise.all(assetUrls.player.run.map(loadImage));
  player.dead = await loadImage(assetUrls.player.dead);

  const hazards = Object.fromEntries(await Promise.all(
    Object.entries(assetUrls.hazards).map(async ([kind, filename]) => [kind, await loadImage(filename)]),
  ));
  return { player, hazards };
}
