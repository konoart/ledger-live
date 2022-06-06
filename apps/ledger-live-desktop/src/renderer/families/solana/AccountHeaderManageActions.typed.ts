import { Account, AccountLike, TokenAccount } from "@ledgerhq/live-common/lib/types";
import { tokenAccCloseableState } from "@ledgerhq/live-common/lib/families/solana/logic";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { openModal } from "~/renderer/actions/modals";
import IconCoins from "~/renderer/icons/Coins";
import { sweetch } from "@ledgerhq/live-common/lib/families/solana/utils";
import { OptOutFlowModalData } from "./OptOutFlowModal";

type Props = {
  account: AccountLike;
  parentAccount?: Account;
};

type Action = {
  disabled?: boolean;
  tooltip?: string;
  key: string;
  onClick: () => void;
  icon: IconCoins;
  label: string;
};

const AccountHeaderActions = ({ account, parentAccount }: Props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  if (account.type === "Account") {
    return mainAccActions(account, dispatch, t);
  }

  if (account.type === "TokenAccount") {
    if (!parentAccount) {
      throw new Error("parent account expected");
    }
    return tokenAccActions(account, parentAccount, dispatch, t);
  }

  return [];
};

function mainAccActions(
  account: Account,
  dispatch: ReturnType<typeof useDispatch>,
  t: TFunction,
): Action[] {
  const { solanaResources } = account;
  const launchStakingFlow = () => {
    dispatch(
      openModal(
        solanaResources && solanaResources.stakes.length > 0
          ? "MODAL_SOLANA_DELEGATE"
          : "MODAL_SOLANA_REWARDS_INFO",
        {
          account,
        },
      ),
    );
  };

  return [
    {
      key: "solana.stake",
      onClick: launchStakingFlow,
      icon: IconCoins,
      label: t("account.stake"),
    },
  ];
}

function tokenAccActions(
  tokenAccount: TokenAccount,
  account: Account,
  dispatch: ReturnType<typeof useDispatch>,
  t: TFunction,
): Action[] {
  const data: OptOutFlowModalData = {
    tokenAccount,
    account,
  };

  const launchOptOutFlow = () => dispatch(openModal("MODAL_SOLANA_OPT_OUT", data));

  const closeableState = tokenAccCloseableState(tokenAccount, account);

  return [
    {
      key: "solana.optOut",
      onClick: launchOptOutFlow,
      icon: IconCoins,
      label: t("solana.optOut.actionTitle"),
      disabled: !closeableState.closeable,
      tooltip: closeableState.closeable
        ? undefined
        : sweetch(closeableState.reason, {
            frozen: t("solana.optOut.nonCloseableAccReason.frozen"),
            nonZeroBalance: t("solana.optOut.nonCloseableAccReason.nonZeroBalance"),
          }),
    },
  ];
}

export default AccountHeaderActions;
