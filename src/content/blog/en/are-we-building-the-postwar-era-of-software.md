---
title: Are We Building the Postwar Era of Software?
excerpt: AI is breaking down the barriers to software development, but it also risks turning creativity into mass production. Much like postwar architecture, building faster doesn't necessarily mean building better. What if the real AI revolution isn't about producing more, but about giving us the freedom to imagine something different?
publishDate: 2026-10-15
tags:
  - ai
  - llm
  - artificial-intelligence
  - ai-reasoning
image: /assets/blog/are-we-building-the-postwar-era-of-software/556e1ea8d92c.jpg
lang: en
notionId: 3faa9c08-e476-8007-9f62-d660075a9f85
---

# Are We Building the Postwar Era of Software?


_AI has made software creation more accessible than ever. But if everyone can build almost anything, what will stop our applications from becoming the anonymous buildings of a new digital suburb?_


A few days ago, I came across a talk by Katie Dill, Head of Design at Stripe, that made me think about a parallel I had never really considered before.


In the years following World War II, the United States experienced an unprecedented construction boom. There was an enormous demand for new buildings, and they needed to be built quickly. New materials, construction techniques, and industrialized processes made it possible to build at a scale and speed that would have been difficult to imagine just a few decades earlier. Modernism, with its clean lines, simple geometry, and rejection of unnecessary ornamentation, provided an architectural language particularly suited to this new industrial reality.




![](/assets/blog/are-we-building-the-postwar-era-of-software/954507d28df5.png)


But as Dill points out, something happened along the way. People gradually started reproducing the forms of modernist architecture while forgetting the ideas that had inspired them. What had begun as an architectural movement driven by deliberate design principles eventually became, in many of its later applications, something closer to an industrial recipe.


Functional, affordable, easily reproducible buildings, but often anonymous, disconnected from their surroundings, and lacking any real identity. Dill calls them _zombie buildings_, and this is where the analogy becomes particularly interesting, because **we may be witnessing something remarkably similar in software development today.**


## The New Construction Boom Is Digital


Until very recently, building a complex software product required a combination of specialized skills, a structured team, and, above all, time. Today, a single developer working alongside a handful of AI agents can tackle projects that would have required an entire team just a few years ago, and this is an extraordinary transformation.


I don't share the skepticism of those who see the democratization of software development as inherently threatening. Lowering the barriers to entry means giving more people the opportunity to turn ideas into working products, while also making projects possible that might never have existed because they were simply too expensive to pursue.


The problem isn't that building software has become too easy, but rather **what we choose to build when building it is no longer the biggest obstacle.**


Open almost any AI coding tool and ask it to generate a dashboard, a SaaS application, or a landing page. Within minutes, you'll have something that looks reasonably professional, with clean layouts, modern typography, balanced colors, consistent components, and pleasant animations. Yet, after seeing enough of these applications, you start recognizing the same patterns everywhere: the same cards, dashboards, gradients, and interactions.


It's like walking through a neighborhood where every building was designed by the same architect, for people they've never actually met, except this time, the architect is a statistical model.


## The Problem Isn't Mediocrity. It's How Convincing Mediocrity Has Become.


There's something particularly deceptive about generative tools: they don't necessarily produce bad results, and quite the opposite, they often produce surprisingly good ones. That's precisely the problem.


A mediocre interface used to be relatively easy to recognize because you could immediately tell that something was missing, whether it was poor alignment, inconsistent visual elements, awkward interactions, or unfinished details. Today, you can generate something in minutes that _looks_ like the result of weeks of thoughtful design work, and that surface-level quality can create a false sense of confidence: it works, it looks good, so let's move on to the next feature.


Dill uses a rather amusing analogy involving a frozen burrito that becomes lunch in ninety seconds. It's not particularly good, but because it solves the problem so quickly, we're willing to overlook quite a few shortcomings. I think we're developing a similar relationship with AI-generated software, and I'd take that observation one step further: **speed hasn't just reduced the cost of production, it's changing our perception of how much attention a result deserves.**




