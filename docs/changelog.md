# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v0.5.0]
### Breaking changes
- This version is compatible with version of the sc-machine 0.10.0. All API methods were redesigned. Incorrect ones were removed, new ones were added. See table below, to learn more about changes.

| Deprecated method                      | Substitution method                       | 
|----------------------------------------|-------------------------------------------|
| checkElements                          | getElementsTypes                          |
| createElements                         | generateElements                          |
| createNode                             | generateNode                              |
| createLink                             | generateLink                              |
| createEdge                             | generateConnector                         |
| createElementsBySCs                    | generateElementsBySCs                     | 
| deleteElements                         | eraseElements                             |
| getLinksByContents                     | searchLinksByContents                     |
| getLinksByContentSubstrings            | searchLinksByContentSubstrings            |
| getLinksContentsByContentSubstrings    | searchLinkContentsByContentSubstrings     |
| templateSearch                         | searchByTemplate                          |
| templateGenerate                       | generateByTemplate                        |
| tripleWithRelation                     | quintuple                                 |
| eventsCreate                           | createElementaryEventSubscriptions        |
| eventsDestroy                          | destroyElementaryEventSubscriptions       |
| findKeynodes                           | searchKeynodes                            |

- `ScEvent` class was renamed to `ScEventSubscription`, `ScEventParams` class was renamed to `ScEventSubscriptionParams`, and sc-event types in `ScEventType` were changed according the table below.

  | Removed sc-event type  | Substitution sc-event type  |
  |------------------------|-----------------------------|
  | AddOutgoingEdge        | AfterGenerateOutgoingArc    |
  | AddIngoingEdge         | AfterGenerateIncomingArc    |
  | RemoveOutgoingEdge     | BeforeEraseOutgoingArc      |
  | RemoveIngoingEdge      | BeforeEraseIncomingArc      |
  | RemoveElement          | BeforeEraseElement          |
  | ChangeContent          | BeforeChangeLinkContent     |

- New sc-event types: `AfterGenerateConnector`, `AfterGenerateEdge`, `BeforeEraseConnector`, `BeforeEraseEdge` were added.

- All sc-types were redesigned to a common style. They were deprecated, new ones were added. See changes in the table below.
  
  | Deprecated                    | Substitution              |
  |-------------------------------|---------------------------|
  | ScType.EdgeUCommon            | ScType.CommonEdge         |
  | ScType.EdgeDCommon            | ScType.CommonArc          |
  | ScType.EdgeUCommonConst       | ScType.ConstCommonEdge    |
  | ScType.EdgeDCommonConst       | ScType.ConstCommonArc     |
  | ScType.EdgeAccess             | ScType.MembershipArc      |
  | ScType.EdgeAccessConstPosPerm | ScType.ConstPermPosArc    |
  | ScType.EdgeAccessConstNegPerm | ScType.ConstPermNegArc    |
  | ScType.EdgeAccessConstFuzPerm | ScType.ConstFuzArc        |
  | ScType.EdgeAccessConstPosTemp | ScType.ConstTempPosArc    |
  | ScType.EdgeAccessConstNegTemp | ScType.ConstTempNegArc    |
  | ScType.EdgeAccessConstFuzTemp | ScType.ConstFuzArc        |
  | ScType.EdgeUCommonVar         | ScType.VarCommonEdge      |
  | ScType.EdgeDCommonVar         | ScType.VarCommonArc       |
  | ScType.EdgeAccessVarPosPerm   | ScType.VarPermPosArc      |
  | ScType.EdgeAccessVarNegPerm   | ScType.VarPermNegArc      |
  | ScType.EdgeAccessVarFuzPerm   | ScType.VarFuzArc          |
  | ScType.EdgeAccessVarPosTemp   | ScType.VarTempPosArc      |
  | ScType.EdgeAccessVarNegTemp   | ScType.VarTempNegArc      |
  | ScType.EdgeAccessVarFuzTemp   | ScType.VarFuzArc          |
  | ScType.NodeConst              | ScType.ConstNode          |
  | ScType.NodeVar                | ScType.VarNode            |
  | ScType.Link                   | ScType.NodeLink           |
  | ScType.LinkClass              | ScType.NodeLinkClass      |
  | ScType.NodeStruct             | ScType.NodeStructure      |
  | ScType.LinkConst              | ScType.ConstNodeLink      |
  | ScType.LinkConstClass         | ScType.ConstNodeLinkClass |
  | ScType.NodeConstTuple         | ScType.ConstNodeTuple     |
  | ScType.NodeConstStruct        | ScType.ConstNodeStructure |
  | ScType.NodeConstRole          | ScType.ConstNodeRole      |
  | ScType.NodeConstNoRole        | ScType.ConstNodeNonRole   |
  | ScType.NodeConstClass         | ScType.ConstNodeClass     |
  | ScType.NodeConstMaterial      | ScType.ConstNodeMaterial  |
  | ScType.LinkVar                | ScType.VarNodeLink        |
  | ScType.LinkVarClass           | ScType.VarNodeLinkClass   |
  | ScType.NodeVarStruct          | ScType.VarNodeStructure   |
  | ScType.NodeVarTuple           | ScType.VarNodeTuple       |
  | ScType.NodeVarRole            | ScType.VarNodeRole        |
  | ScType.NodeVarNoRole          | ScType.VarNodeNonRole     |
  | ScType.NodeVarClass           | ScType.VarNodeClass       |
  | ScType.NodeVarMaterial        | ScType.VarNodeMaterial    |

