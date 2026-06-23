---
# ─────────────────────────────────────────────────────────────────────────
# RÉSUMÉ CONTENT — edit the fields below to change the "Professional
# Experience" panel (Expertise section). The layout is fixed; only the
# content here changes. Add/remove items in the lists freely.
# ─────────────────────────────────────────────────────────────────────────

name: "MONOIDX UNIT"
role: "controlled by Vincenzo S."
summary: "Building systems. Shaping platforms. A decade across Apple's ecosystem — from product apps to platform architecture."

# Each job can use either a single `note:` string, or a `notes:` list
# (rendered as a bullet list). If both are present, `notes` wins.
jobs:
  - role: "Senior / Lead iOS Engineer"
    period: "2023 — Present"
    org: "Employed · MASHFROG"
    notes:
      - "Lead iOS engineer on Eolo (consumer ISP / connectivity); contributor on Italgas (field operations app for technicians and meter reading)."
      - "Reduced the number of warnings and deprecated code in Xcode from over 100 to zero in Eolo App"
      - "End-to-end integration of GA4 and OneTrust on iOS: implemented granular consent logic that ensured 100% GDPR compliance while maintaining accurate analytical tracking coverage for opt-in users."
      - "Set up CI/CD pipelines using Fastlane and GitLab CI, cutting release time from ~3 hours to under 30 minutes"
      - "Implemented 10+ features and sections. Payment integration with XPAY SDK, PayPal SDK and Apple Pay"
      - "Integrated Push Notification System and Universal Link navigation"
      - "More technical details are [here](project:project-eolo)"
  - role: "Senior iOS Engineer"
    period: "2020 — 2023"
    org: "Employed · ANGELINI CONSUMER / iMamma App"
    notes:
      - "Senior iOS engineer in a small iOS team on iMamma post-acquisition, maintaining the established 1M+ user base and 4.7★ App Store rating throughout 3 years of continuous evolution."
      - "Owned the iOS presentation layer (MVI) within a Kotlin Multiplatform architecture, integrating with the shared cross-platform business logic."
      - "Built and maintained core product features across multiple releases over 3 years, including the baby sleep, feeding and nutrition trackers and the full Tools section."
      - "Integrated Firebase Analytics, Crashlytics, and Remote Config; raised crash-free user rate from ~97% to 99.5%."
      - "More technical details are [here](project:project-imamma)"
  - role: "Senior iOS Engineer"
    period: "2020"
    org: "Employed · OB Science / iMamma"
    note: "Senior iOS engineer on iMamma (1M+ downloads at the time), leading feature expansion and codebase improvements on the existing maternity app. Continued on the same product after Angelini Consumer acquired iMamma and its team in late 2020."
  - role: "Freelance iOS Engineer"
    period: "2016 - 2024"
    org: "VIOinteractive"
    notes: 
       - "Shipped Gruppo Romani App (Serenissima, Cir, Cercom, Cerasarda, Isla): MVVM, OneSignal push, Realm DB, Alamofire, universal layout."
       - "Built prototypes: PBR rendering with SceneKit + Metal (WWDC16); IBM Watson Visual Recognition ML pipeline."
       - "Independently scoped and delivered iOS apps for multiple clients."

meta:
  # Any row can carry an optional `note:` — a short line rendered in small text,
  # left-aligned below the value.
  - label: "Community & Leadrship"
    value: "Founder — Swift Italy User Group"
    note: "Founded and ran what was at the time Italy's largest Swift developer community (600+ members across Facebook & YouTube). Organized talks, meetups, and content for the Italian iOS scene."
  - label: "Author"
    value: "Articles"
    note: "Articles on iOS development, Tech and AI (published in Italian and English)."
  - label: "Education"
    value: "B.Sc. Computer Science"

# Core skills, grouped by category. Each group renders as a labelled row of
# chips. Add/remove groups and items freely.
skills:
  - category: "Languages"
    items: ["Swift", "Objective-C", "HTML", "CSS", "JavaScript", "SQL"]
  - category: "iOS Frameworks"
    items: ["SwiftUI", "UIKit", "Combine", "Swift Concurrency", "Core Data", "Swift Data", "Realm", "Cloud Kit", "File Manager", "Metal", "Core Graphics", "Core Animation", "Swift Test", "Apple Intelligence Framework", "Core AI Framework", "SPM", "Cocoapods/Carthage"]
  - category: "Architecture"
    items: ["MVC", "MVVM", "MVI", "Clean Architecture", "Kotlin Multiplatform", "Dependency Injection Patterns"]
  - category: "Tooling & CI/CD"
    items: ["Fastlane", "GitLab CI", "Firebase", "Git", "Github Actions", "Gitlab Actions", "Xcode Cloud"]

# Meta rows rendered AFTER the Core Skills row.
metaAfter:
  - label: "Status"
    value: "Open to selected work"
    led: true

# Links to the (future) Portfolio section. Add as many as you like.
# When the Portfolio section exists, give it id="portfolio" and these just work.
portfolio:
  - label: "Selected work"
    href: "#portfolio"
  - label: "Case studies"
    href: "#portfolio"
---

This file defines the résumé content shown in the Expertise → Professional
Experience panel. Edit the frontmatter fields above.
