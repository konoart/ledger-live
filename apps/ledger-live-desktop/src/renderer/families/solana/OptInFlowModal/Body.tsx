import { UserRefusedOnDevice } from "@ledgerhq/errors";
import { addPendingOperation } from "@ledgerhq/live-common/lib/account";
import { getAccountBridge } from "@ledgerhq/live-common/lib/bridge";
import useBridgeTransaction from "@ledgerhq/live-common/lib/bridge/useBridgeTransaction";
import { SolanaTokenRequired } from "@ledgerhq/live-common/lib/errors";
import { Account, AccountLike, Operation } from "@ledgerhq/live-common/lib/types";
import React, { useCallback, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import logger from "~/logger/logger";
import { updateAccountWithUpdater } from "~/renderer/actions/accounts";
import { closeModal, openModal } from "~/renderer/actions/modals";
import Track from "~/renderer/analytics/Track";
import Stepper from "~/renderer/components/Stepper";
import GenericStepConnectDevice from "~/renderer/modals/Send/steps/GenericStepConnectDevice";
import { getCurrentDevice } from "~/renderer/reducers/devices";
import StepConfirmation, { StepConfirmationFooter } from "./steps/StepConfirmation";
import StepTokens, { StepTokensFooter } from "./steps/StepTokens";
import { Step, StepId, StepperProps } from "./types";

type BodyProps = {
  stepId: StepId;
  onChangeStepId: (step: StepId) => void;
  modalName: string;
  params: {
    account: AccountLike;
  };
};

const steps: Array<Step> = [
  {
    id: "tokens",
    label: <Trans i18nKey="solana.optIn.flow.steps.tokens.title" />,
    component: StepTokens,
    noScroll: true,
    footer: StepTokensFooter,
  },
  {
    id: "connectDevice",
    label: <Trans i18nKey="solana.optIn.flow.steps.connectDevice.title" />,
    component: GenericStepConnectDevice,
    onBack: ({ transitionTo }: StepperProps) => transitionTo("tokens"),
  },
  {
    id: "confirmation",
    label: <Trans i18nKey="solana.optIn.flow.steps.confirmation.title" />,
    component: StepConfirmation,
    footer: StepConfirmationFooter,
  },
];

export default function Body({ stepId, onChangeStepId, params, modalName }: BodyProps) {
  const [optimisticOperation, setOptimisticOperation] = useState(null);
  const [transactionError, setTransactionError] = useState(null);
  const [signed, setSigned] = useState(false);
  //const device = useSelector(getCurrentDevice);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const {
    transaction,
    setTransaction,
    updateTransaction,
    account,
    parentAccount,
    status,
    bridgeError,
    bridgePending,
  } = useBridgeTransaction(() => {
    const { account } = params;
    const bridge = getAccountBridge(account, undefined);
    if (account.type !== "Account") {
      throw new Error("account exptected");
    }
    const transaction = bridge.updateTransaction(bridge.createTransaction(account), {
      model: {
        kind: "token.createATA",
        uiState: {
          tokenId: "",
        },
      },
    });
    return { account, parentAccount: undefined, transaction };
  });

  if (!account) {
    throw new Error("account required");
  }

  if (transaction?.family !== "solana") {
    throw new Error("transaction required");
  }

  //const handleStepChange = useCallback(e => onChangeStepId(e.id), [onChangeStepId]);

  const handleRetry = () => {
    setTransactionError(null);
    onChangeStepId("tokens");
  };

  const handleTransactionError = useCallback((error: Error) => {
    if (!(error instanceof UserRefusedOnDevice)) {
      logger.critical(error);
    }
    setTransactionError(error);
  }, []);

  const handleOperationBroadcasted = (optimisticOperation: Operation) => {
    dispatch(
      updateAccountWithUpdater(account.id, account =>
        addPendingOperation(account, optimisticOperation),
      ),
    );
    setOptimisticOperation(optimisticOperation);
    setTransactionError(null);
  };

  const tokenStatusError =
    status.errors.token instanceof SolanaTokenRequired ? undefined : status.errors.token;

  const error = transactionError || bridgeError || tokenStatusError;
  const warning = status.warnings.token;

  const errorSteps = [];

  if (transactionError) {
    errorSteps.push(2);
  } else if (bridgeError) {
    errorSteps.push(0);
  }

  const stepperProps: StepperProps = {
    title: t("solana.optIn.flow.title"),
    //device,
    account,
    //parentAccount,
    transaction,
    signed,
    stepId,
    steps,
    errorSteps,
    disabledSteps: [],
    hideBreadcrumb: !!error || !!warning,
    onRetry: handleRetry,
    onStepChange: ({ id }: Step) => {
      return onChangeStepId(id);
    },
    onClose: () => {
      dispatch(closeModal(modalName));
      //return closeModal(modalName);
    },
    error,
    warning,
    status,
    optimisticOperation,
    //openModal,
    setSigned,
    onChangeTransaction: setTransaction,
    onUpdateTransaction: updateTransaction,
    onOperationBroadcasted: handleOperationBroadcasted,
    onTransactionError: handleTransactionError,
    t,
    //transitionTo
    bridgePending,
  } as any;

  return (
    <Stepper {...stepperProps}>
      <Track onUnmount event="CloseModalOptIn" />
    </Stepper>
  );
}
