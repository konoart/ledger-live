import { toTokenMint } from "@ledgerhq/live-common/lib/families/solana/logic";
import { TokenCurrency } from "@ledgerhq/live-common/lib/types";
import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import Box from "~/renderer/components/Box";
import FirstLetterIcon from "~/renderer/components/FirstLetterIcon";
import Select from "~/renderer/components/Select";
import Text from "~/renderer/components/Text";
import ToolTip from "~/renderer/components/Tooltip";
import ExclamationCircleThin from "~/renderer/icons/ExclamationCircleThin";

type TokenSelectorProps = {
  tokens: TokenCurrency[];
  selectedToken?: TokenCurrency;
  onTokenSelected: (token: TokenCurrency) => void;
};

export default function SplTokenSelector({
  tokens,
  selectedToken,
  onTokenSelected,
}: TokenSelectorProps) {
  const [query, setQuery] = useState("");
  const { t } = useTranslation();

  return (
    <Box flow={1} mb={4}>
      <Select
        value={selectedToken}
        options={tokens}
        getOptionValue={({ name }: TokenCurrency) => name}
        renderValue={renderItem}
        renderOption={renderItem}
        onInputChange={setQuery}
        inputValue={query}
        placeholder={t("solana.optIn.flow.steps.tokens.selectLabel")}
        noOptionsMessage={({ inputValue }: { inputValue: string }) =>
          t("common.selectNoResults", { query: inputValue })
        }
        onChange={onTokenSelected}
      />
    </Box>
  );
}

const renderItem = ({
  data: { id, name },
  isDisabled,
}: {
  data: TokenCurrency;
  isDisabled: boolean;
}) => {
  const mint = toTokenMint(id);
  return (
    <Box
      key={id}
      horizontal
      alignItems="center"
      color={isDisabled ? "palette.text.shade40" : "palette.text.shade100"}
      justifyContent="space-between"
    >
      <Box horizontal alignItems="center" justifyContent="flex-start">
        <FirstLetterIcon
          color={isDisabled ? "palette.text.shade40" : "palette.text.shade100"}
          label={name}
          mr={2}
        />
        <Text ff="Inter|Medium">{name}</Text>
        <Text fontSize={3} color="palette.text.shade40">
          - Token {mint}
        </Text>
      </Box>
      {isDisabled && (
        <ToolTip content={<Trans i18nKey="solana.optIn.flow.steps.tokens.disabledTooltip" />}>
          <Box color="warning">
            <ExclamationCircleThin size={16} />
          </Box>
        </ToolTip>
      )}
    </Box>
  );
};
