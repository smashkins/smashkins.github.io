---
title: Why a cow falling in a dream made me rethink artificial intelligence
excerpt: "I dreamed of a cow falling off a mountain. The scene was entirely made up, yet it held together. That led me to an uncomfortable question about AI: is predicting the next word really the opposite of understanding? Maybe not, and maybe the stochastic parrot is a fair critique but not a sufficient one."
publishDate: 2026-06-15
tags:
  - artificial-intelligence
  - llm
  - ai-reasoning
image: /assets/blog/cow-parrot/97fc9893c059.png
lang: en
notionId: 380a9c08-e476-8099-9ab8-c2f6733e9dca
---

A few nights ago I had a stupid dream. A cow was trying to climb a mountain, lost its footing at some point, and tumbled down the slope. Nothing memorable, except for one detail: the fall was recognizable. The weight of the animal, the way the body slid and bounced, the trajectory. Everything seemed to obey a logic I hadn't chosen.


The thing is, I have never seen a cow climb a mountain, let alone fall off a ridge. That scene didn't exist anywhere in my memory. And yet my brain put it together in detail, at night, without asking for permission.


That was the start of a question that stuck with me for days, and that at some point stopped being about cows and started being about artificial intelligence.


## The brain is not a camera


One thing is worth clearing up right away, because it is easy to take it the wrong way. I am not saying that dreams respect physics. Dreams break physics constantly: you fly, you fall without ever hitting the ground, rooms change shape as you walk through them. Anyone who has dreamed knows this.


The interesting part is not physical accuracy. It is something else: a scene I have never witnessed still comes out coherent. The brain takes the concept of a cow, the concept of a mountain and the concept of a fall, combines them, and produces a simulation that holds together, at least for the few seconds the dream lasts.


This happens because when we observe the world we do not record images the way a camera would. We are constantly building an internal model of reality. Over a lifetime we watch thousands of objects fall, people lose their balance, liquids flow, bodies collide. Out of all that experience a kind of intuitive physics emerges, one we use without noticing. We don't know Newton's equations, but we know a ball thrown into the air will come back down, and that something losing its balance tends to fall.


In a dream the brain keeps running that model. It does not retrieve a stored video. It generates. The falling cow is a new combination of old pieces, and the internal model does the rest.

> In a sense, a dream is a simulation.

## The mistakes AIs make and we don't


This led me straight to generative AI, because this is exactly where the difference shows.


For years the fastest way to unmask a generated image was to look at the hands. Six fingers, fingers melting into each other, rings sprouting out of nowhere. That trick works far less well today: image models have improved to the point where a single still frame almost always holds up.


The weak spot has moved to motion. Watch a generated video closely and the real problems begin: objects that vanish behind something and come back changed, liquids that behave wrong, a foot that lands on a surface and sinks a centimeter into it, two bodies touching without the contact actually meaning anything. Static physics is solved. Dynamic physics, the kind that requires following a system through time, is not.


And the reason, I think, is exactly the same one that makes the cow believable.


These models learn from images and videos. They see billions of them, but they don't live in the world. They have never picked up an object, never lost their balance, never experienced weight or inertia.

> They can learn perfectly well what a fall looks like. What it means to fall is another matter.

It is a subtle distinction, and it is the heart of the whole thing.


## You learn physics by getting it wrong


A child does not learn physics from a textbook. They learn it by causing damage. They drop things, bump into furniture, run, trip, get back up. Every mistake updates the internal model of the world.


This is why a number of researchers argue that to reach a deeper level of understanding, future systems will need to do more than look at data. They will need to interact with an environment, whether physical or simulated. In other words, they will need a form of experience. This is roughly the line taken by people like Yann LeCun, who has worked on world models for years and keeps repeating that language alone is not enough to build a model of the world as solid as ours.


I'll set this idea aside for a moment, because it comes back in handy from the other side of the argument.


## And here comes the parrot


At this point the familiar objection kicks in. A language model, after all, does one thing: it takes a text and predicts the next word. From there comes the stochastic parrot accusation, put forward in 2021 by Emily Bender and colleagues: if a system merely makes statistical predictions about the form of language, it is not reasoning, it is just recombining what it has already seen.


As a critique of certain inflated narratives about AI, the argument is healthy and worth taking seriously. The problem is that, if you look closely, it cuts deeper than you might want it to.


