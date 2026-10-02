const asset = path => new URL(path, import.meta.url).href;
export const ASSETS = Object.fromEntries(Object.entries({"spark2": "assets/3b79e930bcf23c5f.webp", "heart": "assets/d7d682610b39e470.webp", "spark1": "assets/cf3772db74e0f4c0.webp"}).map(([key, path]) => [key, asset(path)]));
export const butterflyPacks = [
  {
    "id": "lili-bf-white",
    "name": "白蝶 · 黑色闪闪",
    "images": [
      "assets/def7203ab97a2e72.webp",
      "assets/2139f5f9449ed1ef.webp",
      "assets/333b99737ffcc45e.webp",
      "assets/8bc78555d133ad9f.webp",
      "assets/b18e636591a23408.webp",
      "assets/f50472ede44fda16.webp",
      "assets/586123d854f802e3.webp",
      "assets/3a815f0f25f1533c.webp",
      "assets/1d00189fc26f16e7.webp",
      "assets/c0f884839ee713e0.webp",
      "assets/2c414d0d88b978dc.webp",
      "assets/52a7aa0a2c095200.webp"
    ],
    "colors": [
      "#151515"
    ],
    "count": 8,
    "size": 30,
    "duration": 1900,
    "spread": 70,
    "lift": 150,
    "shape": "star",
    "glow": 0,
    "motion": "flutter"
  },
  {
    "id": "lili-bf-black",
    "name": "黑蝶 · 白色闪闪",
    "images": [
      "assets/91a980aab4d94397.webp",
      "assets/9def6d444161f81a.webp",
      "assets/dc7600f1a8a12625.webp",
      "assets/e6840fc60c423168.webp",
      "assets/aa976b53795f8320.webp",
      "assets/21b7971f9a52e959.webp",
      "assets/aea90b1e48b492f4.webp",
      "assets/cf6db6b68bd458d2.webp",
      "assets/0a4c751a1db7c259.webp",
      "assets/e8769779542d95e9.webp",
      "assets/eed7a76e409e2dd0.webp",
      "assets/108e300246ce8d33.webp"
    ],
    "colors": [
      "#ffffff"
    ],
    "count": 8,
    "size": 30,
    "duration": 1900,
    "spread": 70,
    "lift": 150,
    "shape": "star",
    "glow": 0,
    "motion": "flutter"
  },
  {
    "id": "lili-bf-duo",
    "name": "黑白双蝶 · 双色闪闪",
    "images": [
      "assets/def7203ab97a2e72.webp",
      "assets/9def6d444161f81a.webp",
      "assets/333b99737ffcc45e.webp",
      "assets/e6840fc60c423168.webp",
      "assets/b18e636591a23408.webp",
      "assets/21b7971f9a52e959.webp",
      "assets/586123d854f802e3.webp",
      "assets/cf6db6b68bd458d2.webp",
      "assets/1d00189fc26f16e7.webp",
      "assets/e8769779542d95e9.webp",
      "assets/2c414d0d88b978dc.webp",
      "assets/108e300246ce8d33.webp"
    ],
    "colors": [
      "#151515",
      "#ffffff"
    ],
    "count": 8,
    "size": 30,
    "duration": 1900,
    "spread": 70,
    "lift": 150,
    "shape": "star",
    "glow": 0,
    "motion": "flutter"
  },
  {
    "id": "lili-bf-red",
    "name": "红蝶 · 黑色闪闪",
    "images": [
      "assets/06d0aa5e8be1e339.webp",
      "assets/5d8827ea8b82cb3f.webp",
      "assets/2ff3f0bc01d70405.webp",
      "assets/0df978d24d646828.webp",
      "assets/0795b8053d4bde63.webp",
      "assets/6013c55d816f0357.webp",
      "assets/7a5189503d9c9f73.webp",
      "assets/387c8c50bdf45848.webp",
      "assets/b5075360e749a242.webp",
      "assets/3b96b9dfa835ed54.webp",
      "assets/57b83dbddf9343ab.webp",
      "assets/a34f97b066abd41a.webp"
    ],
    "colors": [
      "#151515"
    ],
    "count": 8,
    "size": 30,
    "duration": 1900,
    "spread": 70,
    "lift": 150,
    "shape": "star",
    "glow": 0,
    "motion": "flutter"
  },
  {
    "id": "lili-bf-pink",
    "name": "粉蝶 · 白色闪闪",
    "images": [
      "assets/7648fcc2f4638b49.webp",
      "assets/6750b05fcf063e9a.webp",
      "assets/72207f0826904920.webp",
      "assets/022239909cbd37f1.webp",
      "assets/bd0b955994c7528d.webp",
      "assets/1059a5ffe4f89593.webp",
      "assets/e3696ed40cb52cd0.webp",
      "assets/198094ae89025ee5.webp",
      "assets/73fa5e60e42288aa.webp",
      "assets/c3821a363300e6d9.webp",
      "assets/762d817d6c1d5090.webp",
      "assets/ba2a2d87cdb1bd92.webp"
    ],
    "colors": [
      "#ffffff"
    ],
    "count": 8,
    "size": 30,
    "duration": 1900,
    "spread": 70,
    "lift": 150,
    "shape": "star",
    "glow": 0,
    "motion": "flutter"
  },
  {
    "id": "lili-bf-pear",
    "name": "梨蝶 · 黄色闪闪",
    "images": [
      "assets/0b53efe158fea13a.webp",
      "assets/abaf661e0ae65370.webp",
      "assets/65e16532d559fc0c.webp",
      "assets/43a1413e24f81cb4.webp",
      "assets/7948a5a835d559ea.webp",
      "assets/6f387d13a4b6120a.webp",
      "assets/33cebdc8d0edd348.webp",
      "assets/890c8e109e0dff61.webp",
      "assets/752bf51f87671363.webp",
      "assets/9c8a80b0a30abf83.webp",
      "assets/a5248678f1abb5d5.webp",
      "assets/5820c7e37692d890.webp"
    ],
    "colors": [
      "#ffd23f"
    ],
    "count": 8,
    "size": 30,
    "duration": 1900,
    "spread": 70,
    "lift": 150,
    "shape": "star",
    "glow": 0,
    "motion": "flutter"
  }
].map(pack => ({...pack, images: pack.images.map(asset)}));
