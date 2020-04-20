# alexa-zenkit-sync

Unofficial Zenkit Alexa Shopping List Sync Skill

## Disclaimer

**The is an unofficial skill meaning it should only be used for personal usage. I do not have any affiliations with Zenkit or Amazon.**

## Introduction

This skill provides Alexa shopping list synchronization with a todo.zenkit.com shopping list with the same name. It will create a zenkit shopping list if one doesn't exist. Right now, this only supports syncing the shopping list, but hoping to expand soon.

## Privacy:

Data Storage:
This skill stores current list items in temporary storage for the purposes of syncing between skills. Items that are deleted from Zenkit or Alexa are synced (deleted from the other account) and then deleted from the data store. The entire datastore is deleted when the customer diables the skill. All data is hosted in AWS and is not exported.

Data use:
The data collected is only used for the direct functionatliy of the skill. Manual access is only for the purposes of debugging.

Zenkit privacy policy:
If you are using this skill, then you need to have a zenkit account and agree to their privacy policy: https://zenkit.com/en/privacy/

## Contact info:
Issues:
General queries:
Feature requests:

### Known bugs:


## Special thanks
Special thanks to @jsetton for creating the ourGrocieries Alexa sync that this skill is based off of - https://github.com/jsetton/alexa-ourgroceries-sync
