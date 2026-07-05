---
title: The stochastic parrot is dead (and it was killed by its own map)
excerpt: For years we dismissed them as "stochastic parrots". Then we looked inside the black box. Here's what we found.
publishDate: 2026-06-26
tags:
  - ai
  - artificial-intelligence
  - llm
  - ai-reasoning
image: /assets/blog/the-stochastic-parrot-is-dead/759e2fa71a0a.png
lang: en
notionId: 38ba9c08-e476-8052-93d2-c69d1e088285
---

For years there was one phrase that worked like a finishing move against any enthusiasm for language models. You find it in threads on X, in conference slides, in dinner conversations with the engineer friend who wants to keep you grounded: "they're just stochastic parrots". Full stop. End of discussion.


The expression isn't bar-stool talk. It comes from a precise academic paper, _On the Dangers of Stochastic Parrots_, signed in 2021 by Emily Bender, Timnit Gebru, Angelina McMillan-Major and Margaret Mitchell. Stripped to the bone, the argument went like this: a language model stitches together sequences of linguistic forms it has seen in its data, following probabilistic information about how those forms combine, but with no reference to meaning. Fluent, yes. Understanding, no. A very sophisticated parrot that repeats sounds without knowing what they mean.


For a while it was an honest description. The trouble is that the research of the last two years has made it hard to defend. And the best way I've found to explain why is an image I came across reading a chapter by Nello Cristianini titled _The Universal Catalogue_: the idea that, while they were learning to guess the next word, these models built something inside themselves that looks like a map of the world.


## A first crack: the hidden maps


Let's start with a result that, frankly, got under my skin. In 2024 two MIT researchers, Wes Gurnee and Max Tegmark, published a paper with a dry title: _Language Models Represent Space and Time_. They went rummaging inside Llama-2, one of the open models of that period, and asked a simple question: does this system, trained only on text, have any idea of where things are in the world?


The answer is yes, and in a more orderly way than expected. Somewhere in the network's inner layers there are groups of neurons whose activations correspond to the geographic coordinates of a place. Give the model "Statue of Liberty" or "Central Park" and, reading only those internal signals, you can reconstruct the position on a map. Not a perfect map, but a recognizable one: some directions encode north-south, others east-west. The same holds for time, with dates and historical figures laid out along something that resembles a timeline.


The point here isn't geography as such. The point is that nobody put those coordinates in by hand. They emerged on their own, during training, as a side effect of the task of predicting words. For a system that's supposed to do nothing more than count shallow correlations between symbols, that's a curious thing to do. It looks a lot more like what you would do if you were trying to organize information in order to use it better: instead of memorizing every isolated fact, you build a coordinate system where the facts sit in their place.


## The catalogue


The crack becomes a chasm when Anthropic enters the picture, the company behind Claude. In May 2024 its interpretability team, led by Chris Olah, published a study whose title is already a manifesto: _Scaling Monosemanticity_ (in its popular write-up, _Mapping the Mind of a Large Language Model_). It is, as far as anyone can tell, the first time someone looked inside a production model of that size and came back out with something readable.


The method starts from an intuition worth explaining, because it runs against common sense. It's called the "superposition principle". The idea is that if you want a network to know many more concepts than it has neurons, you are forced to represent them not with single neurons but with combinations of neurons that light up together. Anthropic calls those combinations _features_; Cristianini, in his chapter, prefers to call them "ideas", partly because _feature_ translates awkwardly into Italian, and partly as a tribute to the very first paper ever written on neural networks, the one by McCulloch and Pitts in 1943, which already spoke in its title of "ideas immanent in nervous activity". The analogy people often reach for is chemical: neurons are the atoms, groups of neurons are the molecules. A new level of description, where meaning lives not in the single unit but in the ensemble.


Using a technique called a sparse autoencoder, the researchers extracted millions of these ideas from the middle layer of Claude 3 Sonnet. And they found two things that flip the parrot story on its head.


The first: many ideas correspond to precise and sometimes surprisingly abstract concepts. There's the famous group of neurons that represents the Golden Gate Bridge (when the researchers cranked it to the maximum, Claude started insisting that it _was_ the bridge). But there are also ideas for Paris, for lithium, for immunology, and then far less concrete things: sycophancy, secrecy, inner conflict, even the difference between an accidental bug in a program and a backdoor placed there on purpose.


The second, and to me the more important one: the same idea activates regardless of how you run into it. The group of neurons for Paris fires whether you discuss the French government in English, read about the Louvre in a German document, or are shown a photo of the Eiffel Tower. Those neurons don't respond to the form of the stimulus. They respond to its meaning. Which is exactly the thing that, according to the 2021 accusation, language models were supposed to be missing.


Anthropic released an inventory of millions of these representations, of which only a small fraction has been studied by hand so far. OpenAI did a similar job on GPT-4 and found sixteen million, admitting that to truly map everything you would have to reach billions or trillions of ideas. Cristianini calls this, in a fine image, a "universal catalogue": something these systems have assembled by reading millions of pages, and which resembles one of those old atlases, wrong in their proportions, missing entire continents, yet already shot through with the ambition to chart the world.


## A list of places is not a map


Here, though, we need to be careful, because someone could object: having a well-organized warehouse of concepts doesn't mean you know how to use them. A dictionary doesn't think. It's a fair objection, and it's also the spot where the most recent research hits hardest.


