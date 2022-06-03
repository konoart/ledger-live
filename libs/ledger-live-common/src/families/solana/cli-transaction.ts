import { findTokenByTicker, getTokenById } from "@ledgerhq/cryptoassets";
import invariant from "invariant";
import { getAccountCurrency } from "../../account";
import type {
  Account,
  AccountLike,
  AccountLikeArray,
  Transaction,
} from "../../types";
import { Transaction as SolanaTransaction } from "./types";
import { assertUnreachable } from "./utils";

const modes = [
  "send",
  "optIn",
  "optOut",
  "stake.createAccount",
  "stake.delegate",
  "stake.undelegate",
  "stake.withdraw",
  "stake.split",
] as const;
type Mode = typeof modes[number];

// some options already specified for other blockchains like ethereum.
// trying to reuse existing ones like <token>, <mode>, etc.
const options = [
  {
    name: "solanaValidator",
    type: String,
    desc: "validator address to delegate to",
  },
  {
    name: "solanaStakeAccount",
    type: String,
    desc: "stake account address to use in the transaction",
  },
];

function inferTransactions(
  transactions: Array<{
    account: AccountLike;
    mainAccount: Account;
    transaction: Transaction;
  }>,
  opts: Partial<Record<string, string>>
): Transaction[] {
  const mode = inferMode(opts.mode);

  // reusing ethereum token option, comes as array
  const tokens: string[] | undefined = opts.token as any;

  if (tokens !== undefined && tokens.length !== 1) {
    throw new Error("only 1 token at a time supported for solana transactions");
  }

  const token = tokens?.[0];

  return transactions.map(({ account, transaction }) => {
    if (transaction.family !== "solana") {
      throw new Error(
        `Solana family transaction expected, got <${transaction.family}>`
      );
    }
    switch (mode) {
      case "send":
        if (account.type === "Account") {
          const solanaTx: SolanaTransaction = {
            ...transaction,
            model: {
              kind: "transfer",
              uiState: {
                memo: opts.memo,
              },
            },
          };
          return solanaTx;
        } else {
          if (account.type !== "TokenAccount") {
            throw new Error("expected token account");
          }
          const subAccountId = account.id;
          const solanaTx: SolanaTransaction = {
            ...transaction,
            subAccountId,
            model: {
              kind: "token.transfer",
              uiState: {
                memo: opts.memo,
                subAccountId,
              },
            },
          };
          return solanaTx;
        }
      case "optIn": {
        if (token === undefined) {
          throw new Error("token required");
        }

        if (account.type !== "Account") {
          throw new Error("expected main account");
        }

        const tokenCurrency = findTokenByTicker(token) ?? getTokenById(token);

        const solanaTx: SolanaTransaction = {
          ...transaction,
          model: {
            kind: "token.createATA",
            uiState: {
              tokenId: tokenCurrency.id,
            },
          },
        };
        return solanaTx;
      }
      case "optOut": {
        if (token === undefined) {
          throw new Error("token required");
        }

        if (account.type !== "TokenAccount") {
          throw new Error("expected token account");
        }
        const subAccountId = account.id;

        const solanaTx: SolanaTransaction = {
          ...transaction,
          model: {
            kind: "token.closeATA",
            uiState: {
              subAccountId,
            },
          },
        };
        return solanaTx;
      }
      case "stake.createAccount": {
        const validator = opts.solanaValidator;
        return {
          ...transaction,
          model: {
            kind: "stake.createAccount",
            uiState: {
              delegate: {
                voteAccAddress: validator ?? "",
              },
            },
          },
        };
      }
      case "stake.delegate":
        return {
          ...transaction,
          model: {
            kind: "stake.delegate",
            uiState: {
              stakeAccAddr: opts.solanaStakeAccount ?? "",
              voteAccAddr: opts.solanaValidator ?? "",
            },
          },
        };
      case "stake.undelegate":
        return {
          ...transaction,
          model: {
            kind: "stake.undelegate",
            uiState: {
              stakeAccAddr: opts.solanaStakeAccount ?? "",
            },
          },
        };
      case "stake.withdraw":
        return {
          ...transaction,
          model: {
            kind: "stake.withdraw",
            uiState: {
              stakeAccAddr: opts.solanaStakeAccount ?? "",
            },
          },
        };
      case "stake.split":
        if (opts.solanaStakeAccount === undefined) {
          throw new Error("stake account is required");
        }

        return {
          ...transaction,
          model: {
            kind: "stake.split",
            uiState: {
              stakeAccAddr: opts.solanaStakeAccount,
            },
          },
        };
      default:
        return assertUnreachable(mode);
    }
  });
}

function inferAccounts(
  mainAccount: Account,
  opts: Record<string, string>
): AccountLikeArray {
  invariant(mainAccount.currency.family === "solana", "solana family currency");

  const mode = inferMode(opts.mode);

  switch (mode) {
    case "send":
    case "optOut": {
      if (!opts.token) {
        return [mainAccount];
      }

      // reusing ethereum token option, comes as array
      const tokens: string[] = opts.token as any;

      if (tokens.length !== 1) {
        throw new Error("only 1 token at a time supported for solana");
      }

      const token = tokens[0];

      const subAccount = mainAccount.subAccounts?.find((subAcc) => {
        const currency = getAccountCurrency(subAcc);
        return token === currency.ticker || token === currency.id;
      });

      if (subAccount === undefined) {
        throw new Error(
          "token account '" +
            opts.token +
            "' not found. Available: " +
            mainAccount.subAccounts
              ?.map((subAcc) => getAccountCurrency(subAcc).ticker)
              .join(", ")
        );
      }
      return [subAccount];
    }
    case "optIn":
    case "stake.createAccount":
    case "stake.delegate":
    case "stake.undelegate":
    case "stake.withdraw":
    case "stake.split":
      return [mainAccount];
    default:
      return assertUnreachable(mode);
  }
}

function inferMode(input?: string): Mode {
  const mode: Mode | undefined = input
    ? modes.some((m) => m === input)
      ? (input as Mode)
      : undefined
    : "send";

  if (mode === undefined) {
    throw new Error(
      `Unexpected mode <${mode}>. Supported modes: ${modes.join(", ")}`
    );
  }

  return mode;
}

export default {
  options,
  inferAccounts,
  inferTransactions,
};
