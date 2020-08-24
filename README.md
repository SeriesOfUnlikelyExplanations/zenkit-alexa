# alexa-zenkit-sync

Unofficial Zenkit Alexa Shopping List Sync Skill
[![Actions Status](https://github.com/SeriesOfUnlikelyExplanations/zenkit-alexa/workflows/Deploy/badge.svg)](https://github.com/SeriesOfUnlikelyExplanations/zenkit-alexa/actions) [![codecov](https://codecov.io/gh/SeriesOfUnlikelyExplanations/zenkit-alexa/branch/master/graph/badge.svg)](https://codecov.io/gh/SeriesOfUnlikelyExplanations/zenkit-alexa)


SeriesOfUnlikelyExplanations/zenkit-alexa
## Disclaimer

**The is an unofficial skill meaning it should only be used for personal usage. This project does not have any affiliations with Zenkit or Amazon.**

## Introduction

This skill provides Alexa list synchronization with todo.zenkit.com lists.

Zenkit is an end-to-end task managment/organization tool with tons of features and customizations so you can organize things the way you want them.

The skill supports the following:
- You can use the native Alexa list commands to add new and remove elements to your Zenkit To-Do lists. There is no need to invoke the skill first.
- Any list in Alexa is created and synced with a Zenkit list with the same name. If a list is availabe in Alexa but not Zenkit To-do, then the list is created in Zenkit To-do.
- Any item added to an Alexa List is immediately added to Zenkit.
- Any item added to a Zenkit list is synced to Alexa within 30 min.
- The Alexa To-Do list will sync with the Zenkit Inbox by default, but if you have a Zenkit list with 'to-do' in the title (eg 'Shared To-Do list', 'to-do list'), it will sync with that one instead.

Visit https://todo.zenkit.com to download the app and get started!

## Contact info:
### For issues/General queries/Feature requests or to just say thanks, please use the github issues below:
https://github.com/SeriesOfUnlikelyExplanations/zenkit-alexa/issues

## Special thanks
Special thanks to @jsetton for creating the ourGrocieries Alexa sync that this skill is based off of - https://github.com/jsetton/alexa-ourgroceries-sync
