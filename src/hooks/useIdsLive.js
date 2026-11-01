import { useContext } from 'react';
import { IdsLiveContext } from '../context/IdsLiveContext.jsx';

export function useIdsLive() {
  const ctx = useContext(IdsLiveContext);
  if (!ctx) throw new Error('useIdsLive debe usarse dentro de <IdsLiveProvider>');
  return ctx;
}