- All sc-links are sc-nodes.
- Types of actual and inactual temporal membership sc-arc were added.
- All possible combinations of subtypes in sc-types have been added to the ScType.
- Type `ScType.NodeAbstract` was removed.

### Added
- ScType methods: `isConnector`, `isStructure`, `isActual`, `isInactual`, `isSuperclass`
- All possible combinations of subtypes in sc-types into ScType
- Type `ScType.NodeSuperclass`
- Types: `ScType.Connector`, `ScType.Arc`
- Types of actual and inactual temporal sc-arcs into ScType
- sc-event types: `AfterGenerateConnector`, `AfterGenerateOutgoingArc`, `AfterGenerateIncomingArc`, `AfterGenerateEdge`, `BeforeEraseConnector`, `BeforeEraseOutgoingArc`, `BeforeEraseIncomingArc`, `BeforeEraseEdge`, `BeforeEraseElement`, `BeforeChangeLinkContent`
- ScTemplate methods: `quintuple`
- ScClient methods: `getElementsTypes`, `generateElements`, `generateNode`, `generateLink`, `generateConnector`, `generateElementsBySCs`, `eraseElements`, `searchLinksByContents`, `searchLinksByContentSubstrings`, `searchLinkContentsByContentSubstrings`, `searchByTemplate`, `generateByTemplate`, `createElementaryEventSubscriptions`, `destroyElementaryEventSubscriptions`, `searchKeynodes`

### Changed
- `ScEvent` class was renamed to `ScEventSubscription`
- `ScEventParams` class was renamed to `ScEventSubscriptionParams`

### Fixed
- Checking of all syntactic and semantic subtypes for types in ScType `merge` method.
- Now sc-link is sc-node