![](/assets/blog/are-we-building-the-postwar-era-of-software/e970c1e572c4.png)


When building a screen took several days, spending a few hours discussing its behavior felt perfectly reasonable, but when that same screen can be generated in thirty seconds, spending two hours thinking about it suddenly feels almost wasteful. Yet the value of that thinking hasn't decreased; it has simply become less visible compared to the speed of the machine.


## We've Removed Some of the Hard Work. Not Necessarily the Right Part.


I think there's an important distinction to make here, because software development involves at least two fundamentally different kinds of difficulty.


The first is execution: writing code, implementing components, integrating services, building infrastructure, and solving technical problems. The second is design and product thinking: understanding what's worth building, why something should behave a certain way, what kind of experience we want to create, and which trade-offs we're willing to make.


LLMs are dramatically reducing the cost of the first, but it's far less obvious that they're solving the second. Of course, AI can help us reason through problems, suggest alternatives, and challenge our assumptions, but doing that effectively still requires someone who knows which questions to ask and, more importantly, can recognize when an answer isn't good enough.


This leads to an interesting consequence. For a long time, the ability to actually build a product represented a significant part of a software developer's competitive advantage, but that advantage is now gradually shrinking. If two people have access to the same models and the same tools, the difference between them won't necessarily come down to who can produce more code; it may come down to who has a more interesting vision of what that code should become.


Naturally, a good idea isn't enough on its own, because technical competence, execution skills, and domain knowledge still matter enormously. What is changing is the balance between these abilities.


## The New Bottleneck Is Knowing What to Choose


One observation from Dill's talk particularly stood out to me: in the past, limited resources forced teams to be selective, so if a team had twenty ideas but could only afford to develop one, people had to discuss them, compare them, and eventually discard nineteen.


Today, we can potentially build twenty prototypes in the same week, which is tremendous progress because we can test ideas that previously would have remained nothing more than hypotheses. But we've also moved the moment when selection happens: we used to decide what to build, whereas now we can build everything and decide afterward what deserves to exist.


The problem is that discarding something we've already built is psychologically much harder, and that remains true even when AI did most of the work. There's always the temptation to keep it, adjust it, or squeeze it somewhere into the product because, after all, it works and it's already there.


In this environment, a skill we may have underestimated in software development becomes increasingly important: **editorial judgment**.


Someone needs to evaluate not just whether individual features work, but whether they make sense as part of a coherent whole. Does every screen genuinely contribute to the experience? Is an interaction necessary, or does it exist simply because it was easy to implement? Does a feature solve a real problem, or is it just another technical possibility that suddenly became available?


**When we can build almost anything, knowing what to leave out becomes a design skill.**


## A Design System Is No Longer Enough


Dill also shares an interesting experience from Stripe, where the team initially tried making its design guidelines available to AI agents through an MCP server, only to discover that the results weren't particularly satisfying. Simply giving models access to documentation didn't guarantee that they would make consistent design decisions.


Stripe eventually developed a more structured approach using a CLI integrated with its design system, providing agents with not just components and rules, but also templates, workflows, and guidance on how the product should behave. The goal was no longer merely visual consistency, but something more ambitious: communicating **design intent**.


I find this particularly significant, especially for developers who are already building software with AI agents. For years, we've designed systems primarily for the humans who would use them, but now we're beginning to design systems that must also guide decisions made autonomously by machines.


However, I see a potential paradox here: the more prescriptive our systems become in pursuit of consistency, the more we risk limiting the very diversity we want to preserve.


The answer probably isn't to encode every possible design decision, but to distinguish between what needs to remain consistent and what should remain open to experimentation. A good system should prevent repetitive mistakes, not unexpected good ideas, because **we should automate consistency without automating creativity.**


## What If We're Using AI to Build the Same Things We Built Before?


This is probably the question that interests me most, because much of today's conversation around AI-assisted software development revolves around productivity: how much code can we generate, how many tickets can we close, and how quickly can we ship the next release?


