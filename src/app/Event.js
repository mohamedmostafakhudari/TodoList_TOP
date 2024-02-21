export default class EventEmitter {
	constructor() {
		this.events = {};
	}

	on(eventName, listener) {
		if (this.events.hasOwnProperty(eventName)) {
			this.events[eventName].push(listener);
		} else {
			this.events[eventName] = [listener];
		}
	}

	emit(eventName, data) {
		if (this.events.hasOwnProperty(eventName)) {
			this.events[eventName].forEach((listener) => listener(data));
		} else {
			throw new Error(`No listeners for event ${eventName}`);
		}
	}

	remove(eventName, listener) {
		if (this.events.hasOwnProperty(eventName)) {
			this.events[eventName] = this.events[eventName].filter((l) => l.toString() !== listener.toString());
		}
	}
}
