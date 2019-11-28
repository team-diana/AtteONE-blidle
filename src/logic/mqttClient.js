import { MQTT } from 'paho-mqtt';
import Vue from 'vue';

const msgHandlers = {};

export default new Vue({
  data: {
    client: null,
    status: 'disconnected',
    host: null,
    port: null,
  },
  methods: {
    connect(host, port) {
      if (!host) ({ host } = this);
      if (!port) ({ port } = this);
      if (this.client && this.client) {
        this.client.disconnect();
      }
      this.status = 'connecting';
      this.client = new MQTT.Client(
        host,
        Number(port),
        `AtteOne-IDE${Math.floor(Math.random() * 9999)}`,
      );
      this.client.onConnectionLost = () => {
        this.status = 'disconnected';
        setTimeout(() => this.connect(), 5000);
      };
      this.client.onMessageArrived = (msg) => {
        const topic = msg.destinationName;
        const cont = msg.payloadString;
        if (typeof msgHandlers[topic] === 'function') {
          msgHandlers[topic](cont);
        } else {
          // eslint-disable-next-line no-console
          console.warn('Unhandled topic!', topic, cont);
        }
      };
      this.client.connect({
        onSuccess: () => {
          this.status = 'connected';
        },
      });
    },
    publish(topic, value) {
      const message = new MQTT.Message(value);
      message.destinationName = topic;
      this.client.send(message);
    },
    subscribe(topic, onMessage) {
      this.client.subscribe(topic);
      msgHandlers[topic] = onMessage;
    },
  },
});
