import { Account, AccountLike, TokenAccount } from "@ledgerhq/live-common/lib/types";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { openModal } from "~/renderer/actions/modals";
import IconCoins from "~/renderer/icons/Coins";

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

function mainAccActions(account: Account, dispatch: any, t: TFunction): Action[] {
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
  account: TokenAccount,
  parentAccount: Account,
  dispatch: any,
  t: TFunction,
): Action[] {
  const launchOptOutFlow = () =>
    dispatch(
      openModal("MODAL_SOLANA_OPT_OUT", {
        account,
      }),
    );

  const isZeroBalance = account.balance.isZero();

  return [
    {
      key: "solana.optOut",
      onClick: launchOptOutFlow,
      icon: IconCoins,
      // todo: transalte
      label: "Opt Out",
      disabled: !isZeroBalance,
      tooltip: isZeroBalance ? undefined : t("solana.optOut.mustBeZeroBalanceToOptOut"),
    },
  ];
}

export default AccountHeaderActions;
