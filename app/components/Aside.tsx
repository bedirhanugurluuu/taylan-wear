import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
  useId,
} from 'react';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

export function Aside({
  children,
  heading,
  type,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;
  const id = useId();

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.body.style.overflow = 'hidden';
      document.addEventListener(
        'keydown',
        function handler(event: KeyboardEvent) {
          if (event.key === 'Escape') {
            close();
          }
        },
        {signal: abortController.signal},
      );
    }

    return () => {
      abortController.abort();
      if (expanded) document.body.style.overflow = '';
    };
  }, [close, expanded]);

  return (
    <div
      aria-modal={expanded}
      className={`overlay overlay--${type}${expanded ? ' expanded' : ''}`}
      role="dialog"
      aria-labelledby={id}
      aria-hidden={!expanded}
    >
      <button
        type="button"
        className="close-outside"
        onClick={close}
        aria-label="Kapat"
      />
      <aside className={`aside-panel aside-panel--${type}`}>
        <header className="aside-panel__header">
          <h3 id={id} className="aside-panel__title">
            {heading}
          </h3>
          <button
            type="button"
            className="aside-panel__close"
            onClick={close}
            aria-label="Kapat"
          >
            ×
          </button>
        </header>
        <div className="aside-panel__body">{children}</div>
      </aside>
    </div>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
