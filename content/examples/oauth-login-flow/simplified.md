Logging in with Google or Apple uses a standard called OAuth. It proves who you are without sharing your password with every site.

It works in steps:

- **Ask to log in.** You click "Log in with Google" on an app, for example a photo-printing site. The site sends your browser to Google.
- **Check the request.** You deal only with Google. Google shows a permission screen. It names the app and lists what the app wants, such as your email.
- **Say yes.** You approve. Google sends your browser back to the app with a short-lived code. The code is like a claim ticket, not the final pass.
- **Swap the ticket.** The app contacts Google directly, computer to computer. It swaps the code for tokens and proves itself with a secret key. The secret never passes through your browser.
- **Receive a pass.** Google returns an access token. The app attaches this token to requests for your data. Tokens expire, often within minutes or hours.
- **Log in done.** The app fetches only what you allowed, like your name and email. It never learns your password. You can remove its access any time in your Google settings.

For example, you approve a printing site to see your photos. It can print them but cannot read your email. Removing access stops it at once.
