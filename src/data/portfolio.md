---
# ─────────────────────────────────────────────────────────────────────────
# PORTFOLIO CONTENT — edit the fields below to change the Portfolio section
# and the project detail HUDs. The layout is fixed; only this content changes.
# Order of `projects` here == order shown on the page.
# Put project images under  public/assets/portfolio/<slug>/  and reference them
# with an absolute path, e.g.  /assets/portfolio/<slug>/01.jpg
# ─────────────────────────────────────────────────────────────────────────

eyebrow: "Section 05 — Portfolio"
title: "Selected Work"
intro: "A selection of shipped work across consumer apps and platform tooling — from 1M-user products to the architecture and pipelines beneath them."

projects:
  - slug: "project-imamma"
    context: "employed"          # employed | freelance | indie
    platform: "iOS / KMP · SwiftUI"
    title: "Project: iMamma"
    date: "2020"
    summary: "Short description of the project and the role played."
    description: "A longer technical write-up shown in the detail HUD. Describe the problem, the architecture, the stack and what was shipped. Replace this with the real project narrative."
    specs:
      - label: "Platform"
        value: "Crossplatform iOS · Android"
      - label: "Stack"
        value: "Swift · SwiftUI · Core Data"
      - label: "Role"
        value: "Lead Engineer"
    images:
      - "/assets/hero.jpg"
      - "/assets/identity.jpg"
    links:
      - label: "App Store"
        href: "https://example.com"
      - label: "Case study"
        href: "https://example.com"

  - slug: "project-eolo"
    context: "employed"
    platform: "iOS · UIKit/SwiftUI"
    title: "Project: Eolo"
    date: "2023"
    summary: "Short description of the project and the role played."
    description: "A longer technical write-up shown in the detail HUD. Replace this with the real project narrative."
    specs:
      - label: "Platform"
        value: "Cross-platform"
      - label: "Stack"
        value: "Swift · SPM · XCFramework"
    images:
      - "/assets/unit-hud.jpg"
    links:
      - label: "Documentation"
        href: "https://example.com"

  - slug: "project-gromani"
    context: "freelance"
    platform: "iOS · UIKit"
    title: "Project: GRomani"
    date: "2023"
    summary: "Short description of the project and the role played."
    description: "A longer technical write-up shown in the detail HUD. Replace this with the real project narrative."
    specs:
      - label: "Platform"
        value: "iOS"
      - label: "Stack"
        value: "SwiftUI · RealityKit"
    images:
      - "/assets/identity.jpg"
    links: []

  - slug: "project-rosanero"
    context: "indie"
    platform: "macOS · Tooling"
    title: "Indie Project: Rosanero"
    date: "2026"
    summary: "Short description of the project and the role played."
    description: "A longer technical write-up shown in the detail HUD. Replace this with the real project narrative."
    specs:
      - label: "Platform"
        value: "macOS"
      - label: "Stack"
        value: "Swift · AppKit · CLI"
    images: []
    links:
      - label: "GitHub"
        href: "https://example.com"
  - slug: "project-vuforia"
    context: "freelance"
    experimental: true
    platform: "iPadOS"
    title: "Research Project: Vuforia SDK AR"
    date: "2017"
    summary: "Short description of the project and the role played."
    description: "A longer technical write-up shown in the detail HUD. Replace this with the real project narrative."
    specs:
      - label: "Platform"
        value: "iPadOS"
      - label: "Stack"
        value: "Swift · AppKit · CLI"
    images: []
    videos:
      # mp4 files under public/assets/portfolio/<slug>/ ; optional `poster` image
      - src: "/assets/portfolio/vuforiaSDK/2016-Augmented-Reality-Prototype-for-iOS-with-Vuforia-SDK.mp4"
        poster: "/assets/portfolio/vuforiaSDK/VuforiaSDKPoster.jpg"
    links:
      - label: "GitHub"
        href: "https://example.com"
  - slug: "project-vuforia2"
    context: "freelance"
    experimental: true
    platform: "iOS · iPadOS"
    title: "Research Project: Vuforia SDK AR"
    date: "2017"
    summary: "Short description of the project and the role played."
    description: "A longer technical write-up shown in the detail HUD. Replace this with the real project narrative."
    specs:
      - label: "Platform"
        value: "iPadOS"
      - label: "Stack"
        value: "Swift · AppKit · CLI"
    images: []
    videos:
      # mp4 files under public/assets/portfolio/<slug>/ ; optional `poster` image
      - src: "/assets/portfolio/vuforiaSDK/2016-Augmented-Reality-Prototype-for-iOS-with-Vuforia-SDK.mp4"
        poster: "/assets/portfolio/vuforiaSDK/VuforiaSDKPoster.jpg"
    links:
      - label: "GitHub"
        href: "https://example.com"
---

This file defines the Portfolio section content and each project's detail HUD.
Edit the frontmatter fields above. See the README ("Add a portfolio project").