These are legitimate questions, but they may be distracting us from a much more interesting opportunity.


If we now have tools that allow us to implement complex interactions, explore dozens of alternatives, and experiment with solutions we previously would have rejected because of their cost, why should we limit ourselves to reproducing the same products?


Why must a business application look like every other business application? Why do we keep organizing information according to conventions established when devices and development tools had completely different limitations? And, above all, why do we consider it innovation when we've merely built an interface that's been around for fifteen years, only faster?


To be clear, I'm not suggesting that every product should reinvent its interface, because conventions exist for a reason: they create familiarity, reduce cognitive load, and make applications easier to understand and use.


Innovation doesn't mean making everything different just for the sake of being different. It means finally having the freedom to ask whether a better solution might exist, without immediately dismissing it because experimenting would be too expensive.


This is where I believe AI could enable its most interesting transformation, **not in the amount of software we'll be able to build, but in the variety of software we'll finally be able to imagine and explore.**


## The Greatest Risk Is Losing Our Curiosity


The image of postwar buildings is compelling, but I don't think the underlying problem was simply that people started building faster or adopted a reproducible architectural style. It would also be unfair to blame modernism itself for the anonymity of so much architecture that followed.


The problem emerges when a design language becomes disconnected from the ideas that originally shaped it, turning into a formula applied indiscriminately, and that's exactly what risks happening with AI.


Not because models are incapable of suggesting original alternatives, but because predictable results are often the easiest ones for us to accept. Ask for a conventional product, and you'll probably get a pretty good conventional product, but because building it costs so little, we might never feel compelled to ask whether we could have done something different.


This creates a curious contradiction: tools that dramatically expand our creative possibilities end up being used primarily to reproduce what we already know.



That's not an inevitable limitation of the technology, but a limitation of the ambitions we bring to it.


There's also another important difference between the postwar construction boom and today's software boom: a poorly designed building can remain standing for decades, whereas software, at least in theory, can be continuously modified.


That should give us even greater freedom to experiment, correct mistakes, and rethink what we've built, but that freedom only matters if we're willing to exercise it. Otherwise, we'll simply produce anonymous applications at an unprecedented rate, accumulating complexity and technical debt that someone will eventually have to deal with.


## Building Has Become Easier. Having Something to Say Hasn't.


I don't believe artificial intelligence will make the work of people who design and develop software less important, but I do believe it will force us to reconsider where the value of that work actually lies.


The ability to write code remains important, but it will increasingly become just one part of what it takes to create a good product. We'll need taste, contextual understanding, critical thinking, curiosity, and, above all, intentionality, along with the confidence to reject a technically flawless result when it isn't the right one.


Perhaps we should start thinking about the time AI saves us not merely as an opportunity to produce more, but as a resource we can reinvest in the quality of what we produce.


**If a machine allows us to build in one day what previously took a month, we don't have to fill the other twenty-nine days with twenty-nine more things. We could spend some of that time making the first thing genuinely better.**


Toward the end of her talk, Dill contrasts the anonymity of certain modern buildings with the richness of Gothic architecture, where details carry something of the craftsmanship and intentions of the people who created them.


I don't think software needs to become Gothic, and we certainly don't need interfaces overloaded with decorative elements just to prove that someone put effort into designing them. But I do like the idea that a product can retain something of the personality, sensitivity, and intentions of the people who imagined it, even when much of its code was written by a machine.


Because, in the end, nobody will be particularly impressed that we managed to generate an application in thirty minutes. What's far more interesting is discovering what we've managed to create that, without these tools, we might never even have attempted to imagine.


And it would be a shame to waste such an extraordinary opportunity just to build another identical building in an endless digital suburb.


---


_This article was inspired by Katie Dill's talk, “How to Scale Intent, Quality, and Artistry with AI,” at the Lenny & Friends Summit 2026._


_The original talk is available on_ [_YouTube_](https://www.youtube.com/watch?v=GLvFTMtw4Jk)_._
