import { describe, it, expect, vi, beforeEach } from "vitest";
import EventBus from "./event-bus";

vi.useFakeTimers();

describe("EventBus", () => {
  let bus = null;

  beforeEach(() => {
    bus = new EventBus();
  });

  it("calls subscribed listeners when an event is emitted", () => {
    const listener = vi.fn();
    bus.on("test-event", listener);
    bus.emit("test-event");
    expect(listener).toHaveBeenCalled();
  });

  it("ensures once listener is only called once", () => {
    const listener = vi.fn();
    bus.on("once-event", listener, { once: true });
    bus.emit("once-event");
    bus.emit("once-event");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("applies debounce correctly", async () => {
    const listener = vi.fn();
    bus.on("debounce-event", listener, { debounce: 100 });
    bus.emit("debounce-event");
    bus.emit("debounce-event", "param");
    vi.advanceTimersByTime(150);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith("param");
  });

  it("handles priority correctly", () => {
    const log = [];
    bus.on("priority-event", () => log.push("priority 1"), { priority: 1 });
    bus.on("priority-event", () => log.push("priority 2"), { priority: 2 });
    bus.on("priority-event", () => log.push("default priority"));
    bus.emit("priority-event");
    expect(log).toEqual(["priority 2", "priority 1", "default priority"]);
  });

  it("correctly combines debounce and once options", async () => {
    const listener = vi.fn();
    bus.on("combined-event", listener, { debounce: 100, once: true });
    bus.emit("combined-event");
    bus.emit("combined-event");
    vi.advanceTimersByTime(150);
    bus.emit("combined-event");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("verifies immediate execution and once combination", () => {
    const listener = vi.fn();
    bus.on("immediate-once-event", listener, { immediate: true, once: true });
    bus.emit("immediate-once-event");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("applies throttle correctly", async () => {
    const listener = vi.fn();
    bus.on("throttle-event", listener, { throttle: 100 });

    bus.emit("throttle-event");
    expect(listener).toHaveBeenCalledTimes(1);

    bus.emit("throttle-event");
    vi.advanceTimersByTime(50);
    expect(listener).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(60);
    bus.emit("throttle-event");
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("unsubscribes listeners correctly", () => {
    const listener = vi.fn();
    bus.on("test-event", listener);
    bus.emit("test-event");
    bus.off("test-event", listener);
    bus.emit("test-event");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("passes arguments to listeners", () => {
    const listener = vi.fn();
    bus.on("event-with-args", listener);
    bus.emit("event-with-args", "arg1", 123);
    expect(listener).toHaveBeenCalledWith("arg1", 123);
  });

  it("calls multiple listeners for the same event in the correct order, including default priority", () => {
    const executionOrder = [];

    bus.on("multi-listener-event", () => executionOrder.push("listener1"), { priority: 1 });
    bus.on("multi-listener-event", () => executionOrder.push("listener2"), { priority: 2 });
    bus.on("multi-listener-event", () => executionOrder.push("defaultListener"));

    bus.emit("multi-listener-event");

    expect(executionOrder).toEqual(["listener2", "listener1", "defaultListener"]);
  });

  it("does not call removed listeners", () => {
    const listener = vi.fn();
    bus.on("event-to-remove", listener);
    bus.off("event-to-remove", listener);
    bus.emit("event-to-remove");
    expect(listener).not.toHaveBeenCalled();
  });

  it("handles errors from listeners without stopping other listeners", () => {
    const errorListener = vi.fn(() => {
      throw new Error("Test Error");
    });
    const normalListener = vi.fn();
    bus.on("error-event", errorListener);
    bus.on("error-event", normalListener);
    bus.emit("error-event");
    expect(normalListener).toHaveBeenCalled();
  });
});
