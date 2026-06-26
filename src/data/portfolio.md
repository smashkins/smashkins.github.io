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
    date: "2020 – Present"
    summary: "Built the SwiftUI presentation layer and MVI bridge for iMamma, one of Italy's leading maternity apps (1M+ users, 4.7★), on a Kotlin Multiplatform architecture."
    description: |
      iMamma is one of Italy's leading maternity and parenting apps, with over 1M users and a 4.7-star App Store rating. The product is built on a Kotlin Multiplatform architecture: domain logic, networking, persistence, sync, and MVI state machines live in shared Kotlin (compiled to an XCFramework and owned by the Android team), while the iOS app is a thin native layer on top.

      My role was on the iOS side. I built the SwiftUI presentation layer and the bridge to the shared MVI components, observing Kotlin-exposed state Flows through SwiftUI and dispatching user actions back as Intents.
      
      I worked on a generic UIHostingController wrapper and a routing layer mapping shared routes to SwiftUI screens, and delivered features across the app's trackers (sleep, feeding, nutrition) and Tools section. I made the project fully reproducible via XcodeGen and a Makefile, and integrated the AppsFlyer SDK for attribution and deep linking, including ATT consent handling.
    specs:
      - label: "Platform"
        value: "Crossplatform iOS · Android"
      - label: "Stack"
        value: "Swift · SwiftUI · Combine · MVI · Kotlin Multiplatform (XCFramework integration) · AppsFlyer · XcodeGen."
      - label: "Role"
        value: "Senior iOS Engineer"
    images:
      - "/assets/portfolio/imamma/imamma1.jpg"
      - "/assets/portfolio/imamma/imamma2.jpg"
      - "/assets/portfolio/imamma/imamma3.jpg"
    links:
      - label: "App Store"
        href: "https://apps.apple.com/it/app/imamma-gravidanza-e-beb%C3%A8/id482550469"

  - slug: "project-eolo"
    context: "employed"
    platform: "iOS · UIKit/SwiftUI"
    title: "Project: Eolo"
    date: "2023 – Present"
    summary: "Official iOS app for an Italian sat internet provider, a Swift/SwiftUI–UIKit hybrid built with Tuist and CocoaPods that lets customers manage their connection, run self-diagnostics, handle payments/recharges, and access their reserved area. I worked as lead iOS developer building features specified by the customer."
    description: |
      Native iOS application for Eolo, an Italian fixed-wireless broadband (FWA) provider, serving as the customer-facing companion app for account management, connectivity diagnostics, and payments. The project originated from a previous development effort at another consulting firm. The client wanted to retain the existing codebase and integrate and add new features to it.

      **Tech stack & architecture:**
      - Swift 5 with a hybrid SwiftUI + UIKit codebase, using a StackableViewBaseViewModel component architecture for reusable, composable screens.
      - Tuist for project generation across 7 build schemes (Dev / QA / Production / Store / Mock / Preview), each with isolated bundle IDs, entitlements, and Firebase configs.
      - CocoaPods + SPM for dependencies; Natrium for per-scheme environment configuration (OAuth credentials, endpoints, feature flags).
      - Protocol-based dependency injection with abstraction wrappers around third-party SDKs.

      **Key contributions:**
      - I've modernized some legacy code introducing SwiftUI, Tuist for project generation and SPM.
      - Recharge flow for QuandoVuoi & QuandoVuoiMax contracts: developed the dedicated recharge feature module for prepaid "QuandoVuoi" and "QuandoVuoiMax" plans, handling ontract-specific recharge endpoints and the full UI flow from plan selection to payment confirmation.
      - Connectivity self-diagnosis (Autodiagnosi): built the end-to-end flow that runs a remote connectivity check on the user's line, triggered from in-app navigation, push notifications, pull notifications, and universal/deep links.
      - Payments (Nexi S2S): integrated the Nexi XPay server-to-server recharge flow (wireless & QuandoVuoi recharges), including a two-stage create → SDK-form → status-polling pipeline, and resolved an Alamofire serialization edge case where HTTP 201 with an empty body failed parsing.
      - Consent & analytics (Google Consent Mode): shipped the GCM bridge connecting OneTrust consent state to Firebase/GA4, mapping consent categories to analytics/ad storage signals.

      **Build & release engineering:**
      - Firebase distribution via Fastlane lanes for QA and Production, with Crashlytics dSYM upload automation.
      - Git workflow managed through BuddyFlow, a custom Ruby CLI that I developed to enforcing branch naming, merge strategies, and Firebase test-area automation.
    specs:
      - label: "Platform"
        value: "Cross-platform"
      - label: "Stack"
        value: "Swift · SPM · XCFramework"
    images:
      - "/assets/portfolio/eolo/eolo1.jpg"
      - "/assets/portfolio/eolo/eolo2.jpg"
    links:
      - label: "App Store"
        href: "https://apps.apple.com/it/app/eolo-app/id1616170549"
  - slug: "project-rosanero"
    context: "indie"
    platform: "macOS · Tooling"
    title: "[POC] Indie: Rosanero"
    date: "2026 – Present"
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
  - slug: "project-snapfood"
    context: "freelance"
    platform: "iOS · UIKit"
    title: "Project: SnapFood"
    date: "2018"
    summary: "A food guide based on the community’s experience, that focuses on dishes and not on restaurants. Available on iOS and Android, SnapFood does not just tell you where to eat, but where you can eat the best dish you’re looking for."
    description: |
      A food guide based on the community’s experience, that focuses on dishes and not on restaurants. Available on iOS and Android, SnapFood does not just tell you where to eat, but where you can eat the best dish you’re looking for.

      **Tech stack:**
      - Debugging with Crashlytics
      - Autolayout
      - Realm DB
      - Share Extensiond
      - Cocoapods
      - Alamofire
      - Moya
    specs:
      - label: "Platform"
        value: "iOS"
      - label: "Stack"
        value: "SwiftUI · RealmDB · Share extensions · Cocoapods · Alamofire · Moya"
    images: []
    videos:
      # mp4 files under public/assets/portfolio/<slug>/ ; optional `poster` image
      - src: "/assets/portfolio/glooxy/snapfood.mp4"
    links: []
  - slug: "project-vuforia"
    context: "freelance"
    experimental: true
    platform: "iPadOS"
    title: "Research Project: Vuforia SDK AR"
    date: "2015"
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
      - src: "/assets/portfolio/vuforiaSDK/2016-Augmented-Reality-Prototype-Helicopter-for-iOS-in-Vuforia-SDK.mp4"
    links:
      - label: "GitHub"
        href: "https://example.com"
  - slug: "project-vuforia2"
    context: "freelance"
    experimental: true
    platform: "iOS · iPadOS"
    title: "Research Projects: Vuforia SDK AR"
    date: "2016"
    summary: "Short description of the project and the role played."
    description: |
      A longer technical write-up shown in the detail HUD. Replace this with the real project narrative.
      Augmented Reality Prototype for iOS. Overlay on photographic marker
      Augmented Reality Prototype Helicopter for iOS developed with Unity and Xcode
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
  - slug: "project-gromani"
    context: "freelance"
    platform: "iOS · UIKit"
    title: "Project: GRomani"
    date: "2018"
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
---

This file defines the Portfolio section content and each project's detail HUD.
Edit the frontmatter fields above. See the README ("Add a portfolio project").
