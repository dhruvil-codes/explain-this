A transformer is a design that helps a computer understand sentences. It reads all the words at once, not one by one.

It works in steps:

- **Split the text.** The sentence is cut into small pieces called tokens. A token can be a word, part of a word, or a mark like a comma.
- **Turn pieces into numbers.** Each token becomes a list of numbers that stands for its meaning. A position signal is added so the order of the words is kept.
- **Let words compare notes.** Each word asks which other words matter for its meaning. Every link gets a weight. The weights for one word add up to one.
- **Blend in the context.** Each word mixes in meaning from the words it linked to most. So "bank" near "river" is treated differently from "bank" near "money".
- **Refine and repeat.** A small network polishes the numbers for each word. Shortcut links keep learning stable. Many such layers are stacked, each adding deeper meaning.
- **Pick the next word.** The last layer turns the numbers into chances for each possible next word. The model picks one and repeats the steps to keep writing.

For example, take "The cat sat because it was tired". The word "it" links most strongly to "cat". That link tells the model who was tired.
