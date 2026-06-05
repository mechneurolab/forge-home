---
layout: home

hero:
  name: FORGE Suite
  text: From raw MRI to elastograms
  tagline: An open, GPU-accelerated suite for MRI reconstruction and magnetic resonance elastography — from the Mechanical Neuroimaging Laboratory.
  actions:
    - theme: brand
      text: How it works
      link: '#how-it-works'
    - theme: alt
      text: GitHub
      link: https://github.com/mechneurolab

features:
  - title: FORGE
    details: Fast, Optimized Reconstruction via Gridding Engine — GPU-accelerated iterative MRI recon (Apple Metal & NVIDIA CUDA).
    link: /forge/
    linkText: Open docs
  - title: FORGE Studio
    details: Desktop app for building, running, and monitoring multi-stage MRI reconstruction pipelines.
    link: /studio/
    linkText: Open docs
  - title: Sentinel
    details: Magnetic resonance elastography in Julia — recovers tissue stiffness from MRI displacement fields.
    link: /sentinel/
    linkText: Open docs
---

## How the suite fits together {#how-it-works}

FORGE Suite takes you from raw scanner data to quantitative **elastograms** in a single pipeline — each tool owns one stage, and **FORGE Studio** ties them together.

<div class="suite-flow">
  <div class="stage">Raw MRI<span>k-space</span></div>
  <div class="arrow">→</div>
  <div class="tool">FORGE<span>reconstruction</span></div>
  <div class="arrow">→</div>
  <div class="stage">Images<span>magnitude / phase</span></div>
  <div class="arrow">→</div>
  <div class="tool">Sentinel<span>inversion</span></div>
  <div class="arrow">→</div>
  <div class="stage">Elastograms<span>stiffness maps</span></div>
</div>

<div class="suite-studio">🖥&#xfe0f; &nbsp;<strong>FORGE Studio</strong> — the desktop app that builds, runs, and monitors the whole pipeline</div>

- **FORGE** turns raw k-space into images — GPU-accelerated on Apple Metal or NVIDIA CUDA.
- **Sentinel** inverts those images into tissue-stiffness maps (MR elastography), in Julia.
- **FORGE Studio** orchestrates both: a visual workflow editor with live monitoring, so you can run the end-to-end pipeline without touching the command line.
