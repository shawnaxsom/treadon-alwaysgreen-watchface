# TreadOn Watchface for Fitbit Versa Lite

## Features

This is a watchface for Fitbit watch devices. It hasn't been released to the store yet, it mainly needs some configurable settings.

The background color ranges from Red (well behind schedule), to Yellow (on schedule), to Green (ahead of schedule).

The Clock view shows:

- Current day of week
- Current time
- Current date

The Exercise view is accessed with a single tap, and it shows:

- How many steps you are ahead or behind schedule
- Steps this hour
- Current Time
- Stopwatch
- Steps during exercise
- Total steps
- Heart rate


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

