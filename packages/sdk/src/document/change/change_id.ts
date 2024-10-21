/*
 * Copyright 2020 The Yorkie Authors. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  ActorID,
  InitialActorID,
} from '@yorkie-js-sdk/src/document/time/actor_id';
import { TimeTicket } from '@yorkie-js-sdk/src/document/time/ticket';

/**
 * `ChangeID` is for identifying the Change. This is immutable.
 */
export class ChangeID {
  private clientSeq: number;

  // `serverSeq` is optional and only present for changes stored on the server.
  private serverSeq?: bigint;

  private lamport: bigint;
  private actor: ActorID;

  constructor(
    clientSeq: number,
    lamport: bigint,
    actor: ActorID,
    serverSeq?: bigint,
  ) {
    this.clientSeq = clientSeq;
    this.serverSeq = serverSeq;
    this.lamport = lamport;
    this.actor = actor;
  }

  /**
   * `of` creates a new instance of ChangeID.
   */
  public static of(
    clientSeq: number,
    lamport: bigint,
    actor: ActorID,
    serverSeq?: bigint,
  ): ChangeID {
    return new ChangeID(clientSeq, lamport, actor, serverSeq);
  }

  /**
   * `next` creates a next ID of this ID.
   */
  public next(): ChangeID {
    return new ChangeID(this.clientSeq + 1, this.lamport + 1n, this.actor);
  }

  /**
   * `syncLamport` syncs lamport timestamp with the given ID.
   *
   * {@link https://en.wikipedia.org/wiki/Lamport_timestamps#Algorithm}
   */
  public syncLamport(otherLamport: bigint): ChangeID {
    if (otherLamport > this.lamport) {
      return new ChangeID(this.clientSeq, otherLamport, this.actor);
    }

    return new ChangeID(this.clientSeq, this.lamport + 1n, this.actor);
  }

  /**
   * `createTimeTicket` creates a ticket of the given delimiter.
   */
  public createTimeTicket(delimiter: number): TimeTicket {
    return TimeTicket.of(this.lamport, delimiter, this.actor);
  }

  /**
   * `setActor` sets the given actor.
   */
  public setActor(actorID: ActorID): ChangeID {
    return new ChangeID(this.clientSeq, this.lamport, actorID, this.serverSeq);
  }

  /**
   * `getClientSeq` returns the client sequence of this ID.
   */
  public getClientSeq(): number {
    return this.clientSeq;
  }

  /**
   * `getServerSeq` returns the server sequence of this ID.
   */
  public getServerSeq(): string {
    if (this.serverSeq) {
      return this.serverSeq.toString();
    }
    return '';
  }

  /**
   * `getLamport` returns the lamport clock of this ID.
   */
  public getLamport(): bigint {
    return this.lamport;
  }

  /**
   * `getLamportAsString` returns the lamport clock of this ID as a string.
   */
  public getLamportAsString(): string {
    return this.lamport.toString();
  }

  /**
   * `getActorID` returns the actor of this ID.
   */
  public getActorID(): string {
    return this.actor;
  }

  /**
   * `toTestString` returns a string containing the meta data of this ID.
   */
  public toTestString(): string {
    return `${this.lamport.toString()}:${this.actor.slice(-2)}:${
      this.clientSeq
    }`;
  }
}

/**
 * `InitialChangeID` represents the initial state ID. Usually this is used to
 * represent a state where nothing has been edited.
 */
export const InitialChangeID = new ChangeID(0, 0n, InitialActorID);
