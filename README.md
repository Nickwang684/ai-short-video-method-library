# AI Short Video Method Library (AI短视频方法库)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Format: 1080x1920 30fps](https://img.shields.io/badge/Resolution-1080x1920%209%3A16-red.svg)](https://nickster2735.gumroad.com/l/ai-video-methods-complete)
[![Status: Active](https://img.shields.io/badge/Status-Production%20Ready-green.svg)](https://shop.nickwang.dpdns.org/)

> **25 reproducible ways to produce visual animations for vertical short videos (9:16, 1080×1920) using code and automation.**  
> Stop guessing AI video prompts. Build deterministic, zero-drop-frame video pipelines with GSAP, Three.js, Manim, Playwright, and FFmpeg.

![AI Short Video Method Library Banner](assets/banner.jpg)

---

## 🎯 The Problem

You wrote a killer script with ChatGPT / Claude. You generated high-quality voiceover with ElevenLabs / Azure TTS.

**What goes on the screen for the next 8 seconds?**

- **Pure AI Video Models (Sora, Runway, Kling):** Unpredictable random seeds ("prompt lottery"), uncontrollable motion trajectories, distorted typography, impossible to batch automate.
- **Manual Video Editors (Premiere, CapCut / 剪映):** High manual labor, impossible to link to live data APIs, tedious timeline adjustments.

**The Solution: Code-Driven Video Generation (代码驱动短视频)**  
Using minimal web technologies (HTML5 Canvas, GSAP, Three.js, SVG, Python), each frame is rendered via a **Virtual Clock** in a headless browser or renderer. Zero dropped frames, 100% deterministic, batchable via CLI.

---

## 📚 Complete Catalog: 25 Visual Methods

| # | Method | Core Stack | Best For | Included in Repo |
|---|---|---|---|:---:|
| **01** | **Kinetic Typography & Staggered Cards** | GSAP, CSS Grid, Canvas | High-converting hook statements, key takeaway summaries | ✅ Runnable |
| **02** | **3D Product Pedestal & Lighting** | Three.js, WebGL | SaaS feature highlights, hardware/gadget showcase | Complete Edition |
| **03** | **Procedural 3D Scene Automation** | Blender Python (bpy) | Cinematic 3D motion, photorealistic physics | Complete Edition |
| **04** | **Math & Formula Animations** | Manim (3Blue1Brown engine) | Educational deep dives, algorithm explanations | Complete Edition |
| **05** | **Architecture & Code Walkthroughs** | Motion Canvas, TypeScript | Tech tutorials, system architecture deep-dives | Complete Edition |
| **06** | **Vector Icon & Micro-Interactions** | Lottie, SVG, Bodymovin | Clean UI animations, metric counters, badges | Complete Edition |
| **07** | **Programmatic Color Grading & Glitch** | FFmpeg Filters, Libavfilter | Fast-paced transitions, split screens, retro effects | Complete Edition |
| **08** | **App & SaaS Product Demo Synth** | HTML5, Screen Capture API | Landing page walkthroughs, mobile app mockups | Complete Edition |
| **09** | **Live Browser Automation Capture** | Playwright, Headless Chromium | Web tool onboarding, live workflow demonstrations | Complete Edition |
| **10** | **Data Race Charts & Bar Graphs** | Vega-Lite, D3.js | Financial breakdowns, growth metrics, ranking shorts | ✅ Runnable |
| **11** | **2.5D Parallax Depth Layers** | Pixi.js, Displacement Maps | Photo animation, atmospheric historical narratives | Complete Edition |
| **12** | **3D Route & Geographic Flyovers** | MapLibre GL, GeoJSON | Travel routes, logistics tracking, geopolitical maps | Complete Edition |
| **13** | **Audio-Synced Word-by-Word Lyrics** | Web Audio, Canvas API | Karaoke-style subtitles, podcast soundbites | Complete Edition |
| **14** | **Generative Particle Waves** | HTML5 Canvas, Perlin Noise | Atmospheric ambient backgrounds, meditation/focus loops | Complete Edition |
| **15** | **Real-time GLSL Shader Effects** | Fragment Shaders, WebGL | High-energy music drops, futuristic backgrounds | Complete Edition |
| **16** | **Diagrams as Code Animation** | Mermaid.js, SVG Morph | Cloud architectures, flowcharts, data pipelines | ✅ Runnable |
| **17** | **Terminal CLI Demos & Typing** | asciinema, SVG Terminal | Developer tools, terminal shortcuts, coding tutorials | Complete Edition |
| **18** | **2D Physics Drop & Collisions** | Matter.js, Canvas | Viral packing challenges, bouncy bubble mechanics | Complete Edition |
| **19** | **Audio Frequency Visualizer** | Web Audio API, Canvas | Music shorts, voiceover waveform visualizers | Complete Edition |
| **20** | **Hand-Drawn Whiteboard Explainer** | Rough.js, SVG Animation | Sketch explainers, relatable educational content | Complete Edition |
| **21** | **Markdown Slides to 9:16 Video** | Marp, Headless Chrome | Turn technical markdown notes directly into videos | Complete Edition |
| **22** | **Programmatic Video Templates** | Revideo (Remotion alternative) | Dynamic personalized video rendering | Complete Edition |
| **23** | **High-DPI Desktop Window Recording** | Electron / Screen Capture | Desktop software feature reveals | Complete Edition |
| **24** | **Automatic Silence Cutting & Muxing** | FFmpeg silencedetect, Python | Trimming pauses, jump-cutting voiceovers automatically | Complete Edition |
| **25** | **Viral Short Retention Architecture** | Composite Timeline | Hook + Setup + Twist + CTA Retention template | Complete Edition |

---

## ⚡ Quick Start (Open-Source Examples)

We provide 3 complete runnable example methods in the `examples/` directory:

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [FFmpeg](https://ffmpeg.org/) (added to system PATH)

### Running Method 01 (GSAP Kinetic Typography)

```bash
cd examples/m01-gsap-html
npm install

# Render 1080x1920 video frames and encode to MP4:
npm run render
```

Check `output/video.mp4` for the zero-drop-frame 1080×1920 vertical video!

---

## 📦 Get the Full Library & Handbook

The full production package is available in two editions:

### 1. Complete Edition ($29 / ¥49.9)
- **All 25 runnable projects** (Node.js, Python, Three.js, GSAP, Manim, Playwright).
- **25 pre-rendered 1080×1920 (30fps) master clips** for instant video assembling.
- **Shared frame-by-frame Virtual Clock capturer** (guaranteed zero dropped frames).
- **Full 60-page handbook** (PDF + editable DOCX) + 12 AI prompt templates.
- **Commercial rights included** (create unlimited commercial videos).

### 2. Handbook Edition ($12 / ¥19.9)
- **60-page technical handbook** (PDF + DOCX) sorting all 25 techniques by shot type.
- **12 prompt engineering templates** to instruct LLMs to write renderable code.
- **Setup & troubleshooting guide** covering Windows, macOS, and Linux.

---

## 🛒 Purchase Links (Instant Automatic Delivery)

| Platform | Edition | Link | Currency |
|---|---|---|---|
| **Gumroad** | Complete ($29) | [Buy on Gumroad](https://nickster2735.gumroad.com/l/ai-video-methods-complete) | USD |
| **Gumroad** | Handbook ($12) | [Buy on Gumroad](https://nickster2735.gumroad.com/l/ai-video-methods-handbook) | USD |
| **Payhip** | Complete ($29) | [Buy on Payhip](https://payhip.com/b/msuRC) | USD |
| **Payhip** | Handbook ($12) | [Buy on Payhip](https://payhip.com/b/GEyeO) | USD |
| **itch.io** | Complete / Handbook | [View on itch.io](https://nickwangstudio.itch.io/ai-short-video-method-library) | USD |
| **面包多 (国内直达)** | 全量版 (¥49.9) | [国内微信/支付宝直达](https://mbd.pub/o/bread/mbd-YZaWlZtxaQ==) | CNY (¥) |
| **面包多 (国内直达)** | 手册版 (¥19.9) | [国内微信/支付宝直达](https://mbd.pub/o/bread/mbd-YZaWlZtxZw==) | CNY (¥) |
| **Official Store** | Showcase & Demos | [Visit Official Store](https://shop.nickwang.dpdns.org/) | Multi |

---

## 📄 License

The code samples in this repository are licensed under the [MIT License](LICENSE).  
Videos produced with this framework are 100% yours to monetize. Redistribution or resale of the bundled full library itself is prohibited.