### Deprecated
- ScType methods: `isEdge`, `isStruct`
- sc-types: `ScType.EdgeUCommon`, `ScType.EdgeDCommon`, `ScType.EdgeUCommonConst`, `ScType.EdgeDCommonConst`, `ScType.EdgeAccess`, `ScType.EdgeAccessConstPosPerm`, `ScType.EdgeAccessConstNegPerm`, `ScType.EdgeAccessConstFuzPerm`, `ScType.EdgeAccessConstPosTemp`, `ScType.EdgeAccessConstNegTemp`, `ScType.EdgeAccessConstFuzTemp`, `ScType.EdgeUCommonVar`, `ScType.EdgeDCommonVar`, `ScType.EdgeAccessVarPosPerm`, `ScType.EdgeAccessVarNegPerm`, `ScType.EdgeAccessVarFuzPerm`, `ScType.EdgeAccessVarPosTemp`, `ScType.EdgeAccessVarNegTemp`, `ScType.EdgeAccessVarFuzTemp`, `ScType.NodeConst`, `ScType.NodeVar`, `ScType.Link`, `ScType.LinkClass`, `ScType.NodeStruct`, `ScType.LinkConst`, `ScType.LinkConstClass`, `ScType.NodeConstTuple`, `ScType.NodeConstStruct`, `ScType.NodeConstRole`, `ScType.NodeConstNoRole`, `ScType.NodeConstClass`, `ScType.NodeConstMaterial`, `ScType.LinkVar`, `ScType.LinkVarClass`, `ScType.NodeVarStruct`, `ScType.NodeVarTuple`, `ScType.NodeVarRole`, `ScType.NodeVarNoRole`, `ScType.NodeVarClass`, `ScType.NodeVarMaterial`
- ScTemplate methods: `tripleWithRelation`
- ScClient methods: `checkElements`, `createElements`, `createNode`, `createLink`, `createEdge`, `createElementsBySCs`, `deleteElements`, `getLinksByContents`, `getLinksByContentSubstrings`, `getLinksContentsByContentSubstrings`, `templateSearch`, `templateGenerate`, `eventsCreate`, `eventsDestroy`, `findKeynodes`

### Removed
- ScType method: `isAbstract`
- Type `ScType.NodeAbstract`
- sc-event types: `AddOutgoingEdge`, `AddIngoingEdge`, `RemoveOutgoingEdge`, `RemoveIngoingEdge`, `RemoveElement`, `ChangeContent`

## [v0.4.2]
### Fixed

- Get user

## [v0.4.1]
### Added

- Get user

## [v0.4.0]
### Added

- FindKeynodes method
- ScHelper class with methods: getMainIdentifierLinkAddr, getMainIdentifier, getScIdentifier, getAddrOrSystemIdentifierAddr, getAnswer, createLink

## [v0.3.2]
### Added

- Output structure for generation by scs

## [v0.3.1]
### Fixed

- Remove filter from getLinkContents for empty contents

## [v0.3.0]
### Added

- Support sc-server errors handling
- Get strings by substrings
- Get links by contents, content substrings
- Add opportunity to create sc-elements by SCs-text

### Changed

- Revert of "Add params for search" revert
- Revert of "Add opportunity to pass template and params by addr and idtf" revert

### Fixed

- Return boolean value in eventsDestroy method
- Improved tests work not only with the mock-server, but also with the real sc-machine server

## [v0.2.1]

### Fixed

- Remove code, not supported by current sc-machine

## [v0.2.0]

### Added

- Support for custom websocket
- Add params for search
- Add opportunity to pass template and params by addr and idtf

## [v0.1.3]

### Fixed

- add output types path

## [v0.1.2]

### Fixed

- correct webpack output path

## [v0.1.1]

### Changed

- package.json main property

## [v0.1.0]

### Added

- README and LICENSE files
- Data classes of the sc-client for objects manipulating
- API for connecting, disconnecting, and checking connection status with the sc-server
- API for creating, and deleting elements in the sc-memory
- API for checking the type of elements
- API for setting and getting content of the sc-link
- API for getting the list of sc-links by content
- API for resolving sc-keynodes
- API for generating and searching constructions in the sc-memory by template
- API for sc-event registration and destroying in the sc-memory
- API for checking the state of the sc-event
- tests for scClient
- Documentation for contributors and developers
- CI for checking messages of commits
- CI for test
- CI for publishing package on npm
