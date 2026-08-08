import StampButton from "@/components/ui/StampButton";
import { useTranslation } from 'react-i18next';

interface PreorderSendButtonProps {
  enabled: boolean;
  sending: boolean;
  onSend: () => void;
}

export default function PreorderSendButton({ enabled, sending, onSend }: PreorderSendButtonProps) {
  const { t } = useTranslation('preorder');
  return (
    <StampButton tone="ink" onClick={onSend} disabled={!enabled || sending}>
      {sending ? t('sending') : t('sendOrderButton')}
    </StampButton>
  );
}