In March 2025 Anthropic published a second piece of work, _On the Biology of a Large Language Model_, in which it goes beyond listing the ideas and traces the circuits, that is, the way these ideas activate and inhibit one another to reach a conclusion. This is where the parrot finally loses its feathers. Three examples, because they're worth more than a thousand abstract arguments.


The first is poetry, and it's my favorite because the researchers started from the opposite hypothesis. They wanted to show that the model does _not_ plan. Take a couplet in which the second line has to rhyme and make sense. The expectation was that Claude would write word by word and only worry about the rhyme at the last moment. It doesn't. Before it even begins the second line, the model "thinks" of the word it wants to end on (say, _rabbit_) and then builds the sentence to get there. The proof is elegant: if the researchers delete the concept of _rabbit_ from the inside, the model falls back on another sensible rhyme (_habit_); if they inject the concept "green", it writes a different line ending in _green_. A parrot repeating sounds has no plan. This one does, and it can adjust it on the fly.


The second is multi-step reasoning. Ask Claude for the capital of the state where Dallas is located. A system that "regurgitates" memorized answers would just spit out "Austin". Claude instead, on the inside, first activates the idea "Dallas is in Texas" and then, linked to it, the idea "the capital of Texas is Austin". It's combining two independent facts. And the demonstration, again, is surgical: if during the computation the researchers swap the "Texas" concept for "California", the answer changes to "Sacramento". There's a causal chain, not a reflex.


The third is mental arithmetic. Claude isn't a calculator and never learned the algorithm we're taught in school. Yet it adds. How? It uses two paths in parallel: a rough estimate of the result and a precise computation of the last digit, which then combine. The strangest part is that if you ask it _how_ it did it, it describes the old carry-the-one method, the one it has seen explained in textbooks. The account it gives of itself is false: something else is going on inside. Which is interesting for two opposite reasons. On one hand it confirms it isn't reciting from memory, since the internal strategy is genuinely its own. On the other it reminds us that these systems have no reliable access to their own mechanisms, which should cool the easier kind of enthusiasm.


There's a fourth result that closes the loop with the maps from earlier. When you ask Claude for "the opposite of small" in different languages, the same cores of neurons fire for the concepts of "smallness" and "opposite", which together light up the concept of "largeness", which only at the very end gets translated into the language of the question. It's as if beneath the languages there were a shared space, a kind of "language of thought", in which meaning exists before becoming words. Not a French parrot and a Chinese parrot working in parallel, but a single conceptual core.


## Why none of this might be an accident


At this point an almost philosophical question arises. If different models, trained by different companies with different architectures, build similar internal maps, what exactly are they mapping?


A group of researchers, again with Tegmark among the authors, has put forward a fascinating answer they've named the "Platonic Representation Hypothesis". The starting observation is that, as models get bigger and better, their internal representations tend to converge, and this happens even across models working on different modalities, text and images. The explanation they propose is that all these systems are capturing, each by its own route, the same underlying structure: reality, more or less as it is. Hence the Platonic name, in tribute to the idea that there's an ideal form of things that the various models approximate. It's a conjecture, to be fair, with its counterexamples and its limits. But even if it were only partly true, it would tell us that those maps aren't random furniture: they are attempts to represent the world.


## What the parrot got right


It would be dishonest to end in triumph, because the parrot image wasn't stupid, and it caught something real.


The internal maps are incomplete and distorted. Anthropic itself admits that its largest autoencoder is missing most of London's boroughs; not every element of the periodic table and not every country in the world has a dedicated idea of its own. Decoding these representations is still done by hand, slow and expensive, and so far we've read only the tip of the iceberg. Above all, these models fail in ways that betray their nature: that same study on circuits shows that hallucinations arise when the mechanism that should say "I don't know" gets silenced by mistake, and that sometimes Claude builds a plausible argument backwards, starting from the answer it wants to give. This is not understanding in the full, embodied sense we mean for human beings.


But "it isn't human understanding" is a different claim, and a far more reasonable one, than "it's a parrot repeating random sounds". The existence of millions of distinct representations, of plans that precede the writing, of inference chains you can interrupt and redirect on command, closes the question in its original form. Underneath the answers there aren't only shallow statistical relations. There's a structure.


Cristianini, in his chapter, opens with a slogan that physicists and biologists have known forever, _More Is Different_, coined by Philip Anderson in 1972: change the scale of a system and you change its nature. Certain properties exist only when the whole is large and complex enough, and they don't reduce to the behavior of the individual parts. AlphaZero had twenty million parameters; Claude has around four hundred billion. Somewhere along that dizzying climb, something happened that the vocabulary of the "parrot" can no longer describe.


Maybe the most honest way to put it is this: we still don't really know what these systems are. We do know, by now with the evidence in hand, what they are not. And the parrot, however useful it was for a few years in keeping our heads on straight, we can let it go.


---


### Further reading

- E. M. Bender, T. Gebru, A. McMillan-Major, M. Mitchell, _On the Dangers of Stochastic Parrots: Can Language Models Be Too Big?_, FAccT 2021.
- W. Gurnee, M. Tegmark, _Language Models Represent Space and Time_, ICLR 2024.
- Anthropic, _Mapping the Mind of a Large Language Model_ and the paper _Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet_, 2024.
- Anthropic, _Tracing the Thoughts of a Large Language Model_ and _On the Biology of a Large Language Model_, 2025.
- M. Huh, B. Cheung, T. Wang, P. Isola, _The Platonic Representation Hypothesis_, ICML 2024.
- Framing and narrative cue: Nello Cristianini, chapter _The Universal Catalogue_.
