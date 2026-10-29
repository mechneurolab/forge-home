---
layout: home

hero:
  name: FORGE Suite
  text: From raw MRI to elastograms
  tagline: Open-source, GPU-accelerated software for MRI reconstruction and magnetic resonance elastography, from the Mechanical Neuroimaging Laboratory.
  actions:
    - theme: brand
      text: How it works
      link: '#how-it-works'
    - theme: alt
      text: GitHub
      link: https://github.com/mechneurolab

features:
  - title: FORGE
    details: Fast, Optimized Reconstruction via Gridding Engine. A C++ library and command-line tools for iterative MRI reconstruction on Apple Metal and NVIDIA CUDA GPUs.
    link: /forge/
    linkText: Open docs
    target: _self
  - title: FORGE Studio
    details: A desktop app for building, running and monitoring multi-stage MRI pipelines. Labs can package their own methods as forgepacks and share them through it.
    link: /studio/
    linkText: Open docs
    target: _self
  - title: Sentinel
    details: Magnetic resonance elastography inversion in Julia. It estimates tissue stiffness from MRI displacement fields.
    link: /sentinel/
    linkText: Open docs
    target: _self
---

## How the suite fits together {#how-it-works}

Each tool handles one step from raw scanner data to quantitative elastograms, and FORGE Studio runs them as one pipeline.

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

<div class="suite-studio"><strong>FORGE Studio</strong> builds, runs and monitors the whole pipeline on your desktop.</div>

- **FORGE** reconstructs images from raw k-space on Apple Metal or NVIDIA CUDA GPUs.
- **Sentinel** inverts the reconstructed displacement images into tissue stiffness maps.
- **FORGE Studio** chains these steps with your own MATLAB, Python or Julia code, shows progress and convergence while a job runs, and opens the results in a viewer. Stages such as motion correction can be added and distributed as [forgepacks](https://forge-mri.dev/studio/catalog/creating-packs).
