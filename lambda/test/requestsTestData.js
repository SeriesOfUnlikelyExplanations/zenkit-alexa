'use strict';

//https://developer.amazon.com/en-US/docs/alexa/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#getList

module.exports = Object.freeze({

  ITEMS_CREATED_WITH_TOKEN: {
    "version": "1.0",
    "context": {
      "System": {
        "application": {
          "applicationId": "amzn1.ask.skill.eb6e6958-a33c-4050-a1f4-ceaeda2eddb1"
        },
        "user": {
          "userId": "amzn1.ask.account.create_test",
          "accessToken": "TestConsentToken",
          "permissions": {
            "consentToken": "TestConsentToken"
          }
        },
        "apiEndpoint": "https://api.amazonalexa.com",
        "apiAccessToken": "TestAlexaToken"
      }
    },
    "request": {
      "type": "AlexaHouseholdListEvent.ItemsCreated",
      "requestId": "6b6fa7fc-b801-4660-8f0d-9915b36e4897",
      "timestamp": "2020-05-20T16:22:42Z",
      "eventCreationTime": "2020-05-20T16:22:42Z",
      "eventPublishingTime": "2020-05-20T16:22:42Z",
      "body": {
        "listId": "todo_list_list_id",
        "listItemIds": [
          "todo_list_item_added_id"
        ]
      }
    }
  },
  SYNC_MESSAGE_RECEIVED: {
    "version": "1.0",
    "context": {
      "System": {
        "application": {
          "applicationId": "amzn1.ask.skill.eb6e6958-a33c-4050-a1f4-ceaeda2eddb1"
        },
        "user": {
          "userId": "amzn1.ask.account.time_test",
          "accessToken": "TestConsentToken",
          "permissions": {
            "consentToken": "TestConsentToken"
          }
        },
        "apiEndpoint": "https://api.amazonalexa.com",
        "apiAccessToken": "TestAlexaToken"
      }
    },
    "request": {
      "type": "Messaging.MessageReceived",
      "requestId": "amzn1.echo-api.request.3c49100d-cda4-4f75-be92-6215e0b23702",
      "timestamp": "2020-05-24T00:02:56Z",
      "message": {
        "event": "updateAlexaList"
      }
    }
  },
  SEND_SYNC_MESSAGE: {
    "source": "aws.events",
    "type": "skillMessaging",
    "message": {
      "event": "updateAlexaList"
    }
  },
  GET_ATRTIBUTES_FOR_CREATE_ITEM : {
    "hold": false,
    "syncedLists": [
      {
        "alexaId": "todo_list_list_id",
        "alexaListName": "Alexa to-do list",
        "completeId": 7354598,
        "items": [

        ],
        "listId": 1067607,
        "shortListId": "i2Cs9iJ6Fi",
        "stageUuid": "d2b18ba1-be40-41b1-9fd7-92b477dabbba",
        "titleUuid": "febfd797-225d-48b4-8cec-61655c2cb240",
        "uncompleteId": 7354597,
        "workspaceId": 442548,
        "zenkitListName": "Inbox"
      },
      {
        "alexaId": "shopping_list_list_id",
        "alexaListName": "Alexa shopping list",
        "completeId": 73512252994620,
        "items": [
          {
            "alexaId": "dcdda1bf-0a2a-45b2-87f2-41b786719a5a",
            "status": "completed",
            "updatedTime": "2020-07-23T17:33:01.000Z",
            "value": "worcestershire sauce",
            "version": 1,
            "zenKitEntryId": 42,
            "zenKitUuidId": "23f9176c-5277-4c08-bcb2-4d12fc79486e"
          }
        ],
        "listId": 1225299,
        "shortListId": "CmhP8Fp28P",
        "stageUuid": "a40e01cb-d4af-4540-8e88-3b5b9703c755",
        "titleUuid": "5285fd24-ffa7-4942-a72c-3a2af0af524c",
        "uncompleteId": 7354619,
        "workspaceId": 442548,
        "zenkitListName": "Shopping list"
      }
    ],
    "userId": "amzn1.ask.account.create_test"
  },
  DISABLE_SKILL: {
    "version": "1.0",
    "context": {
        "System": {
            "application": {
                "applicationId": "amzn1.ask.skill.eb6e6958-a33c-4050-a1f4-ceaeda2eddb1"
            },
            "user": {
                "userId": "amzn1.ask.account.AHKBCGPTSFTUADYUPKIXPDR2ARUDGS6XXMQJOSHS2BBBSVOW5G4HOOVRJUSXO2D4RGPOSBUEKX5UI6S464DEC6R4IH7IOHBW676UQUFHNCIBRNW2NKBEJ6Y5FKB6JFU2UICR3SDUGKKJK5VOWFKUAKCJBZEPZKTUKJHGMPINEMUP5GE64KOIEL6UAYS2E2NOHP22ESWYVIC5G6Y",
                "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoib2F1dGgiLCJjbGllbnRJZCI6ODQsInVzZXIiOnsiaWQiOjQwMDQyM30sImlhdCI6MTU5NjAzNDk3NywiZXhwIjoxNTk2MTIxMzc3fQ.9seW8FIqeMsWheY-3ciB91RUgriz_CotmWIH7Ey_cZk"
            },
            "apiEndpoint": "https://api.amazonalexa.com",
            "apiAccessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJhdWQiOiJodHRwczovL2FwaS5hbWF6b25hbGV4YS5jb20iLCJpc3MiOiJBbGV4YVNraWxsS2l0Iiwic3ViIjoiYW16bjEuYXNrLnNraWxsLmViNmU2OTU4LWEzM2MtNDA1MC1hMWY0LWNlYWVkYTJlZGRiMSIsImV4cCI6MTU5NjExNzYyOSwiaWF0IjoxNTk2MTE0MDI5LCJuYmYiOjE1OTYxMTQwMjksInByaXZhdGVDbGFpbXMiOnsiY29uc2VudFRva2VuIjpudWxsLCJ1c2VySWQiOiJhbXpuMS5hc2suYWNjb3VudC5BSEtCQ0dQVFNGVFVBRFlVUEtJWFBEUjJBUlVER1M2WFhNUUpPU0hTMkJCQlNWT1c1RzRIT09WUkpVU1hPMkQ0UkdQT1NCVUVLWDVVSTZTNDY0REVDNlI0SUg3SU9IQlc2NzZVUVVGSE5DSUJSTlcyTktCRUo2WTVGS0I2SkZVMlVJQ1IzU0RVR0tLSks1Vk9XRktVQUtDSkJaRVBaS1RVS0pIR01QSU5FTVVQNUdFNjRLT0lFTDZVQVlTMkUyTk9IUDIyRVNXWVZJQzVHNlkifX0.UlF11S-m2m_ntlFr2gB-5gF_vF7toJVgXEw_I9DSL7o_P2ceRPsq0Qwg72xR_2fdrvhAJfE_l6T-NMSnSZ-gRk-X4DgCap2bEPpE6D4Y-4HYC5qVmEIpHmvFyPTrOPnPH84YWlPQIwM5NA2OOas1Q_7zXYGQvBdSZsCWQx0Tx1nCfE16YWgcYi7X55BY4_SAL4QGUxTrezJUXn8P6ybzgxg21EvRXcGiGNup1aR6v3o3lsfo291JYD70964n3DqR3ze6y9w2emTwPO59-jNy5P2bCXgqJqUAe9H8NkQaM6QpeV5QfX40VztGkacUiKLD0AX4MVF8LEHOYS8oi4Sr0A"
        }
    },
    "request": {
        "type": "AlexaSkillEvent.SkillDisabled",
        "requestId": "3a899821-5023-4ec6-8460-3a73540a33e2",
        "timestamp": "2020-07-30T13:00:29Z",
        "eventCreationTime": "2020-07-30T13:00:29Z",
        "eventPublishingTime": "2020-07-30T13:00:29Z",
        "body": {
            "userInformationPersistenceStatus": "NOT_PERSISTED"
        }
    }
  },
  LINK_SKILL: {
    "version": "1.0",
    "context": {
        "System": {
            "application": {
                "applicationId": "amzn1.ask.skill.eb6e6958-a33c-4050-a1f4-ceaeda2eddb1"
            },
            "user": {
                "userId": "amzn1.ask.account.AGEXO7ZTSYPAZVIS4YE3TOEBFI2TSAOZLCGZD3GGQJ54FFJSH3B4IFFVNSCH5HB4HO53ERE7U5EGOARVL5T3XT4RDAJWJQTQ6MDVEJI5LBZ3VXD3WOAXEVE47V4UX5GFDKKONTOPPBAAYQQLUCT7EQ2IUBQ5STUSIRZLQRMWHEO4FVGRZFUAWNFDOCFPFGAXZSWKB3U6FCQHAII",
                "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoib2F1dGgiLCJjbGllbnRJZCI6ODQsInVzZXIiOnsiaWQiOiI0MDA0MjMifSwiaWF0IjoxNTk2MTE0MTE5LCJleHAiOjE1OTYyMDA1MTl9.fJ2ZnYfMFhe6TrxfXBG-QLRczHuczGL4TOckONDj57w"
            },
            "apiEndpoint": "https://api.amazonalexa.com",
            "apiAccessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJhdWQiOiJodHRwczovL2FwaS5hbWF6b25hbGV4YS5jb20iLCJpc3MiOiJBbGV4YVNraWxsS2l0Iiwic3ViIjoiYW16bjEuYXNrLnNraWxsLmViNmU2OTU4LWEzM2MtNDA1MC1hMWY0LWNlYWVkYTJlZGRiMSIsImV4cCI6MTU5NjExNzcyMCwiaWF0IjoxNTk2MTE0MTIwLCJuYmYiOjE1OTYxMTQxMjAsInByaXZhdGVDbGFpbXMiOnsiY29uc2VudFRva2VuIjpudWxsLCJ1c2VySWQiOiJhbXpuMS5hc2suYWNjb3VudC5BR0VYTzdaVFNZUEFaVklTNFlFM1RPRUJGSTJUU0FPWkxDR1pEM0dHUUo1NEZGSlNIM0I0SUZGVk5TQ0g1SEI0SE81M0VSRTdVNUVHT0FSVkw1VDNYVDRSREFKV0pRVFE2TURWRUpJNUxCWjNWWEQzV09BWEVWRTQ3VjRVWDVHRkRLS09OVE9QUEJBQVlRUUxVQ1Q3RVEySVVCUTVTVFVTSVJaTFFSTVdIRU80RlZHUlpGVUFXTkZET0NGUEZHQVhaU1dLQjNVNkZDUUhBSUkifX0.E_ciPeSA7b65Ws6Y5c2ocd4B1ad1CTbpXV2WCQfMFVWzz7oFA5XebXADWiy_yooW7hLi0ZVlfyV0cNZXowQRs7sSWtAk7eJ4WWYZt4GeK_x0Msq5CDHQbNVolxq_IgK7azUwclAubSeZNwO0VEbU82gXzYX5yBXYxPd6MFPLjpYHGzeLry-koOAx0Cfy3OrhA-RodQPXlGzZNkItLZqBDKHGn10V1802keqAiBdzBZSz7QhAUD1uUNrVTs5AqdxqaPfj6irjWkg1y9pvmXC9Nxjyx--2J6bwsLki64WSFU7E1iIgUiPGap1MWf9QWu4gzhBrRQ4ftETVct8gIQZXHA"
        }
    },
    "request": {
        "type": "AlexaSkillEvent.SkillAccountLinked",
        "requestId": "58796e94-a1e8-4b9c-aee0-3c0792da8078",
        "timestamp": "2020-07-30T13:02:00Z",
        "eventCreationTime": "2020-07-30T13:02:00Z",
        "eventPublishingTime": "2020-07-30T13:02:00Z",
        "body": {
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoib2F1dGgiLCJjbGllbnRJZCI6ODQsInVzZXIiOnsiaWQiOiI0MDA0MjMifSwiaWF0IjoxNTk2MTE0MTE5LCJleHAiOjE1OTYyMDA1MTl9.fJ2ZnYfMFhe6TrxfXBG-QLRczHuczGL4TOckONDj57w"
        }
    }
  },
  PERMISSIONS_ACCEPTED: {
    "version": "1.0",
    "context": {
      "System": {
          "application": {
              "applicationId": "amzn1.ask.skill.eb6e6958-a33c-4050-a1f4-ceaeda2eddb1"
          },
          "user": {
              "userId": "amzn1.ask.account.AGEXO7ZTSYPAZVIS4YE3TOEBFI2TSAOZLCGZD3GGQJ54FFJSH3B4IFFVNSCH5HB4HO53ERE7U5EGOARVL5T3XT4RDAJWJQTQ6MDVEJI5LBZ3VXD3WOAXEVE47V4UX5GFDKKONTOPPBAAYQQLUCT7EQ2IUBQ5STUSIRZLQRMWHEO4FVGRZFUAWNFDOCFPFGAXZSWKB3U6FCQHAII",
              "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoib2F1dGgiLCJjbGllbnRJZCI6ODQsInVzZXIiOnsiaWQiOiI0MDA0MjMifSwiaWF0IjoxNTk2MTE0MTE5LCJleHAiOjE1OTYyMDA1MTl9.fJ2ZnYfMFhe6TrxfXBG-QLRczHuczGL4TOckONDj57w",
              "permissions": {
                  "consentToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJhdWQiOiJodHRwczovL2FwaS5hbWF6b25hbGV4YS5jb20iLCJpc3MiOiJBbGV4YVNraWxsS2l0Iiwic3ViIjoiYW16bjEuYXNrLnNraWxsLmViNmU2OTU4LWEzM2MtNDA1MC1hMWY0LWNlYWVkYTJlZGRiMSIsImV4cCI6MTU5NjExNzgxMCwiaWF0IjoxNTk2MTE0MjEwLCJuYmYiOjE1OTYxMTQyMTAsInByaXZhdGVDbGFpbXMiOnsiY29uc2VudFRva2VuIjoiQXR6YXxJd0VCSUE4NDB4R05HdDZRMkdtM18tc2pTR2hRWUFSTVBwWXRvYVdLcUNOZnpHeVVEME84T1Q5Z01adm5VNW5ncUplM1A0SmhUdHRPU3Z6VlJNODdLQTYxQjJORVVaUm4wenpZQ1EzMnZjNFk5QnFQenJKQ2RpYlVGbk9pME5uVlRxakhYWTN5clI5bkVSUExLZGpaUHRKeFVERjBMdFBCZUROTzJYcG0tMDZ2UEhVOExHcWNpbXZfMi1zWFdSMWxJNkRTS0d2LUxPTlB1bWQ2VUU2QzFDWDZMS015V3ZjY2lLYjFGYml6TFV1Y1djLTZHTEJCTHg0N3NQYTZFQ2JoSmM5cWFkMkgxNFhhQ19mLTBTck9HMVY5X1U5ZmloWFFOSUtmNm5PVHYzOEM0b3pVeUEiLCJ1c2VySWQiOiJhbXpuMS5hc2suYWNjb3VudC5BR0VYTzdaVFNZUEFaVklTNFlFM1RPRUJGSTJUU0FPWkxDR1pEM0dHUUo1NEZGSlNIM0I0SUZGVk5TQ0g1SEI0SE81M0VSRTdVNUVHT0FSVkw1VDNYVDRSREFKV0pRVFE2TURWRUpJNUxCWjNWWEQzV09BWEVWRTQ3VjRVWDVHRkRLS09OVE9QUEJBQVlRUUxVQ1Q3RVEySVVCUTVTVFVTSVJaTFFSTVdIRU80RlZHUlpGVUFXTkZET0NGUEZHQVhaU1dLQjNVNkZDUUhBSUkifX0.ThdOtIEcNp65APMvk4g69II30c6a5IbTjPs0okV6D20VIdFVLDE7dZlMclQkXioDv1xaYmL36d9QRiO-jFei2sXOvipvX53N3zAO7virf-Z4k9_79Ya5W8c1z2QXUvl-lwTBJR4VAaeCNfknXpdmnVtuZ8qqE-v4ayziqCAEhmh4tWgrRrrc4SiPRorcPI9CxleJWNnFSKySwLuBSllVi_mwutfOLOkosldGzScy3aBfiObRPmH8kJfZMeqZB0Yvz3qHywr7n-_1kdAC5XcHYhqVhAFFDH5IkXYrLuo8xu17xISMRE6vx9goFwqogp6WVNiu6_GpehYkcBAU-KHtlw"
              }
          },
          "apiEndpoint": "https://api.amazonalexa.com",
          "apiAccessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJhdWQiOiJodHRwczovL2FwaS5hbWF6b25hbGV4YS5jb20iLCJpc3MiOiJBbGV4YVNraWxsS2l0Iiwic3ViIjoiYW16bjEuYXNrLnNraWxsLmViNmU2OTU4LWEzM2MtNDA1MC1hMWY0LWNlYWVkYTJlZGRiMSIsImV4cCI6MTU5NjExNzgxMCwiaWF0IjoxNTk2MTE0MjEwLCJuYmYiOjE1OTYxMTQyMTAsInByaXZhdGVDbGFpbXMiOnsiY29uc2VudFRva2VuIjoiQXR6YXxJd0VCSUE4NDB4R05HdDZRMkdtM18tc2pTR2hRWUFSTVBwWXRvYVdLcUNOZnpHeVVEME84T1Q5Z01adm5VNW5ncUplM1A0SmhUdHRPU3Z6VlJNODdLQTYxQjJORVVaUm4wenpZQ1EzMnZjNFk5QnFQenJKQ2RpYlVGbk9pME5uVlRxakhYWTN5clI5bkVSUExLZGpaUHRKeFVERjBMdFBCZUROTzJYcG0tMDZ2UEhVOExHcWNpbXZfMi1zWFdSMWxJNkRTS0d2LUxPTlB1bWQ2VUU2QzFDWDZMS015V3ZjY2lLYjFGYml6TFV1Y1djLTZHTEJCTHg0N3NQYTZFQ2JoSmM5cWFkMkgxNFhhQ19mLTBTck9HMVY5X1U5ZmloWFFOSUtmNm5PVHYzOEM0b3pVeUEiLCJ1c2VySWQiOiJhbXpuMS5hc2suYWNjb3VudC5BR0VYTzdaVFNZUEFaVklTNFlFM1RPRUJGSTJUU0FPWkxDR1pEM0dHUUo1NEZGSlNIM0I0SUZGVk5TQ0g1SEI0SE81M0VSRTdVNUVHT0FSVkw1VDNYVDRSREFKV0pRVFE2TURWRUpJNUxCWjNWWEQzV09BWEVWRTQ3VjRVWDVHRkRLS09OVE9QUEJBQVlRUUxVQ1Q3RVEySVVCUTVTVFVTSVJaTFFSTVdIRU80RlZHUlpGVUFXTkZET0NGUEZHQVhaU1dLQjNVNkZDUUhBSUkifX0.ThdOtIEcNp65APMvk4g69II30c6a5IbTjPs0okV6D20VIdFVLDE7dZlMclQkXioDv1xaYmL36d9QRiO-jFei2sXOvipvX53N3zAO7virf-Z4k9_79Ya5W8c1z2QXUvl-lwTBJR4VAaeCNfknXpdmnVtuZ8qqE-v4ayziqCAEhmh4tWgrRrrc4SiPRorcPI9CxleJWNnFSKySwLuBSllVi_mwutfOLOkosldGzScy3aBfiObRPmH8kJfZMeqZB0Yvz3qHywr7n-_1kdAC5XcHYhqVhAFFDH5IkXYrLuo8xu17xISMRE6vx9goFwqogp6WVNiu6_GpehYkcBAU-KHtlw"
      }
    },
    "request": {
      "type": "AlexaSkillEvent.SkillPermissionAccepted",
      "requestId": "61455034-c7d0-4328-a433-a2477bdd0fc6",
      "timestamp": "2020-07-30T13:03:30Z",
      "eventCreationTime": "2020-07-30T13:03:30Z",
      "eventPublishingTime": "2020-07-30T13:03:30Z",
      "body": {
        "acceptedPermissions": [
          {
            "scope": "alexa::household:lists:read"
          },
          {
            "scope": "alexa::household:lists:write"
          }
        ]
      }
    }
  },
  PERMISSIONS_REMOVED: {
    "version": "1.0",
    "context": {
        "System": {
            "application": {
                "applicationId": "amzn1.ask.skill.eb6e6958-a33c-4050-a1f4-ceaeda2eddb1"
            },
            "user": {
                "userId": "amzn1.ask.account.AFDGCQ35AQHOIWYXT7QB7WLTBQCJAZIOPOJ5F7CJSVLEQA2V4FZEFR6TGT24G37IZL3YP2UVBLZUXHUN5GOI7GFBR7YYQGGUKQYXL6COFYLFBTAVTKE2AZHGB3QC4WZOQO5E2NIHBHF6NCQIXYNMYKVXGYB32TPVNFPR5UEY2SW2HQH6XI2NEUB7335E5RIMKNQCQ6BL2LA2NCI",
                "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoib2F1dGgiLCJjbGllbnRJZCI6ODQsInVzZXIiOnsiaWQiOiI0MDA0MjMifSwiaWF0IjoxNTk2MTE0Nzg1LCJleHAiOjE1OTYyMDExODV9.5_WIMr4tDLq8XjefcAo0gOAU0_woTtW7EN6ezykpFlQ"
            },
            "apiEndpoint": "https://api.amazonalexa.com",
            "apiAccessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJhdWQiOiJodHRwczovL2FwaS5hbWF6b25hbGV4YS5jb20iLCJpc3MiOiJBbGV4YVNraWxsS2l0Iiwic3ViIjoiYW16bjEuYXNrLnNraWxsLmViNmU2OTU4LWEzM2MtNDA1MC1hMWY0LWNlYWVkYTJlZGRiMSIsImV4cCI6MTU5NjExOTMyNywiaWF0IjoxNTk2MTE1NzI3LCJuYmYiOjE1OTYxMTU3MjcsInByaXZhdGVDbGFpbXMiOnsiY29uc2VudFRva2VuIjpudWxsLCJ1c2VySWQiOiJhbXpuMS5hc2suYWNjb3VudC5BRkRHQ1EzNUFRSE9JV1lYVDdRQjdXTFRCUUNKQVpJT1BPSjVGN0NKU1ZMRVFBMlY0RlpFRlI2VEdUMjRHMzdJWkwzWVAyVVZCTFpVWEhVTjVHT0k3R0ZCUjdZWVFHR1VLUVlYTDZDT0ZZTEZCVEFWVEtFMkFaSEdCM1FDNFdaT1FPNUUyTklIQkhGNk5DUUlYWU5NWUtWWEdZQjMyVFBWTkZQUjVVRVkyU1cySFFINlhJMk5FVUI3MzM1RTVSSU1LTlFDUTZCTDJMQTJOQ0kifX0.By5oobGHCFn-36Yd3BchbvJS0R2DNPl9D_QQlxab1T4-kTL5pvLglnt-m-GdNI3I2uSpYaXwU-IX5lxBcXGNzhP0GkUEmYVCIlv1x6j2UY8MCmmmhE2kLqpUW6xvzM7iEUSsugdZP4KAv6lJP9drBcMFFlQSiJH4_kvvwz2o86EO9OaRZfrmLa0ou_KDaKfJowjdeL_T4ScOSXIqYaawRX3F7zV0HwSkjTqQ842nlPBiDSSxtSsMDhc_azQgscSIM-W0b-Z0KdvnmqDqGvxlnvGDn9UiygjtLYtHsebnJ34v5qgy7vLqUSnns9wTYJJN1Yw1c6NO9UjxAc_BKra_yw"
        }
    },
    "request": {
        "type": "AlexaSkillEvent.SkillPermissionChanged",
        "requestId": "fcfdde12-edc9-4b92-9183-6f9f4cd99623",
        "timestamp": "2020-07-30T13:28:47Z",
        "eventCreationTime": "2020-07-30T13:28:47Z",
        "eventPublishingTime": "2020-07-30T13:28:47Z",
        "body": {
            "acceptedPermissions": []
        }
    }
  },
  ITEMS_CREATED_WITH_MISSING_TOKEN: {
    "version": "1.0",
    "context": {
      "System": {
        "application": {
          "applicationId": "amzn1.ask.skill.eb6e6958-a33c-4050-a1f4-ceaeda2eddb1"
        },
        "user": {
          "userId": "amzn1.ask.account.create_test",
          "permissions": {
            "consentToken": "TestConsentToken"
          }
        },
        "apiEndpoint": "https://api.amazonalexa.com",
        "apiAccessToken": "TestAlexaToken"
      }
    },
    "request": {
      "type": "AlexaHouseholdListEvent.ItemsCreated",
      "requestId": "6b6fa7fc-b801-4660-8f0d-9915b36e4897",
      "timestamp": "2020-05-20T16:22:42Z",
      "eventCreationTime": "2020-05-20T16:22:42Z",
      "eventPublishingTime": "2020-05-20T16:22:42Z",
      "body": {
        "listId": "todo_list_list_id_missing",
        "listItemIds": [
          "todo_list_item_added_id"
        ]
      }
    }
  }
})
