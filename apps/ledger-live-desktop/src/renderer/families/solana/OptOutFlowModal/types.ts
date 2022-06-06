import { Transaction } from "@ledgerhq/live-common/lib/families/solana/types";
import {
  Account,
  Operation,
  TokenAccount,
  TransactionStatus,
} from "@ledgerhq/live-common/lib/types";
import { TFunction } from "react-i18next";

export type StepId = "tokens" | "connectDevice" | "confirmation";

export type Step = {
  id: StepId;
  label?: React.ReactNode;
  excludeFromBreadcrumb?: boolean;
  component: React.FC<StepperProps>;
  footer?: React.FC<StepperProps>;
  onBack?: (props: StepperProps) => void;
  noScroll?: boolean;
};

export type StepperProps = {
  t: TFunction;
  title?: string;
  stepId: StepId;
  onStepChange: (step: Step) => void;
  steps: Step[];
  hideBreadcrumb?: boolean;
  onClose: () => void;
  disabledSteps?: number[];
  errorSteps?: number[];
  error?: Error;
  warning?: Error;
  signed?: boolean;
  hideCloseButton?: boolean;
  transitionTo: (step: string) => void;
  account: TokenAccount;
  parentAccount: Account;
  transaction: Transaction;
  status: TransactionStatus;
  onTransactionError: (error: Error) => void;
  onOperationBroadcasted: (op: Operation) => void;
  onUpdateTransaction: (updater: (tx: Transaction) => Transaction) => void;
  setSigned: (signed: boolean) => void;
  onRetry: () => void;
  optimisticOperation?: Operation;
  bridgePending: boolean;
};
