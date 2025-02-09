import { useAuth } from '../../contexts/AuthContext';
import { Message as MessageType } from '../../contexts/MessagingContext';
import { cn } from '../../lib/utils';

type MessageProps = {
  message: MessageType;
  isCurrentUser: boolean;
};

export function Message({ message, isCurrentUser }: MessageProps) {
  return (
    <div className={cn(
      'flex flex-col gap-1 p-2 rounded-lg max-w-[80%]',
      isCurrentUser ? 'ml-auto bg-blue-500 text-white' : 'mr-auto bg-gray-100'
    )}>
      <div className="text-sm">{message.content}</div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
        {isCurrentUser && (
          <span className={cn(
            'w-2 h-2 rounded-full',
            message.read ? 'bg-green-400' : 'bg-gray-400'
          )} />
        )}
      </div>
    </div>
  );
}