Because the brain, too, seems to run largely on prediction. The theories of predictive processing, from Andy Clark to Karl Friston, describe the brain as a machine that is constantly trying to anticipate: what it will see an instant from now, where an object will be, what the person in front of you will do, what the consequence of a gesture will be. When I dream the falling cow, the brain is predicting how the scene unfolds frame by frame. It does not solve the equations of dynamics. It predicts. And yet we call that mental simulation, or imagination.


So the question becomes uncomfortable. If the brain builds models of the world through prediction, why shouldn't an artificial system that builds models through prediction be able to develop some form of reasoning?


Let me offer an analogy, with due caution. A plane flies thanks to a turbine. Saying a plane does not fly, a turbine just spins would be technically true and conceptually useless. The turbine is the local mechanism, flight is the behavior that emerges. In the same way, a model predicts the next word is the local mechanism. Reasoning, if it is there, would be the emergent behavior that arises from billions of predictions integrated into a coherent structure.


The analogy holds against the slogan, I won't deny it. But it proves only one thing: that the mechanism is not the same as the behavior. It does not prove the behavior is actually there. That is a separate question, and on that one it is better to be honest.


## Where the objection is right


Behind the slogan there is a serious argument, and it is the grounding problem. Bender illustrated it with the example of a system trained to observe only the form of language, with no link to what the words refer to. However well it learns to continue sentences, it would never have a way to connect them to the world. It would imitate understanding without having it.


This critique is true, and it is precisely why the physical sense of a purely linguistic model stays much weaker than ours. The brain builds its model of the world through sight, hearing, touch, movement, the experience of the body. A language model builds its mostly out of language. They are two different foundations, and it shows.


But there is a detail that complicates the picture. To predict language well you have to model, at least in part, what language describes: people, intentions, causal relations, a bit of logic, a bit of physics, social dynamics. Not because anyone taught it to you explicitly, but because text is full of traces of all of this.

> Learning to predict the future of something, in practice, forces you to build a model of that something.

And here we are no longer in the realm of opinion. There is an experiment that struck me: a small model was trained only on sequences of moves from the game of Othello, without ever being shown a board. Probing its internal representations, it turned out that inside it had reconstructed the state of the board, occupied squares included, despite never having seen one. An internal model of the world, emerged from the sole task of predicting the next move.


![](/assets/blog/cow-parrot/8c01a5ab43b2.png)


It would be convenient to stop here, but it would be dishonest. The same models show fragilities that a real world model should not have: they learn a fact in one direction and can't use it in reverse, they lean on statistical shortcuts, they fail in ways that betray the absence of a stable understanding.

> The truth is not at either extreme, lookup table on one side and mind on the other. It is somewhere in between, on a continuum, and that is exactly where the real debate is being fought.

## And if one day they had a body


From here the reflection slides, almost inevitably, onto philosophical ground.


If a system had a body, sensors, memory, goals and the ability to build a model of itself and its environment, could it develop something resembling consciousness?


I don't know, and I distrust anyone who answers with confidence in either direction. Today's AIs are not conscious. They generate text, images and code, but there is no evidence that they have subjective experience. The question stays open, though, and not in a trivial way: if much of our understanding of the world comes from the continuous exchange between brain and body, then maybe the leap toward more advanced systems does not come only from bigger models, but also from the ability to inhabit and test an environment.


## A question born from a cow


I like that all of this started from something silly. How does a cow fall convincingly inside a dream that makes no sense at all?


The answer, I think, is that the brain does not simply imagine images. It simulates worlds. And maybe the real leap that artificial intelligence will have to make in the coming years won't be generating prettier images or better code, but building models of the world more and more like the ones we use without even noticing.


Which leaves the point I started from, and to me it is the most solid of all. The cow falling in the dream and the model predicting the next word look like two very distant phenomena, and yet they suggest the same idea: predicting is not necessarily the opposite of understanding. In many cases, understanding might be exactly the ability to predict well how a system will evolve. The interesting question is not whether an AI predicts, because the brain does it constantly too. The question is how rich, how deep and how grounded in reality the model that prediction builds becomes over time.


The next time I have an absurd dream, I'll probably pay less attention to the scene and more to the rules that govern it. Now and then it is precisely those rules that tell us something interesting about how the mind works. And, perhaps, about what machines are still missing to get close to it.
