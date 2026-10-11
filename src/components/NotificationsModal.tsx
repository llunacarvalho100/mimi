import React from 'react';
import { X, Bell, Heart, MessageCircle, Music, Check, Trash2, Mail } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  onNotificationClick: (notif: AppNotification) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearNotifications,
  onNotificationClick,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'reminder':
        return <Mail className="w-4 h-4 text-rose-500" />;
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-sky-500" />;
      case 'music':
        return <Music className="w-4 h-4 text-indigo-500" />;
      default:
        return <Bell className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Notificações de Interações
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <span>{notifications.length} notificações registradas</span>
          <div className="flex items-center gap-3">
            <button
              onClick={onMarkAllAsRead}
              className="text-rose-600 hover:underline flex items-center gap-1 font-medium"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Marcar todas como lidas</span>
            </button>
            <button
              onClick={onClearNotifications}
              className="text-slate-400 hover:text-rose-500 transition-colors"
              title="Limpar tudo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Nenhuma notificação nova no momento.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => onNotificationClick(notif)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  notif.read
                    ? 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-75'
                    : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 shadow-xs'
                }`}
              >
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs shrink-0">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                    <span className="font-bold">{notif.actorName}</span> {notif.message}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{notif.timestamp}</p>
                </div>

                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-2" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
