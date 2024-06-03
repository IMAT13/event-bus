# EventBus

## Overview

This EventBus package provides a flexible and feature-rich event handling system designed to facilitate communication between different parts of an application. It supports features like debouncing, throttling, immediate event handling, single-time listeners, and prioritization of event listeners.

## Usage

To get started with the EventBus, import the necessary functions from the package:

```javascript
import createEventBus from "@packages/event-bus";

const { eventBus, useEventBus } = createEventBus();
const { on, off, emit, reset } = useEventBus();
```

### Examples

#### Debounce Example

Prevents event flooding, useful for search inputs:

```javascript
// EventBus Instance
eventBus.on("typing", () => console.log("Debounced Typing Event!"), { debounce: 300 });
// Composable
on("typing", () => console.log("Debounced Typing Event!"), { debounce: 300 });
```

#### Throttle Example

Limits how often a function can execute, useful for scroll events:

```javascript
// EventBus Instance
eventBus.on("scroll", () => console.log("Throttled Scroll Event!"), { throttle: 1000 });
// Composable
on("scroll", () => console.log("Throttled Scroll Event!"), { throttle: 1000 });
```

#### Immediate Example

Executes immediately upon subscription:

```javascript
// EventBus Instance
eventBus.on("init", () => console.log("Immediate Execution upon Subscription!"), { immediate: true });
// Composable
on("init", () => console.log("Immediate Execution upon Subscription!"), { immediate: true });
```

#### Once Example

Executes only once:

```javascript
// EventBus Instance
eventBus.on("click", () => console.log("This will only run once for click event!"), { once: true });
// Composable
on("click", () => console.log("This will only run once for click event!"), { once: true });
```

#### Priority Example

Manage execution order through priority:

```javascript
// EventBus Instance
eventBus.on("priorityEvent", () => console.log("Listener with Priority 1"), { priority: 1 });
eventBus.on("priorityEvent", () => console.log("Listener with Priority -1 (should run last)"), {
  priority: -1,
});
eventBus.on("priorityEvent", () => console.log("Listener with Priority 2 (should run first)"), {
  priority: 2,
});

// Composable
on("priorityEvent", () => console.log("Listener with Priority 1"), { priority: 1 });
on("priorityEvent", () => console.log("Listener with Priority -1 (should run last)"), { priority: -1 });
on("priorityEvent", () => console.log("Listener with Priority 2 (should run first)"), { priority: 2 });
```

### Emitting Events

To simulate the events, you can use the `emit` function:

```javascript
// EventBus Instance
eventBus.emit("init");
eventBus.emit("click");
setTimeout(() => eventBus.emit("typing", "Hello"), 100);
setTimeout(() => eventBus.emit("typing", "Hello, World!"), 350);
setTimeout(() => eventBus.emit("scroll"), 500);
setTimeout(() => eventBus.emit("scroll"), 1500);
setTimeout(() => eventBus.emit("priorityEvent"), 2000);

eventBus.reset();

// Composable
emit("init");
emit("click");
emit("typing", "Hello"), 100);
emit("typing", "Hello, World!"), 350);
emit("scroll"), 500);
emit("scroll"), 1500);
emit("priorityEvent"), 2000);

reset();
```

### Reset Events

To remove the events, you can use the `reset` function:

```javascript
// EventBus Instance
eventBus.reset();

// Composable
reset();
```

## API Documentation

- **on(event, handler, options)**: Subscribe to an event.
- **off(event, handler)**: Unsubscribe from an event.
- **emit(event, ...args)**: Emit an event to all listeners.
- **reset( )**: Resets the eventBus and removes all the events and listeners.
