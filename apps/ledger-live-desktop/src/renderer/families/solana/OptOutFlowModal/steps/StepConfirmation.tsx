import { SyncOneAccountOnMount } from "@ledgerhq/live-common/lib/bridge/react";
import { listTokensForCryptoCurrency } from "@ledgerhq/live-common/lib/currencies";
import { TokenCurrency } from "@ledgerhq/live-common/lib/types";
import React, { useMemo } from "react";
import { Trans } from "react-i18next";
import styled, { withTheme } from "styled-components";
import TrackPage from "~/renderer/analytics/TrackPage";
import Box from "~/renderer/components/Box";
import BroadcastErrorDisclaimer from "~/renderer/components/BroadcastErrorDisclaimer";
import Button from "~/renderer/components/Button";
import ErrorDisplay from "~/renderer/components/ErrorDisplay";
import RetryButton from "~/renderer/components/RetryButton";
import SuccessDisplay from "~/renderer/components/SuccessDisplay";
import { OperationDetails } from "~/renderer/drawers/OperationDetails";
import { setDrawer } from "~/renderer/drawers/Provider";
import { ThemedComponent } from "~/renderer/styles/StyleProvider";
import { StepperProps } from "../types";

const Container: ThemedComponent<{ shouldSpace?: boolean }> = styled(Box).attrs(() => ({
  alignItems: "center",
  grow: true,
  color: "palette.text.shade100",
}))`
  justify-content: ${(p: any) => (p.shouldSpace ? "space-between" : "center")};
`;

function StepConfirmation({
  account,
  optimisticOperation,
  error,
  signed,
  transaction,
}: StepperProps) {
  if (account.type !== "Account") {
    throw new Error("account expected");
  }
  const { model } = transaction;

  if (model.kind !== "token.createATA") {
    throw new Error("expected <token.createATA> transaction");
  }

  const options = listTokensForCryptoCurrency(account.currency);

  const token: TokenCurrency | undefined = useMemo(
    () => options.find(({ id }) => id === model.uiState.tokenId),
    [options, model.uiState.tokenId],
  );

  if (optimisticOperation) {
    return (
      <Container>
        <TrackPage category="Solna SPL Token Opt In Flow" name="Step Confirmed" />
        <SyncOneAccountOnMount priority={10} accountId={optimisticOperation.accountId} />
        <SuccessDisplay
          title={
            <Trans
              i18nKey={`solana.optIn.flow.steps.confirmation.success.title`}
              values={{ token: token?.name }}
            />
          }
          description={
            <div>
              <Trans
                i18nKey={`solana.optIn.flow.steps.confirmation.success.text`}
                values={{ token: token?.name }}
              />
            </div>
          }
        />
      </Container>
    );
  }

  if (error) {
    return (
      <Container shouldSpace={signed}>
        <TrackPage category="Solana SPL Token Opt In Flow" name="Step Confirmation Error" />
        {signed ? (
          <BroadcastErrorDisclaimer title={<Trans i18nKey="solana.common.broadcastError" />} />
        ) : null}
        <ErrorDisplay error={error} withExportLogs />
      </Container>
    );
  }

  return null;
}

export function StepConfirmationFooter({
  account,
  onRetry,
  error,
  onClose,
  optimisticOperation,
}: StepperProps) {
  const concernedOperation = optimisticOperation
    ? optimisticOperation.subOperations && optimisticOperation.subOperations.length > 0
      ? optimisticOperation.subOperations[0]
      : optimisticOperation
    : null;

  return (
    <Box horizontal alignItems="right">
      <Button ml={2} onClick={onClose}>
        <Trans i18nKey="common.close" />
      </Button>
      {concernedOperation ? (
        <Button
          primary
          ml={2}
          event="Solana SPL Token Opt In Flow OpD Clicked"
          onClick={() => {
            onClose();
            if (account && concernedOperation) {
              setDrawer(OperationDetails, {
                operationId: concernedOperation.id,
                accountId: account.id,
              });
            }
          }}
        >
          <Trans i18nKey="solana.common.viewDetails" />
        </Button>
      ) : error ? (
        <RetryButton primary ml={2} onClick={onRetry} />
      ) : null}
    </Box>
  );
}

export default withTheme(StepConfirmation);
