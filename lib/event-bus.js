const defaultErrorHandler = (eventName, error) =>
  console.error(`Error executing listener for event '${eventName}':`, error);

class EventBus {
  #events;
  #maxListeners;

  constructor(maxListeners = 20, errorHandler = defaultErrorHandler) {
    this.#events = new Map();
    this.#maxListeners = maxListeners;
    this.errorHandler = errorHandler;
  }

  on(eventName, listener, options = {}) {
    this.#initializeEventIfAbsent(eventName);
    const wrappedListener = this.#wrapListener(listener, eventName, options);
    this.#executeListenerIfImmediate({ listener: wrappedListener, options, eventName });
    this.#registerListener({
      eventName,
      listener: wrappedListener,
      priority: options.priority,
      originalListener: listener,
    });
  }

  off(eventName, originalListener) {
    const event = this.#events.get(eventName);
    if (!event) return;

    const listeners = event.listeners.filter(({ originalListener: orig }) => orig !== originalListener);
    this.#events.set(eventName, { ...event, listeners, sorted: true });
  }

  emit(eventName, ...args) {
    const event = this.#events.get(eventName);
    if (!event) return;

    this.#sortListenersByPriority(event);
    event.listeners.forEach(({ listener }) => {
      try {
        listener(...args);
      } catch (error) {
        this.#handleError(eventName, error);
      }
    });
  }

  reset() {
    this.#events.clear();
  }

  #handleError(eventName, error) {
    this.errorHandler(eventName, error);
  }

  #initializeEventIfAbsent(eventName) {
    if (!this.#events.has(eventName)) {
      this.#events.set(eventName, { listeners: [], sorted: true });
    }
  }

  #wrapListener(listener, eventName, options) {
    return this.#wrapOnce({
      listener: this.#wrapDebounceOrThrottle(listener, options),
      originalListener: listener,
      eventName,
      options,
    });
  }

  #wrapDebounceOrThrottle(listener, { debounce, throttle }) {
    return debounce > 0
      ? this.#applyDebounce(listener, debounce)
      : throttle > 0
        ? this.#applyThrottle(listener, throttle)
        : listener;
  }

  #applyDebounce(listener, debounce) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => listener(...args), debounce);
    };
  }

  #applyThrottle(listener, throttle) {
    let isThrottled = false;

    return (...args) => {
      if (!isThrottled) {
        listener(...args);
        isThrottled = true;
        setTimeout(() => {
          isThrottled = false;
        }, throttle);
      }
    };
  }

  #wrapOnce({ listener, originalListener, eventName, options: { once } }) {
    if (!once) {
      return listener;
    }
    return (...args) => {
      listener(...args);
      this.off(eventName, originalListener);
    };
  }

  #executeListenerIfImmediate({ listener, options: { immediate, once }, eventName, originalListener }) {
    if (immediate && !once) {
      listener();
    } else if (once) {
      this.off(eventName, originalListener);
    }
  }

  #registerListener({ eventName, listener, priority = 0, originalListener }) {
    const { once, immediate } = listener.options || {};
    if (!(immediate && once)) {
      const event = this.#events.get(eventName);
      event.listeners.push({ listener, originalListener, priority });
      event.sorted = false;
      this.#warnIfMaxListenersExceeded(eventName);
    }
  }

  #sortListenersByPriority(event) {
    if (!event.sorted) {
      event.listeners.sort((a, b) => b.priority - a.priority);
      event.sorted = true;
    }
  }

  #warnIfMaxListenersExceeded(eventName) {
    const event = this.#events.get(eventName);
    if (event.listeners.length > this.#maxListeners) {
      console.warn(`Warning: More than ${this.#maxListeners} listeners for event '${eventName}'`);
    }
  }
}

export default EventBus;
