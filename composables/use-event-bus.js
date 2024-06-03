import { getCurrentScope } from "vue";

const useEventBus = (eventBus) => {
  const scope = getCurrentScope();

  const on = (eventName, listener, options = {}) => {
    eventBus.on(eventName, listener, options);
    scope?.cleanups?.push(() => eventBus.off(eventName, listener));
  };

  const off = (eventName, listener) => {
    eventBus.off(eventName, listener);
  };

  const emit = (eventName, ...args) => {
    eventBus.emit(eventName, ...args);
  };

  const reset = () => {
    eventBus.reset();
  };

  return { on, off, emit, reset };
};

export default useEventBus;
