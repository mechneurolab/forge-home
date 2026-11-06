---
layout: home

hero:
  name: FORGE Suite
  text: From raw MRI to elastograms
  tagline: Open-source software for MRI reconstruction and magnetic resonance elastography, from the Mechanical Neuroimaging Laboratory.
  actions:
    - theme: brand
      text: Find the docs
      link: '#docs'
    - theme: alt
      text: How it fits together
      link: '#how-it-works'
    - theme: alt
      text: GitHub
      link: https://github.com/mechneurolab

features:
  - title: FORGE
    details: Fast, Optimized Reconstruction via Gridding Engine. A C++ library and command-line programs for iterative MRI reconstruction (SENSE, pcSENSE, field correction, low-rank) on the CPU, Apple Metal or NVIDIA CUDA.
    link: /forge/
    linkText: FORGE docs
    target: _self
  - title: FORGE Studio
    details: A desktop app for macOS and Linux that builds, runs and monitors multi-stage MRI pipelines. Labs can package their own methods as forgepacks and share them through it.
    link: /studio/
    linkText: FORGE Studio docs
    target: _self
  - title: Sentinel
    details: Magnetic resonance elastography inversion in Julia. It estimates tissue stiffness from MRI displacement fields with a finite element model, on the CPU, NVIDIA CUDA or Apple Metal.
    link: /sentinel/
    linkText: Sentinel docs
    target: _self
---

## How the suite fits together {#how-it-works}

An MRE exam produces raw k-space data. Getting from there to a stiffness map takes two
computational steps, and each project in the suite owns one of them.

<div class="suite-flow">
  <div class="stage">Raw MRI<span>k-space</span></div>
  <div class="arrow">→</div>
  <div class="tool">FORGE<span>reconstruction</span></div>
  <div class="arrow">→</div>
  <div class="stage">Images<span>magnitude and phase</span></div>
  <div class="arrow">→</div>
  <div class="tool">Sentinel<span>inversion</span></div>
  <div class="arrow">→</div>
  <div class="stage">Elastograms<span>stiffness maps</span></div>
</div>

<div class="suite-studio"><strong>FORGE Studio</strong> runs both steps, and anything in between, as one pipeline.</div>

- **FORGE** reconstructs images from raw k-space. It reads ISMRMRD data and handles
  non-Cartesian trajectories, multi-coil SENSE, shot-to-shot phase correction and
  off-resonance correction.
- **Sentinel** turns the reconstructed displacement images into maps of tissue stiffness
  by fitting a finite element model of the tissue to the measured waves.
- **FORGE Studio** chains these steps with your own MATLAB, Python or Julia code. It shows
  progress and convergence while a job runs and opens the results in a viewer. Stages such
  as unwrapping or brain masking can be added and shared as
  [forgepacks](/studio/explanation/forgepacks){target="_self"}.

You can use FORGE and Sentinel on their own, from the command line or from your own code.
FORGE Studio is the way to run the whole chain without writing glue scripts.

<figure class="suite-demo">
  <img src="/forgeview-demo.gif" alt="forgeSense reconstructing a synthetic radial scan while the forgeview terminal monitor shows progress bars, convergence sparklines, the log and a live image preview" width="904" height="684" loading="lazy">
  <figcaption>FORGE from the command line: <code>forgeSense</code> reconstructing a synthetic 8-coil radial scan, watched with its <a href="/forge/how-to/monitor-a-reconstruction/" target="_self">forgeview</a> terminal monitor.</figcaption>
</figure>

## Find the right docs {#docs}

Each project's documentation is split into four parts, following the
[Diátaxis](https://diataxis.fr/) framework. Pick the part that matches what you are
trying to do.

<div class="docs-grid">
<table>
  <thead>
    <tr>
      <th>You want to</th>
      <th>FORGE</th>
      <th>FORGE Studio</th>
      <th>Sentinel</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Tutorials</strong><br>learn by working through an example</td>
      <td><a href="/forge/tutorials/" target="_self">FORGE tutorials</a></td>
      <td><a href="/studio/tutorials/" target="_self">Studio tutorials</a></td>
      <td><a href="/sentinel/tutorials/" target="_self">Sentinel tutorials</a></td>
    </tr>
    <tr>
      <td><strong>How-to guides</strong><br>get a specific job done</td>
      <td><a href="/forge/how-to/" target="_self">FORGE how-to guides</a></td>
      <td><a href="/studio/how-to/" target="_self">Studio how-to guides</a></td>
      <td><a href="/sentinel/how-to/" target="_self">Sentinel how-to guides</a></td>
    </tr>
    <tr>
      <td><strong>Reference</strong><br>look up options, formats and APIs</td>
      <td><a href="/forge/reference/" target="_self">FORGE reference</a></td>
      <td><a href="/studio/reference/" target="_self">Studio reference</a></td>
      <td><a href="/sentinel/reference/" target="_self">Sentinel reference</a></td>
    </tr>
    <tr>
      <td><strong>Explanation</strong><br>understand the methods and design</td>
      <td><a href="/forge/explanation/" target="_self">FORGE explanation</a></td>
      <td><a href="/studio/explanation/" target="_self">Studio explanation</a></td>
      <td><a href="/sentinel/explanation/" target="_self">Sentinel explanation</a></td>
    </tr>
  </tbody>
</table>
</div>

### Where to start

- **You have MRE data and want stiffness maps.** [Install FORGE Studio](/studio/how-to/install){target="_self"}, then run
  [your first reconstruction](/studio/tutorials/first-reconstruction){target="_self"}.
- **You develop reconstruction methods.** Start with the FORGE tutorials, then the FORGE
  reference for the operators and command-line programs.
- **You work on MRE inversion.** Start with the Sentinel tutorials and the Sentinel
  explanation of the inverse problem.
- **You want to share your lab's method with other Studio users.** Build
  [your first forgepack](/studio/tutorials/first-pack){target="_self"}.
