import { ScAddr } from "./ScAddr";
import { ScClient } from "./ScClient";
import { ScEvent, ScEventType } from "./ScEvent";
import { ScEventParams } from "./ScEventParams";
import { ScTemplate } from "./ScTemplate";
import { ScTemplateResult } from "./ScTemplateResult";
import { ScType } from "./ScType";

export type CallbackAddElement = (addr: ScAddr) => Promise<void>;
export type CallbackRemoveElement = (addr: ScAddr) => Promise<void>;
export type CallbackInitialize = (addrs: ScAddr[]) => Promise<void>;

/* This class controls elements append/remove for a specified sc-set.
 * After creation it subscribe to add/remove output edge events and emit callbacks on them.
 * onInitialize - callback that calls with all existing elements in set (on creation moment)
 * onAdd - callback that calls for each added element (after initialization)
 * onRemove - callback that calls for each element that removed from a set
 */
export class ScSet {
  /**
   * We store map that contains edge targets for each edge add.
   * In future remove and add events will provide target of edge, but right now they don't.
   * And when we receive event on item remove, edge already doesn't exist to get target.
   */
  private _elements: { [id: number]: ScAddr } = {};

  private _scClient: ScClient | null = null;
  private _addr: ScAddr | null = null; // ScAddr of set
  private _onAdd: CallbackAddElement | null = null;
  private _onRemove: CallbackRemoveElement | null = null;
  private _onInitialize: CallbackInitialize | null = null;
  private _filterType: ScType | null | undefined = null; // just elements with this type will be processed by set

  private _evtAddElement: ScEvent | undefined;
  private _evtRemoveElement: ScEvent | undefined;

  constructor(
    scClient: ScClient,
    addr: ScAddr,
    onInitialize: CallbackInitialize,
    onAdd: CallbackAddElement,
    onRemove: CallbackRemoveElement,
    filterType?: ScType
  ) {
    this._scClient = scClient;
    this._addr = addr;
    this._onInitialize = onInitialize;
    this._onAdd = onAdd;
    this._onRemove = onRemove;
    this._filterType = filterType;

    if (!this._addr || !this._addr.isValid())
      throw `Invalid addr of set: ${this._addr}`;
  }

  public async initialize(): Promise<void> {
    // subscribe to events
    if (!this._addr) return;

    const events = await this._scClient?.eventsCreate([
      new ScEventParams(
        this._addr,
        ScEventType.AddOutgoingEdge,
        this.onEventAddElement.bind(this)
      ),
      new ScEventParams(
        this._addr,
        ScEventType.RemoveOutgoingEdge,
        this.onEventRemoveElement.bind(this)
      ),
    ]);

    this._evtAddElement = events?.[0];
    this._evtRemoveElement = events?.[1];

    await this.iterateExistingElements();

    return new Promise<void>(function (resolve) {
      resolve();
    });
  }

  private async shouldAppend(addrs: ScAddr[]): Promise<boolean[] | undefined> {
    const types = await this._scClient?.checkElements(addrs);
    const result = types?.map((t: ScType) => {
      return !(
        this._filterType &&
        (this._filterType.value & t.value) !== this._filterType.value
      );
    });

    return new Promise<boolean[] | undefined>(function (resolve) {
      resolve(result);
    });
  }

  private async onEventAddElement(
    setAddr: ScAddr,
    edgeAddr: ScAddr,
    itemAddr: ScAddr
  ): Promise<void> {
    if (!this._elements[edgeAddr.value]) {
      if (itemAddr.isValid()) {
        const checks = await this.shouldAppend([itemAddr]);
        const append = checks?.[0];
        if (append) {
          this._elements[edgeAddr.value] = itemAddr;
          this.callOnAdd(itemAddr);
        }
      }
    }

    return new Promise<void>(function (resolve) {
      resolve();
    });
  }

  private async onEventRemoveElement(
    setAddr: ScAddr,
    edgeAddr: ScAddr
  ): Promise<void> {
    const trg: ScAddr = this._elements[edgeAddr.value];
    if (!trg)
      throw `Invalid state of set: ${this._addr} (try to remove element ${edgeAddr}, that doesn't exist)`;

    await this.callOnRemove(trg);
    delete this._elements[edgeAddr.value];

    return new Promise<void>(function (resolve) {
      resolve();
    });
  }

  private async callOnInitialize(addrs: ScAddr[]): Promise<void> {
    if (this._onInitialize) {
      await this._onInitialize(addrs);
    }
    return new Promise<void>(function (resolve) {
      resolve();
    });
  }

  private async callOnAdd(addr: ScAddr): Promise<void> {
    if (this._onAdd) {
      await this._onAdd(addr);
    }

    return new Promise<void>(function (resolve) {
      resolve();
    });
  }

  private async callOnRemove(addr: ScAddr): Promise<void> {
    if (this._onRemove) {
      await this._onRemove(addr);
    }

    return new Promise<void>(function (resolve) {
      resolve();
    });
  }

  private async iterateExistingElements(): Promise<void> {
    if (!this._addr || !this._scClient) return;

    const elements: ScAddr[] = [];

    const templ: ScTemplate = new ScTemplate();
    templ.triple(
      this._addr,
      [ScType.EdgeAccessVarPosPerm, "_edge"],
      [ScType.Unknown, "_item"]
    );

    const searchRes = await this._scClient.templateSearch(templ);
    const forCheck =
      searchRes?.map((v: ScTemplateResult) => v.get("_item")) || [];

    const shouldAdd = await this.shouldAppend(forCheck);

    for (let i = 0; i < searchRes.length; ++i) {
      if (!shouldAdd?.[i]) {
        continue;
      }

      const edge: ScAddr = searchRes[i].get("_edge");
      const trg: ScAddr = searchRes[i].get("_item");

      if (this._elements[edge.value]) {
        throw `Element ${trg} already exist in set`;
      }

      this._elements[edge.value] = trg;
      elements.push(trg);
    }

    await this.callOnInitialize(elements);

    return new Promise<void>(function (resolve) {
      resolve();
    });
  }

  /**
   * Add item to this set. If item alreay exist, then do nothing.
   * If element was added into set, then returns true; otherwise - false
   * @param el addr of set item to add
   */
  public async addItem(el: ScAddr): Promise<boolean | undefined> {
    if (!this._addr || !this._scClient) return;

    let result: boolean = false;
    const templ: ScTemplate = new ScTemplate();
    templ.triple(
      this._addr,
      [ScType.EdgeAccessVarPosPerm, "_edge"],
      [el, "_item"]
    );

    const searchRes = await this._scClient.templateSearch(templ);
    if (searchRes.length == 0) {
      const genRes = await this._scClient.templateGenerate(templ, {
        _item: el,
      });
      if (genRes) {
        const edge: ScAddr = genRes.get("_item");
        result = edge && edge.isValid();
      }
    }

    return new Promise<boolean>(function (resolve) {
      resolve(result);
    });
  }
}
