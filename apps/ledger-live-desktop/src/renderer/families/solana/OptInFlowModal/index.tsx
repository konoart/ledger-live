import { Account } from "@ledgerhq/live-common/lib/types";
import React, { useState } from "react";
import Modal from "../../../components/Modal";
import Body from "./Body";
import { StepId } from "./types";

const INITIAL_STEP: StepId = "tokens";

type OptInFlowModalProps = {
  name: string;
  account: Account;
};

export default function OptInFlowModal({ name: modalName }: OptInFlowModalProps) {
  const [step, setStep] = useState<StepId>(INITIAL_STEP);
  const isModalLocked = step !== "tokens";

  return (
    <Modal
      name={modalName}
      centered
      refocusWhenChange={step}
      preventBackdropClick={isModalLocked}
      render={({ data }: { data: { account: Account } }) => {
        return <Body stepId={step} modalName={modalName} onChangeStepId={setStep} params={data} />;
      }}
    />
  );
}
