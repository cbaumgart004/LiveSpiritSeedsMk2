# Next steps: SpiritSeeds Wellness

The platform steps (AWS, uptime monitoring, the console on a phone, DNS and SES for every project)
live in Edge of the Map's
[launch checklist](https://github.com/cbaumgart004/edgeOfTheMap/blob/preview/docs/launch-checklist.md).
What is SpiritSeeds' own:

## 1. Move the domain from Squarespace to Porkbun: target 2026-11-11

`spiritseedswellness.com` is registered at Squarespace. A Porkbun transfer was ordered on
2026-09-27 and is held until about 2026-11-11, when the domain can move.

1. **Before the transfer**, export every DNS record from Squarespace (Domains → DNS settings) and
   recreate each in Porkbun. MX and TXT records matter most: they carry email for
   `melissacarey@spiritseedswellness.com`, and a missed MX stops her mail.
2. Get the transfer (auth) code from Squarespace, unlock the domain, and complete the Porkbun order.
3. Once Porkbun shows the domain, confirm the nameservers are Porkbun's, then check email and the site.

## 2. Go live on the console

1. Register the site and import the Tina content: launch checklist, steps 1.3 and 1.7.
2. Review the `preview` deploy with `?edit`: click-to-edit, drag-to-size, a Service's linked buttons.
3. Point the domain at Amplify (records in the launch checklist, section 4); through Squarespace DNS
   until the move above, Porkbun after it.
4. Merge `main` into `preview` to pick up any Tina edits, re-run the import with `--replace`, then
   merge `preview` into `main` (ADR 0003, "Reconciling at cutover").
5. Turn off the TinaCloud project once `main` builds without it.
