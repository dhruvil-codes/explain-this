Gradient descent is how a computer learns from mistakes. Picture its total error as a hilly landscape. Learning means walking downhill to the lowest valley.

It works in steps:

- **Start with a guess.** The model's settings begin at random values. These settings are called weights.
- **Measure the error.** The model tries some examples. One number, the error score, sums up how wrong it was.
- **Find the slope.** Math called the gradient measures which way is uphill from here. It is like feeling the slope under your feet in fog.
- **Step downhill.** Each setting moves a little against the slope. The step size is called the learning rate.
- **Mind the step size.** Tiny steps learn very slowly. Giant steps jump over the valley and bounce around. A middle size works best.
- **Repeat many times.** Each round moves a little further down. The error drops fast at first, then flattens near the bottom.

For example, a model guesses house prices. Each round of measure-and-step makes its guesses a little less wrong. After many rounds, it lands in a valley of small errors and stops there.
