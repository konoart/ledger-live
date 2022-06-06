import { getAccountBridge } from "@ledgerhq/live-common/lib/bridge";
import { tokenAccCloseableState } from "@ledgerhq/live-common/lib/families/solana/logic";
import { TokenCloseATATransaction } from "@ledgerhq/live-common/lib/families/solana/types";
import { TokenAccount, TokenCurrency } from "@ledgerhq/live-common/lib/types";
import React from "react";
import { Trans } from "react-i18next";
import TrackPage from "~/renderer/analytics/TrackPage";
import Alert from "~/renderer/components/Alert";
import Box from "~/renderer/components/Box";
import Button from "~/renderer/components/Button";
import ErrorBanner from "~/renderer/components/ErrorBanner";
import AccountFooter from "~/renderer/modals/Send/AccountFooter";
import SplTokenSelector from "../../shared/fields/SplTokenSelector";
import { StepperProps } from "../types";

export default function StepTokens({
  account,
  tokenAccount,
  onUpdateTransaction,
  transaction,
  warning,
  error,
}: StepperProps) {
  const { model } = transaction;

  if (model.kind !== "token.closeATA") {
    throw new Error("expected <token.closeATA> tx, but got " + model.kind);
  }

  const bridge = getAccountBridge(account);

  const onTokenSelected = ({ id: tokenId }: TokenCurrency) => {
    onUpdateTransaction(transaction => {
      const model: TokenCloseATATransaction = {
        kind: "token.closeATA",
        uiState: {
          tokenId,
        },
      };
      return bridge.updateTransaction(transaction, { model });
    });
  };

  const closeableTokenAccs = (account.subAccounts ?? []).filter(
    (subAcc): subAcc is TokenAccount =>
      subAcc.type === "TokenAccount" && tokenAccCloseableState(subAcc, account).closeable,
  );

  const closeableTokens = closeableTokenAccs.map(({ token }) => token);

  return (
    <Box flow={1}>
      <TrackPage category="OptOut Flow" name="Step 1" />
      {warning && !error ? <ErrorBanner error={warning} warning /> : null}
      {error ? <ErrorBanner error={error} /> : null}
      <SplTokenSelector
        tokens={closeableTokens}
        selectedToken={tokenAccount.token}
        onTokenSelected={onTokenSelected}
      />
    </Box>
  );
}

export function StepTokensFooter({
  transitionTo,
  account,
  onClose,
  status,
  bridgePending,
}: StepperProps) {
  const { errors } = status;
  const hasErrors = Object.keys(errors).length;
  const canNext = !bridgePending && !hasErrors;

  return (
    <>
      <AccountFooter account={account} status={status} />
      <Box horizontal>
        <Button mr={1} secondary onClick={onClose}>
          <Trans i18nKey="common.cancel" />
        </Button>
        <Button disabled={!canNext} primary onClick={() => transitionTo("connectDevice")}>
          <Trans i18nKey="common.continue" />
        </Button>
      </Box>
    </>
  );
}
