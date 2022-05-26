import { assertUnreachable } from "@polkadot/util";
import { ParsedAccountData } from "@solana/web3.js";
import { create } from "superstruct";
import { PARSED_PROGRAMS } from "../program/constants";
import { ParsedInfo } from "../validators";
import { StakeAccountInfo } from "./stake";
import {
  MintAccountInfo,
  MultisigAccountInfo,
  TokenAccount,
  TokenAccountInfo,
} from "./token";
import { VoteAccount, VoteAccountInfo } from "./vote";

export type ParsedTokenAccountInfo =
  | {
      kind: "account";
      value: TokenAccountInfo;
    }
  | {
      kind: "mint";
      value: MintAccountInfo;
    }
  | {
      kind: "multisig";
      value: MultisigAccountInfo;
    };

export function parseTokenAccount(
  data: ParsedAccountData
): ParsedTokenAccountInfo {
  if (data.program !== PARSED_PROGRAMS.SPL_TOKEN) {
    throw new Error("expected spl token program");
  }
  const parsedInfo = create(data.parsed, ParsedInfo);
  const parsedAccount = create(parsedInfo.info, TokenAccount);
  switch (parsedAccount.type) {
    case "account":
      return {
        kind: "account",
        value: create(parsedInfo.info, TokenAccountInfo),
      };
    case "mint":
      return {
        kind: "mint",
        value: create(parsedInfo.info, MintAccountInfo),
      };
    case "multisig":
      return {
        kind: "multisig",
        value: create(parsedInfo.info, MultisigAccountInfo),
      };
    default:
      return assertUnreachable(parsedAccount.type);
  }
}

export function tryParseAsTokenAccount(
  data: ParsedAccountData
): TokenAccountInfo | undefined | Error {
  const routine = () => {
    const parsed = parseTokenAccount(data);
    return parsed.kind === "account" ? parsed.value : undefined;
  };

  return onThrowReturnError(routine);
}

export function parseVoteAccountInfo(info: unknown): VoteAccountInfo {
  return create(info, VoteAccountInfo);
}

export function tryParseAsVoteAccount(
  data: ParsedAccountData
): VoteAccountInfo | undefined | Error {
  const routine = () => {
    const info = create(data.parsed, ParsedInfo);

    if (data.program === PARSED_PROGRAMS.VOTE) {
      const parsed = create(info, VoteAccount);
      return parseVoteAccountInfo(parsed.info);
    }

    return undefined;
  };

  return onThrowReturnError(routine);
}

export function parseStakeAccountInfo(info: unknown): StakeAccountInfo {
  return create(info, StakeAccountInfo);
}

function onThrowReturnError<R>(fn: () => R) {
  try {
    return fn();
  } catch (e) {
    return e instanceof Error ? e : new Error(JSON.stringify(e));
  }
}
