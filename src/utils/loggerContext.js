import { AsyncLocalStorage } from 'async_hooks';

const als = new AsyncLocalStorage();

export const runWithLogger = (store, callback) => als.run(store, callback);
export const getLogger = () => (als.getStore() && als.getStore().logger) || console;
