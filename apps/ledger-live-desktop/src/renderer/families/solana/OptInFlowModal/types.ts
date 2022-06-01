import { TFunction } from "react-i18next";
import { Device } from "@ledgerhq/live-common/lib/hw/actions/types";
//import { Step } from '../../../../renderer/components/Stepper'

import {
  Account,
  TransactionStatus,
  Operation,
  AccountLike,
} from "@ledgerhq/live-common/lib/types";

import { Transaction } from "@ledgerhq/live-common/lib/families/solana/types";

export type StepId = "tokens" | "connectDevice" | "confirmation";

export type Step = {
  //t: TFunction,
  //transitionTo: (step: string) => void,
  id: StepId;
  label?: React.ReactNode;
  excludeFromBreadcrumb?: boolean;
  component: React.FC<StepperProps>;
  footer?: React.FC<StepperProps>;
  onBack?: (props: StepperProps) => void;
  noScroll?: boolean;
};

export type StepperProps = {
  // stepper props
  t: TFunction;
  title?: string;
  stepId: StepId;
  onStepChange: (step: StepId) => void;
  steps: Step[];
  hideBreadcrumb?: boolean;
  onClose: () => void;
  disabledSteps?: number[];
  errorSteps?: number[];
  error?: Error;
  signed?: boolean;
  params?: any;
  hideCloseButton?: boolean;
  transitionTo: (step: string) => void;

  // some steps require
  account: AccountLike;
  transaction: Transaction;
  status: TransactionStatus;
  onTransactionError: (error: Error) => void;
  onOperationBroadcasted: (op: Operation) => void;
  setSigned: (signed: boolean) => void;
  //parentAccount: ?Account,
  //onConfirmationHandler?: Function,
  //onFailHandler?: Function,
};

/*
export type StepProps = {
  t: TFunction,
  //transitionTo: string => void,
  device: ?Device,
  account: ?Account,
  parentAccount: ?Account,
  onRetry: void => void,
  onClose: () => void,
  openModal: (key: string, config?: any) => void,
  optimisticOperation: *,
  error: *,
  warning: *,
  signed: boolean,
  transaction: ?Transaction,
  status: TransactionStatus,
  onChangeTransaction: Transaction => void,
  onUpdateTransaction: ((Transaction) => Transaction) => void,
  onTransactionError: Error => void,
  onOperationBroadcasted: Operation => void,
  setSigned: boolean => void,
  bridgePending: boolean,
};

export type St = Step<StepId, StepProps>;
*/
