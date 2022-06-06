import { Account, TokenAccount } from "@ledgerhq/live-common/lib/types";
import React, { useState } from "react";
import Modal from "../../../components/Modal";
import Body from "./Body";
import { StepId } from "./types";

const INITIAL_STEP: StepId = "tokens";

type OptOutFlowModalProps = {
  name: string;
  account: TokenAccount;
  parentAccount: Account;
};

export type OptOutFlowModalData = {
  account: TokenAccount;
  parentAccount: Account;
};

export default function OptOutFlowModal({ name: modalName }: OptOutFlowModalProps) {
  const [step, setStep] = useState<StepId>(INITIAL_STEP);
  const isModalLocked = step !== "tokens";

  return (
    <Modal
      name={modalName}
      centered
      refocusWhenChange={step}
      preventBackdropClick={isModalLocked}
      render={({ data }: { data: OptOutFlowModalData }) => {
        return <Body stepId={step} modalName={modalName} onChangeStepId={setStep} params={data} />;
      }}
    />
  );
}
