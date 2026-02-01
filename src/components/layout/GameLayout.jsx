import { cn } from '../../lib/utils';
import Header from './Header';

export default function GameLayout({
  children,
  roomCode,
  showCode = true,
  title,
  onBack,
  headerRight,
  className = '',
  noPadding = false,
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header
        roomCode={roomCode}
        showCode={showCode}
        title={title}
        onBack={onBack}
        rightContent={headerRight}
      />

      <main
        className={cn(
          'flex-1 w-full max-w-2xl mx-auto',
          !noPadding && 'px-4 py-6',
          'safe-area-bottom',
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}
