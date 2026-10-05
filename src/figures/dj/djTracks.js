// djTracks — the crate. Real audio files played and mixed for real through the
// Web Audio graph in djAudio.js. Each entry is where the file lives (`file`) plus
// how the chip reads (`name`/`genre`/`accent`). To add a track: drop the mp3 in
// public/dj/ and push an entry here.
//
// The audio BASE is configurable so the ~60MB of mp3s can move to a CDN/bucket
// for production without touching this file: set VITE_DJ_AUDIO_BASE at build time
// (e.g. https://cdn.example.com/dj/). Defaults to the local /dj/ (public/dj/).
// See public/dj/README.md.
const BASE = (import.meta.env && import.meta.env.VITE_DJ_AUDIO_BASE) || "/dj/";

const RAW = [
  { key: "delilah", name: "Delilah", genre: "Fred again..", accent: "#d98fb0", file: "delilah.mp3" },
  { key: "jackieb", name: "Jackie B", genre: "House", accent: "#e08a5b", file: "jackie-b.mp3" },
  { key: "voulezvous", name: "Voulez-Vous", genre: "ABBA · Disco", accent: "#e0a23c", file: "voulez-vous.mp3" },
  { key: "jamiroquai", name: "You Give Me Something", genre: "Jamiroquai · Funk", accent: "#c1673a", file: "you-give-me-something.mp3" },
  { key: "bluemoon", name: "Blue Moon", genre: "NOËP · Dance", accent: "#4f9c93", file: "blue-moon.mp3" },
  { key: "drugsilike", name: "Drugs I Like", genre: "Electronic", accent: "#9ad13a", file: "drugs-i-like.mp3" },
  { key: "saymyname", name: "Say My Name", genre: "Remix", accent: "#5bb0d6", file: "say-my-name.mp3" },
  { key: "selfcontrol", name: "Self Control", genre: "Extended Mix", accent: "#c56f86", file: "self-control.mp3" },
  { key: "sleepless", name: "Sleepless", genre: "Electronic", accent: "#8f86b5", file: "sleepless.mp3" },
  { key: "tellyou", name: "Tell You Straight", genre: "House", accent: "#7fa35a", file: "tell-you-straight.mp3" },
  { key: "wouldyou", name: "Would You Just", genre: "Original Mix", accent: "#46c5a6", file: "would-you-just.mp3" },
];

export const TRACKS = RAW.map((t) => ({ ...t, url: BASE + t.file }));

export const trackByKey = (k) => TRACKS.find((t) => t.key === k) || TRACKS[0];
