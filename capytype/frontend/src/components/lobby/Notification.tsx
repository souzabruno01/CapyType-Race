import { notificationStyle } from '../../utils/styles';

interface NotificationProps {
  show: boolean;
  message: string;
}

export const Notification = ({ show, message }: NotificationProps) => {
  if (!show) return null;

  return (
    <div style={notificationStyle}>
      ✓ {message}
    </div>
  );
};
