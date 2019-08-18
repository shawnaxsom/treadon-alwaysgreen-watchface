# TreadOn Watchface for Fitbit Versa Lite

## Getting Started

First, install the Fitbit OS Simulator. Versa Lite doesn't currently support a Developer Bridge.

See: https://dev.fitbit.com/build/guides/command-line-interface/#source-control-using-github

npx fitbit-build
npx fitbit
fitbit$ install

You can also rebuild from within the Fitbit shell:

fitbit$ build

## Uploading to a physical device (or production)

- Create an FBA file in the Fitbit Studio
- Create an app here and upload it: https://gam.fitbit.com/apps
- Refresh the page, there will be a Private Link you can open on any phone with Fitbit mobile installed.

After getting everything necessary uploaded, you can then publish for public

