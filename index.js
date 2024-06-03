import EventBus from "./lib/event-bus";
import useEventBus from "./composables/use-event-bus";

const createEventBus = () => {
  const eventBusInstance = new EventBus();
  const eventBusComposable = () => useEventBus(eventBusInstance);
  return {
    eventBus: eventBusInstance,
    useEventBus: eventBusComposable,
  };
};

export default createEventBus;