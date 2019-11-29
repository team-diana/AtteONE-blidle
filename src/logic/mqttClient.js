import * as MQTT from 'paho-mqtt';
import Vue from 'vue';
import { Dialog } from 'quasar';

const msgHandlers = {};

export default new Vue({
  data: {
    client: null,
    status: 'disconnected',
    host: null,
    port: null,
  },
  methods: {
    disconnect() {
      try {
        this.client.disconnect();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      } finally {
        this.client = null;
      }
    },
    connect() {
      this.disconnect();
      this.status = 'connecting';
      this.client = new MQTT.Client(
        this.host,
        this.port,
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
          Object.keys(msgHandlers).forEach((topic) => {
            this.client.subscribe(topic);
          });
          window.localStorage.setItem('attyouno_host', this.host);
          window.localStorage.setItem('attyouno_port', this.port);
        },
        onFailure: () => {
          Dialog.create({
            title: 'Errore',
            message: 'Connessione al broker MQTT fallita!',
          });
          this.status = 'disconnected';
          this.client.disconnect();
        },
      });
    },
    publish(topic, value) {
      const message = new MQTT.Message(value);
      message.destinationName = topic;
      this.client.publish(message);
    },
    subscribe(topic, onMessage) {
      if (msgHandlers[topic]) {
        throw new Error('SOTTOSCRIZIONE DUPLICATA!');
      }
      msgHandlers[topic] = onMessage;
      this.client.subscribe(topic);
    },
    clearHandlers() {
      Object.keys(msgHandlers).forEach((topic) => {
        this.client.unsubscribe(topic);
        delete msgHandlers[topic];
      });
    },
  },
  created() {
    this.host = window.localStorage.getItem('attyouno_host');
    this.port = Number(window.localStorage.getItem('attyouno_port'));
  },
});
