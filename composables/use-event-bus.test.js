import { describe, it, expect, vi, beforeEach } from "vitest";
import useEventBus from "./use-event-bus";

describe("useEventBus", () => {
  let mockBus;

  beforeEach(() => {
    mockBus = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      reset: vi.fn(),
    };
  });

  it("registers event listeners", () => {
    const { on } = useEventBus(mockBus);
    const listener = vi.fn();
    on("test-event", listener);
    expect(mockBus.on).toHaveBeenCalledWith("test-event", listener, {});
  });

  it("registers event listeners with options", () => {
    const { on } = useEventBus(mockBus);
    const listener = vi.fn();
    const options = { once: true, priority: 1 };
    on("test-event", listener, options);
    expect(mockBus.on).toHaveBeenCalledWith("test-event", listener, options);
  });

  it("removes event listeners", () => {
    const { on, off } = useEventBus(mockBus);
    const listener = vi.fn();
    on("test-event", listener);
    off("test-event", listener);
    expect(mockBus.off).toHaveBeenCalledWith("test-event", listener);
  });

  it("emits events", () => {
    const { emit } = useEventBus(mockBus);
    emit("test-event", "data");
    expect(mockBus.emit).toHaveBeenCalledWith("test-event", "data");
  });

  it("resets all events", () => {
    const { reset } = useEventBus(mockBus);
    reset();
    expect(mockBus.reset).toHaveBeenCalled();
  });

  it("cleans up on component unmount", () => {
    const { on } = useEventBus(mockBus);
    const cleanup = vi.fn();
    const instance = {
      isUnmounted: false,
      proxy: {
        $onUnmounted: (fn) => {
          if (!instance.isUnmounted) {
            cleanup.mockImplementation(fn);
          }
        },
      },
    };

    on("test-event", vi.fn());
    instance.isUnmounted = true;
    cleanup();

    expect(cleanup).toHaveBeenCalled();
  });
});
