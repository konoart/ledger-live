import { UserRefusedOnDevice } from "@ledgerhq/errors";
import { addPendingOperation } from "@ledgerhq/live-common/lib/account";
import { getAccountBridge } from "@ledgerhq/live-common/lib/bridge";
import useBridgeTransaction from "@ledgerhq/live-common/lib/bridge/useBridgeTransaction";
import { SolanaTokenRequired } from "@ledgerhq/live-common/lib/errors";
import {
  TokenCloseATATransaction,
  Transaction,
} from "@ledgerhq/live-common/lib/families/solana/types";
import { Account, Operation, TokenAccount } from "@ledgerhq/live-common/lib/types";
import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import logger from "~/logger/logger";
import { updateAccountWithUpdater } from "~/renderer/actions/accounts";
import { closeModal } from "~/renderer/actions/modals";
import Track from "~/renderer/analytics/Track";
import Stepper from "~/renderer/components/Stepper";
import GenericStepConnectDevice from "~/renderer/modals/Send/steps/GenericStepConnectDevice";
import StepConfirmation, { StepConfirmationFooter } from "./steps/StepConfirmation";
import StepTokens, { StepTokensFooter } from "./steps/StepTokens";
import { Step, StepId, StepperProps } from "./types";

type BodyProps = {
  stepId: StepId;
  onChangeStepId: (step: StepId) => void;
  modalName: string;
  params: {
    tokenAccount: TokenAccount;
    account: Account;
  };
};

const steps: Array<Step> = [
  {
    id: "tokens",
    label: <Trans i18nKey="solana.optOut.flow.steps.tokens.title" />,
    component: StepTokens,
    noScroll: true,
    footer: StepTokensFooter,
  },
  {
    id: "connectDevice",
    label: <Trans i18nKey="solana.common.connectDevice.title" />,
    component: GenericStepConnectDevice,
  },
  {
    id: "confirmation",
    label: <Trans i18nKey="solana.common.confirmation.title" />,
    component: StepConfirmation,
    footer: StepConfirmationFooter,
  },
];

export default function Body({ stepId, onChangeStepId, params, modalName }: BodyProps) {
  const [optimisticOperation, setOptimisticOperation] = useState<Operation | undefined>(undefined);
  const [transactionError, setTransactionError] = useState(null);
  const [signed, setSigned] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { tokenAccount, account: account } = params;

  const {
    transaction,
    updateTransaction,
    status,
    bridgeError,
    bridgePending,
  } = useBridgeTransaction(() => {
    const bridge = getAccountBridge(account);
    const model: TokenCloseATATransaction = {
      kind: "token.closeATA",
      uiState: {
        tokenId: tokenAccount.token.id,
      },
    };
    const transaction: Transaction = bridge.updateTransaction(bridge.createTransaction(account), {
      model,
    });

    return { account, transaction };
  });

  if (transaction?.family !== "solana") {
    throw new Error("transaction required");
  }

  const handleRetry = () => {
    setTransactionError(null);
    onChangeStepId("tokens");
  };

  const handleTransactionError = (error: Error) => {
    if (!(error instanceof UserRefusedOnDevice)) {
      logger.critical(error);
    }
    setTransactionError(error);
  };

  const handleOperationBroadcasted = (optimisticOperation: Operation) => {
    dispatch(
      updateAccountWithUpdater(account.id, (account: Account) =>
        addPendingOperation(account, optimisticOperation),
      ),
    );
    setOptimisticOperation(optimisticOperation);
    setTransactionError(null);
  };

  const tokenStatusError =
    status.errors.token instanceof SolanaTokenRequired ? undefined : status.errors.token;

  const error = transactionError || bridgeError || tokenStatusError || status.errors.fee;
  const warning = status.warnings.token;

  const errorSteps = transactionError ? [2] : bridgeError ? [0] : [];

  const stepperProps: StepperProps = {
    title: t("solana.optOut.flow.title"),
    account,
    transaction,
    tokenAccount,
    signed,
    stepId,
    steps,
    errorSteps,
    disabledSteps: [],
    hideBreadcrumb: !!error || !!warning,
    onRetry: handleRetry,
    onStepChange: ({ id }: Step) => onChangeStepId(id),
    onClose: () => dispatch(closeModal(modalName)),
    error,
    warning,
    status,
    optimisticOperation,
    setSigned,
    onUpdateTransaction: updateTransaction as any,
    onOperationBroadcasted: handleOperationBroadcasted,
    onTransactionError: handleTransactionError,
    t,
    // correct fn will be provided by stepper to each step
    transitionTo: (_stepId: string) => {},
    bridgePending,
  };

  return (
    <Stepper {...stepperProps}>
      <Track onUnmount event="CloseModalOptOut" />
    </Stepper>
  );
}
