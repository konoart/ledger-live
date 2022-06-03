import { BigNumber } from "bignumber.js";
import { findSubAccountById, getAccountUnit } from "../../account";
import { formatCurrencyUnit, getTokenById } from "../../currencies";
import {
  fromTransactionCommonRaw,
  toTransactionCommonRaw,
} from "../../transaction/common";
import type { Account } from "../../types";
import { toTokenId } from "./logic";
import type {
  Command,
  StakeCreateAccountCommand,
  StakeDelegateCommand,
  StakeSplitCommand,
  StakeUndelegateCommand,
  StakeWithdrawCommand,
  TokenCreateATACommand,
  TokenTransferCommand,
  Transaction,
  TransactionRaw,
  TransferCommand,
} from "./types";
import { assertUnreachable } from "./utils";

export const fromTransactionRaw = (tr: TransactionRaw): Transaction => {
  const common = fromTransactionCommonRaw(tr);
  const { family, model } = tr;
  return {
    ...common,
    family,
    model: JSON.parse(model),
  };
};

export const toTransactionRaw = (t: Transaction): TransactionRaw => {
  const common = toTransactionCommonRaw(t);
  const { family, model } = t;
  return {
    ...common,
    family,
    model: JSON.stringify(model),
  };
};

const lamportsToSOL = (account: Account, amount: number) => {
  return formatCurrencyUnit(getAccountUnit(account), new BigNumber(amount), {
    showCode: true,
    disableRounding: true,
  });
};

export const formatTransaction = (
  tx: Transaction,
  mainAccount: Account
): string => {
  if (tx.model.commandDescriptor === undefined) {
    throw new Error("can not format unprepared transaction");
  }
  const { commandDescriptor } = tx.model;

  if (Object.keys(commandDescriptor.errors).length > 0) {
    throw new Error("can not format invalid transaction");
  }
  return formatCommand(mainAccount, tx, commandDescriptor.command);
};

function formatCommand(
  mainAccount: Account,
  tx: Transaction,
  command: Command
) {
  switch (command.kind) {
    case "transfer":
      return formatTransfer(mainAccount, tx, command);
    case "token.transfer":
      return formatTokenTransfer(mainAccount, tx, command);
    case "token.createATA":
      return formatCreateATA(command);
    case "token.closeATA":
      return formatCloseATA(mainAccount, tx);
    case "stake.createAccount":
      return formatStakeCreateAccount(mainAccount, tx, command);
    case "stake.delegate":
      return formatStakeDelegate(command);
    case "stake.undelegate":
      return formatStakeUndelegate(command);
    case "stake.withdraw":
      return formatStakeWithdraw(mainAccount, tx, command);
    case "stake.split":
      return formatStakeSplit(mainAccount, tx, command);
    default:
      return assertUnreachable(command);
  }
}

function formatStakeCreateAccount(
  mainAccount: Account,
  tx: Transaction,
  command: StakeCreateAccountCommand
) {
  const amount = lamportsToSOL(
    mainAccount,
    command.amount + command.stakeAccRentExemptAmount
  );
  const str = [
    `  CREATE STAKE ACCOUNT: ${command.stakeAccAddress}`,
    `  FROM: ${command.fromAccAddress}`,
    `  AMOUNT: ${amount}${tx.useAllAmount ? " (ALL)" : ""}`,
    `  SEED: ${command.seed}`,
    `  VALIDATOR: ${command.delegate.voteAccAddress}`,
  ]
    .filter(Boolean)
    .join("\n");

  return "\n" + str;
}

function formatTransfer(
  mainAccount: Account,
  tx: Transaction,
  command: TransferCommand
) {
  const amount = lamportsToSOL(mainAccount, command.amount);
  const str = [
    `  SEND: ${amount}${tx.useAllAmount ? " (ALL)" : ""}`,
    `  TO: ${command.recipient}`,
    command.memo ? `  MEMO: ${command.memo}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return "\n" + str;
}

function formatTokenTransfer(
  mainAccount: Account,
  tx: Transaction,
  command: TokenTransferCommand
) {
  if (!tx.subAccountId) {
    throw new Error("expected subaccountId on transaction");
  }
  const subAccount = findSubAccountById(mainAccount, tx.subAccountId);
  if (!subAccount || subAccount.type !== "TokenAccount") {
    throw new Error("token subaccount expected");
  }
  const amount = formatCurrencyUnit(
    getAccountUnit(subAccount),
    new BigNumber(command.amount),
    {
      showCode: true,
      disableRounding: true,
    }
  );
  const recipient = command.recipientDescriptor.walletAddress;
  const str = [
    `  SEND: ${amount}${tx.useAllAmount ? " (ALL)" : ""}`,
    `  TO: ${recipient}`,
    command.memo ? `  MEMO: ${command.memo}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return "\n" + str;
}

function formatCreateATA(command: TokenCreateATACommand) {
  const token = getTokenById(toTokenId(command.mint));
  return ["", `  OPT IN TOKEN: ${token.ticker}`].join("\n");
}

function formatCloseATA(mainAccount: Account, tx: Transaction) {
  if (tx.model.kind !== "token.closeATA") {
    throw new Error("expected <token.closeATA> transaction");
  }

  const subAccount = findSubAccountById(
    mainAccount,
    tx.model.uiState.subAccountId
  );

  if (!subAccount || subAccount.type !== "TokenAccount") {
    throw new Error("token subaccount expected");
  }

  const token = getTokenById(subAccount.token.id);
  return ["", `  OPT OUT TOKEN: ${token.ticker}`].join("\n");
}

function formatStakeDelegate(command: StakeDelegateCommand) {
  return [
    "",
    `  DELEGATE: ${command.stakeAccAddr}`,
    `  TO: ${command.voteAccAddr}`,
  ].join("\n");
}

function formatStakeUndelegate(command: StakeUndelegateCommand) {
  return ["", `  UNDELEGATE: ${command.stakeAccAddr}`].join("\n");
}

function formatStakeWithdraw(
  mainAccount: Account,
  tx: Transaction,
  command: StakeWithdrawCommand
) {
  const amount = lamportsToSOL(mainAccount, command.amount);
  return [
    "",
    `  WITHDRAW FROM: ${command.stakeAccAddr}`,
    `  AMOUNT: ${amount}${tx.useAllAmount ? " (ALL)" : ""}`,
    `  TO: ${command.toAccAddr}`,
  ].join("\n");
}

function formatStakeSplit(
  mainAccount: Account,
  tx: Transaction,
  command: StakeSplitCommand
) {
  const amount = lamportsToSOL(mainAccount, command.amount);
  return [
    "",
    `  SPLIT: ${command.stakeAccAddr}`,
    `  AMOUNT: ${amount}${tx.useAllAmount ? " (ALL)" : ""}`,
    `  TO: ${command.splitStakeAccAddr}`,
  ].join("\n");
}

export default {
  formatTransaction,
  fromTransactionRaw,
  toTransactionRaw,
};
