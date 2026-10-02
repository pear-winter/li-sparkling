const asset = path => new URL(path, import.meta.url).href;
export const seasonalPacks = [
  {
    "id": "lili-snow-black",
    "name": "黑雪花 · 细雪微尘",
    "images": [
      "assets/snow-black-1.svg",
      "assets/snow-black-2.svg",
      "assets/snow-black-3.svg"
    ],
    "colors": [
      "#000000"
    ],
    "motion": "snow",
    "count": 8,
    "size": 30,
    "duration": 2400,
    "spread": 80,
    "lift": 90,
    "shape": "circle",
    "glow": 0
  },
  {
    "id": "lili-snow-white",
    "name": "白雪花 · 细雪微尘",
    "images": [
      "assets/snow-white-1.svg",
      "assets/snow-white-2.svg",
      "assets/snow-white-3.svg"
    ],
    "colors": [
      "#ffffff"
    ],
    "motion": "snow",
    "count": 8,
    "size": 30,
    "duration": 2400,
    "spread": 80,
    "lift": 90,
    "shape": "circle",
    "glow": 0
  },
  {
    "id": "lili-music-black",
    "name": "黑音符 · 轻轻哼唱",
    "images": [
      "assets/music-black-1.svg",
      "assets/music-black-2.svg",
      "assets/music-black-3.svg",
      "assets/music-black-4.svg",
      "assets/music-black-5.svg",
      "assets/music-black-6.svg",
      "assets/music-black-7.svg"
    ],
    "colors": [
      "#000000"
    ],
    "motion": "music",
    "count": 8,
    "size": 29,
    "duration": 2100,
    "spread": 80,
    "lift": 130,
    "shape": "circle",
    "glow": 0
  },
  {
    "id": "lili-music-white",
    "name": "白音符 · 轻轻哼唱",
    "images": [
      "assets/music-white-1.svg",
      "assets/music-white-2.svg",
      "assets/music-white-3.svg",
      "assets/music-white-4.svg",
      "assets/music-white-5.svg",
      "assets/music-white-6.svg",
      "assets/music-white-7.svg"
    ],
    "colors": [
      "#ffffff"
    ],
    "motion": "music",
    "count": 8,
    "size": 29,
    "duration": 2100,
    "spread": 80,
    "lift": 130,
    "shape": "circle",
    "glow": 0
  },
  {
    "id": "lili-bubble-rainbow",
    "name": "虹彩泡泡 · 透明薄光",
    "images": [
      "assets/bubble-rainbow-1.svg",
      "assets/bubble-rainbow-2.svg",
      "assets/bubble-rainbow-3.svg"
    ],
    "colors": [
      "#a8efff",
      "#ffb5da",
      "#ffe9a8",
      "#c1b8ff"
    ],
    "motion": "bubble",
    "count": 8,
    "size": 40,
    "duration": 2500,
    "spread": 80,
    "lift": 180,
    "shape": "circle",
    "glow": 0
  }
].map(pack => ({...pack, images: pack.images.map(asset)}));
