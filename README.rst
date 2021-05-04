Disclaimer
----------
This script only helps you confirm your daily COVID status on Cornell's Daily
Check website. It just provides a functionally equivalent way to answering "no"
in the form. While it serves as a command-line tool to conveniently check in your
health status, you should NOT run it when your answers are not "no" in
the form. Use at your own discretion.

How to Use
----------

- Put your NetID in ``.username``.
- Put your password in ``.secret``.
- ``npm install``
- ``node dailycheck.js --status`` to see if your're checked-in.
- ``node dailycheck.js --checkin`` to check in.

FAQ
---

- I got "unable to find form: bigpost": make sure your ``.username`` and
  ``.secret`` are correct: ``.username`` should contain your NetID only, not
  your complete email.
