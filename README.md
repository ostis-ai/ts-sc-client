# ts-sc-client

<img src="https://github.com/ostis-ai/ts-sc-client/actions/workflows/test.yml/badge.svg?branch=main">

The typescript implementation of the client for communication with sc-server. This module is compatible with 0.10.0 version of sc-machine.

# ScClient

## connect

First of all one should create client instance. To do so:

```ts
    import { ScClient } from "ts-sc-client";

    const client = new ScClient('https://your-knowledge-base-websocket-url');
```

Since sc-machine [0.10.0](https://github.com/ostis-ai/sc-machine/tree/user_permissions), you can use user permissions API. 
See [docs about this functionality](https://ostis-ai.github.io/sc-machine/https://ostis-ai.github.io/sc-machine/sc-memory/api/cpp/extended/user_permissions_api/).

To get user from session use:

```ts
    import { client } from "../path-to-client";

    const userAddr = client.getUser();
```

By default client is browser based, so it uses `window.WebSocket` class. When using with node js one may pass custom websocket instance

```ts
    import { WebSocket } from "ws";

    const client = new ScClient(new WebSocket('https://your-knowledge-base-websocket-url'));
```

Created instance provides the following methods:

## `client.addEventListener(evt: "close", "error", "open", callback): void`
This method is a native websocket addEventListener. So it provides all basic socket event types: close, error, open

```ts
    import { client } from "../path-to-client";

    client.addEventListener("open", () => {
        // some logic to inform or process socket connection opening
    })
    
    client.addEventListener("error", () => {
        // socket connection resolved with error
    })
    
    client.addEventListener("close", () => {
        // socket connection is closed
    })
```

## `client.removeEventListener(evt: "close", "error", "open", callback): void`
This method is a native websocket removeEventListener. All event types are the same as for addEventListener

```ts
    import { client } from "../path-to-client";

    client.removeEventListener("open", () => {})
    
    client.removeEventListener("error", () => {})
    
    client.removeEventListener("close", () => {})
```

## `client.generateElements(construction: ScConstruction): ScAddrs[]`

Create specified in ScConstruction elements.

```ts
    import { ScAddr, ScConstruction } from "ts-sc-client";
    import { client } from "../path-to-client";

    const myNode = "_node";
    const myLink = "_link";

    const linkContent = "my_content";
    const fakeNodeAddr = new ScAddr(123);

    const construction = new ScConstruction();

    construction.generateNode(ScType.ConstNode, myNode);
    construction.generateLink(
      ScType.ConstNodeLink,
      new ScLinkContent(linkContent, ScLinkContentType.String),
      myLink
    );
    construction.generateConnector(
      ScType.ConstPermPosArc,
      myNode,
      fakeNodeAddr
    );

    const res = await client.generateElements(construction);
```

## `client.generateElementsBySCs(scsText: string[] | ISCs[]): boolean[]`

Create specified in ScConstruction elements by SCs text and puts them in structure. Returned boolean represents whether SCs text processing was 
successful.

```ts
    import { client } from "../path-to-client";

    const res = await client.generateElementsBySCs(
        ["my_class -> node1;;", "node1 => relation: node2;;"]
    );

    const res2 = await client.generateElementsBySCs(
        [{scs: "my_class -> node1;;", output_structure: new ScAddr(0)}]
    );
```

## `client.eraseElements(addrs: ScAddr[]): boolean`

Delete specified elements. Returned boolean represents whether deleting was successful.

```ts
    import { client } from "../path-to-client";

    const res = await client.eraseElements([addr1, addr2]);
```

## `client.getElementsTypes(addrs: ScAddr[]): ScType[]`

With this method you can check if specified elements exist. If element does not exits, returned ScType will be invalid

```ts
    import { client } from "../path-to-client";

    const res = await client.getElementsTypes([addr1, addr2]);
```

## `client.setLinkContents(addrs: ScAddr[]): boolean[]`

With this method you can set link content. Returned boolean array is made respective to passed one. Each element represents if content was set successfully.

```ts
    import { ScLinkContentType } from "ts-sc-client";
    import { client } from "../path-to-client";

    const content = "my_content";
    const linkContent = new ScLinkContent(content, ScLinkContentType.String);

    const res = await client.setLinkContents([linkContent]);
```

## `client.getLinkContents(addrs: ScAddr[]): ScLinkContent[]`

With this method you can get link content.

```ts
    import { client } from "../path-to-client";

    const res = await client.getLinkContents([nodeAddr]);
```

## `client.searchLinksByContents(contents: string[]): ScAddr[][]`

Search links by its contents.

```ts
    import { client } from "../path-to-client";

    const res = await client.searchLinksByContents(["concept_class"]);
    res[0] // link array where link contain content "concept_class"
```

## `client.searchLinksByContentSubstrings(contents: string[]): ScAddr[][]`

Search links by its content substrings.

```ts
    import { client } from "../path-to-client";

    const res = await client.searchLinksByContentSubstrings(["con"]);
    res[0] // link array where link contain content with substring "con"
```

## `client.searchLinkContentsByContentSubstrings(contents: string[]): string[][]`

Search strings by its substrings.

```ts
    import { client } from "../path-to-client";

    const res = await client.searchLinkContentsByContentSubstrings(["con"]);
    res[0] // string array that contain content substring "con"
```

## `client.resolveKeynodes<T = string>(Array<{idtf: T, type: ScType}>): Record<T, ScAddr>`

Search or resolve keynodes. When type is valid, element will be resolved by id or found otherwise.

```ts
    import { client } from "../path-to-client";

    const id1 = "my_id1";
    const id2 = "my_id2";

    const keynodes = [
      { id: id1, type: ScType.CommonArc },
      { id: id2, type: new ScType() },
    ];

    const res = await client.resolveKeynodes(keynodes);

    /**
     * res will be:
     * 
     * {
     *   my_id1: ScAddr,
     *   my_id2: ScAddr,
     * }
    */
```

## `client.searchByTemplate(templ: ScTemplate): ScTemplateResult[]`

Search constructions by specified template. When multiple templates are found each array elem represents search result.
ScTemplates params may contain pairs with address of sc-elements or its system identifiers.

```ts
    import { ScAddr, ScTemplate } from "ts-sc-client";
    import { client } from "../path-to-client";

    const fakeDialog = new ScAddr(15545);
    const fakeAddr1 = new ScAddr(123);
    const fakeAddr2 = new ScAddr(1232333);

    const circuitDialogAlias = "_circuit_dialog";
    const dialog = "_dialog";

    const template = new ScTemplate();

    template.quintuple(
      fakeAddr1,
      ScType.VarCommonArc,
      [ScType.VarNodeStructure, circuitDialogAlias],
      ScType.VarPermPosArc,
      fakeAddr2
    );
    template.triple(circuitDialogAlias, ScType.VarPermPosArc, [
      ScType.VarNode,
      dialog,
    ]);

    const params = {
        [circuitDialogAlias]: fakeDialog,
    };

    const res = await client.searchByTemplate(template, params);
```

Search constructions by specified template address.

```ts
    import { ScAddr, ScTemplate } from "ts-sc-client";
    import { client } from "../path-to-client";

    const fakeTemplate = new ScAddr(15545);
    
    const params = {
        [circuitDialogAlias]: fakeDialog,
    };

    const res = await client.searchByTemplate(fakeTemplate, params);
```

Search constructions by specified template system identifier.

```ts
    import { ScAddr, ScTemplate } from "ts-sc-client";
    import { client } from "../path-to-client";
    
    const params = {
        [circuitDialogAlias]: fakeDialog,
    };

    const res = await client.searchByTemplate('my_template', params);
```

Search constructions by scs-template.

```ts
    import { ScAddr, ScTemplate } from "ts-sc-client";
    import { client } from "../path-to-client";
    
    const params = {
        ['_node']: fakeDialog,
    };

    const res = await client.searchByTemplate('dialog _-> _node;;', params);
```

## `client.generateByTemplate(templ: ScTemplate): ScTemplateResult`

Generate construction by specified template.

```ts
    import { ScAddr, ScTemplate } from "ts-sc-client";
    import { client } from "../path-to-client";

    const fakeAddr1 = new ScAddr(123);
    const fakeAddr2 = new ScAddr(1232333);

    const fakeParamAddr = new ScAddr(777);

    const circuitDialogAlias = "_circuit_dialog";
    const dialog = "_dialog";

    const template = new ScTemplate();

    template.quintuple(
      fakeAddr1,
      ScType.VarCommonArc,
      [ScType.VarNodeStructure, circuitDialogAlias],
      ScType.VarPermPosArc,
      fakeAddr2
    );
    template.triple(circuitDialogAlias, ScType.VarPermPosArc, [
      ScType.VarNode,
      dialog,
    ]);

    const params = {
      [dialog]: fakeParamAddr,
    };

    const res = await client.generateByTemplate(template, params);
```

## `client.createElementaryEventSubscriptions(params: ScEventSubscriptionParams[]): ScEventSubscription[]`

Subscribe to event. Event callback, passed to `ScEventSubscriptionParams` constructor, has 4 parameters: `subscribedAddr`, `connectorAddr` (sc-address of sc-connector generated or erased from or to sc-element with sc-address `subscribedAddr`), `otherElementAddr` (it equals to source sc-element of sc-connector with sc-address `connectorAddr`, if target sc-element of this sc-connector is sc-element with sc-address `subscribedAddr`, otherwise, it equals to target sc-element of this sc-connector) and created eventId. The last one may be used to destroy event after having some specific result.

```ts
    import { ScAddr } from "ts-sc-client";
    import { client } from "../path-to-client";

    const callback = (subscribedAddr: ScAddr, connectorAddr: ScAddr, otherElementAddr: ScAddr, createdEventId: number) => {
        // some logic here
    }

    const eventSubscriptionParams = new ScEventSubscriptionParams(
      fakeAddr2,
      ScEventType.BeforeEraseIncomingArc,
      callback
    );

    const res = await client.createElementaryEventSubscriptions([eventSubscriptionParams]);
```

## `client.destroyElementaryEventSubscriptions(eventIds: number[]): boolean`

Destroy an event. Input arguments are event ids returned by createElementaryEventSubscriptions method. Returns true if events has been deleted.


```ts
    import { client } from "../path-to-client";

    const eventIds = [1, 2];

    await client.destroyElementaryEventSubscriptions(eventIds);
```

## `client.searchKeynodes(...keynodesInSnakeCase: string[]): { keynodesInCamelCase: ScAddr }`

This method is a wrapper on resolveKeynodes. It returns object with specified keynodes strings as described bellow. Also it caches requested keynodes.

Cache implementation works as follows:

- First, there is no keynodes in cache.
- Keynodes `a` and `b` is requested and put in the cache
- Then keynodes `b`, `c` is requested. `b` will be returned immediately from cache and `c` will fire server request


```ts
    import { client } from "../path-to-client";

    const someIncredibleFunction = async () => {
        // Keynodes from arguments put to object
        const obj = await client.searchKeynodes("lang_ru", "some_other_keynode");
        
        // Shake case is transformed to camel case. 
        const { langRu, someOtherKeynode } = obj;

        // lang_ru returned from cache, one_more_keynode is requested from server
        const { langRu, oneMoreKeynode } = await client.searchKeynodes("lang_ru", "one_more_keynode");
    }

    someIncredibleFunction();
```

# ScAddr
Simple abstraction over address in sc-memory.

```ts
const addr = new ScAddr(123);
```

## `addr.isValid(): boolean`

Check if addr is valid

## `addr.equal(anotherAddr: ScAddr): boolean`

Check if addr is equal to another one

## `addr.value`

allows to get addr value

# ScLinkContent
An abstraction over link content

```ts
const linkContent = "my_content";
const content = new ScLinkContent(linkContent, ScLinkContentType.String),
```

## `constructor(data: string | number, type: ScLinkContentType, addr?: ScAddr): ScLinkContent`

Create an ScLinkContent instance

## `scLinkContent.data`

Get link data

## `scLinkContent.type`

Get link type

## `scLinkContent.addr`

Get link addr

## `scLinkContent.typeToStr(): "binary" | "float" | "int" | "string"`

Transform type to string

## `scLinkContent.stringToType(type: "binary" | "float" | "int" | "string"): ScLinkContentType`

Transform string to type

# ScConstruction
With this class one can make constructions to create them later in sc-memory

First, one should describe construction structure, specifying all nodes, links and connectors with it's ScTypes.
If specified construction element should be used before the construction created it would be necessary to use optional alias parameters.

```ts
const content = new ScLinkContent(linkContent, ScLinkContentType.String),

const nodeAlias = "_node";
const linkAlias = "_link";

const linkContent = "my_content";
const construction = new ScConstruction();

construction.generateNode(ScType.ConstNode, nodeAlias);
construction.generateLink(
  ScType.ConstNodeLink,
  linkAlias
);
construction.generateConnector(
  ScType.ConstPermPosArc,
  nodeAlias,
  fakeNodeAddr
);
```

When described, construction may be passed to client to create it in sc-memory

```ts
  const res = await client.generateElements(construction);
```

## `construction.generateNode(type: ScType, alias?: string): void`

Add node to the construction

## `construction.generateLink(type: ScType, linkContent: ScLinkContent, alias?: string): void`

Add link to the construction

## `construction.generateConnector(type: ScType, source: string | ScAddr, target: string | ScAddr, alias?: string): void`

Add connector to the construction

## `construction.getIndex(alias: string): number`

Get an index of specified alias

# ScTemplate
With this class one can make temple to search or generate it in sc-memory, using `client.searchByTemplate` and `client.generateByTemplate`

```ts
const circuitDialogAlias = "_circuit_dialog";
const dialog = "_dialog";

const template = new ScTemplate();

template.quintuple(
  addr1,
  ScType.VarCommonArc,
  [ScType.VarNodeStructure, circuitDialogAlias],
  ScType.VarPermPosArc,
  addr2
);
template.triple(circuitDialogAlias, ScType.VarPermPosArc, [
  ScType.VarNode,
  dialog,
]);
```

```ts
  const searchResult = await client.searchByTemplate(template);
  const generateResult = await client.generateByTemplate(template);
```

## `template.triple(param1: ScTemplateParam, param2: ScTemplateParam, param3: ScTemplateParam): void`

Adds triple to your template. ScTemplateParam is described bellow:

```ts
type ScTemplateParamValue = string | ScAddr | ScType;
type ScTemplateParam = [ScTemplateParamValue, string] | ScTemplateParamValue;
```

## `template.quintuple(param1: ScTemplateParam, param2: ScTemplateParam, param3: ScTemplateParam, param4: ScTemplateParam, param5: ScTemplateParam): void`

Add quintuple to your template.

> Warning! It is necessary to follow the correct elements order as shown bellow

![elements order in quintuple](./docs/images/quintuple.jpg)

# ScType 
This class is an abstraction over type in sc-memory. It consists of static properties with different types, such as `NodeLink`, `NodeConst`, `NodeStructure`, `NodeVarTuple`, `ConstCommonArc`, `ConstPermPosArc`, etc. with corresponding check functions `isNode`, `isConnector`, and others.

```ts
const construction = new ScConstruction();

construction.generateNode(ScType.ConstNode);
```

# Build
```
yarn install
yarn build
```
