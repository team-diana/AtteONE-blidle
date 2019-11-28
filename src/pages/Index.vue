
<template>
  <q-page class="flex flex-center">
    <q-card style="height:calc(100vh - 8rem);width:calc(100vw - 3rem)">
      <div ref="blockly" style="position:relative"/>
      <q-resize-observer @resize="onResize" />
    </q-card>
    <q-btn @click="openWS" label="Apri workspace" color="purple"/>
    <q-btn class="q-mx-md" @click="saveWS" label="Salva workspace" color="primary"/>
    <q-btn :loading="running>0 && !runnable" :disabled="!running"
      @click="stopAll('STOP')" label="STOP" color="negative"/>
    <q-btn @click="run"
      :disabled="runnable || mqttClient.status !=='connected'"
      :loading="running>0" label="ESEGUI" color="positive"/>
    <a ref="dler" style="display:none"/>
    <input type="file" ref="uper" style="display:none" accept="text/xml">
    <q-dialog seamless :value="showConsole">
      <q-card style="background:#FFFC;height:calc(100vh - 15rem);width:calc(100vw - 6rem)">
        <q-card-section style="height:calc(100% - 3rem);">
          <div class="text-h6 q-mb-md">Console</div>
          <q-scroll-area style="height:100%" ref="scrollArea">
            <div v-for="(line,i) of obuf" :key="i">
              <span class="text-grey-6">{{line.time.toLocaleTimeString()
                }}.{{String(line.time.getMilliseconds()).padStart(3, '0')}}</span>:
                <span :class="{'text-bold':line.bold}">
                  {{line.line}}
                </span>
            </div>
          </q-scroll-area>
        </q-card-section>
        <q-card-actions align="center"
          style="position:absolute;bottom:0;width:100%">
          <q-slide-transition>
            <q-btn flat label="Chiudi" color="positive"
              v-show="running==0"
              @click="showConsole=false"/>
           </q-slide-transition>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import Blockly from 'blockly';
import Vue from 'vue';
import { Dialog } from 'quasar';
import mqttClient from '../logic/mqttClient';
import { initWorkspace } from '../logic/blkConfig';


Vue.config.ignoredElements = ['xml', 'category', 'block', 'value', 'field'];

const originalAlert = window.alert;

export default {
  name: 'PageIndex',
  data: () => ({
    blk: null,
    running: 0,
    runnable: false,
    obuf: [],
    mqttClient,
    showConsole: false,
  }),
  methods: {
    onResize(s) {
      this.$refs.blockly.style.width = `${s.width}px`;
      this.$refs.blockly.style.height = `${s.height}px`;
      if (!this.blk) return;
      Blockly.svgResize(this.blk);
    },
    openWS() {
      this.$refs.uper.click();
    },
    saveWS() {
      const xml = Blockly.Xml.workspaceToDom(this.blk).outerHTML;
      this.$refs.dler.setAttribute('href',
        `data:text/xml;charset=utf-8,${encodeURIComponent(xml)}`);
      this.$refs.dler.setAttribute('download', 'workspace.xml');
      this.$refs.dler.click();
      return xml;
    },
    loadWS(xml) {
      if (typeof xml === 'string') {
        xml = (new DOMParser()).parseFromString(xml, 'text/xml').firstChild;
      }
      this.blk.clear();
      Blockly.Xml.domToWorkspace(xml, this.blk);
    },
    mqttPublish(topic, cont) {
      mqttClient.publish(topic, cont);
    },
    mqttSubscribe(topic, handler) {
      mqttClient.subscribe(topic, handler);
    },
    stopAll(e) {
      if (this.runnable) {
        this.obuf.push({
          time: new Date(),
          line: `FINE PROGRAMMA (${(e && (e.name || e.message))
          || e})`,
          bold: true,
        });
      }
      mqttClient.clearHandlers();
      this.runnable = false;
      // eslint-disable-next-line no-console
      console.warn(e, { e });
    },
    xblk(blid) {
      if (!this.runnable) {
        throw new Error('INTERROTTO');
      }
      this.blk.highlightBlock(blid);
    },
    run() {
      Blockly.JavaScript.addReservedWords('code');
      const code = Blockly.JavaScript.workspaceToCode(this.blk);

      if (!code) {
        Dialog.create({
          title: 'Errore',
          message: 'Codice non definito!',
        });
        return;
      }

      // eslint-disable-next-line no-console
      console.log('START: ', code);

      this.obuf = [];
      this.showConsole = true;
      window.alert = (t) => {
        // eslint-disable-next-line no-console
        console.log(t);
        this.obuf.push({
          time: new Date(),
          line: t,
        });
        if (this.obuf.length > 80) this.obuf.shift();
        this.$refs.scrollArea.setScrollPosition(this.position, 3000);
      };

      this.runnable = true;
      this.running += 1;
      try {
        // eslint-disable-next-line no-eval
        eval(code);
      } catch (e) {
        this.stopAll(new Error('Interrotto dall\'utente'));
      }
      this.running -= 1;
      if (!this.running) {
        this.stopAll(new Error('Interrotto dall\'utente'));
      }
    },
    loadFile(file) {
      const reader = new FileReader();
      const oThis = this;
      reader.onload = function res() {
        // eslint-disable-next-line no-console
        oThis.loadWS(this.result);
      };
      reader.readAsText(file);
    },
  },
  watch: {
    running() {
      if (!this.running) {
        this.stopAll(new Error('Interrotto dall\'utente'));
        window.alert = originalAlert;
      }
      // eslint-disable-next-line no-console
      console.log('RUNLEVEL:', this.running);
    },
  },
  mounted() {
    this.blk = initWorkspace(this.$refs.blockly);

    this.$refs.uper.onchange = () => {
      this.loadFile(this.$refs.uper.files[0]);
    };

    this.$root.$el.ondragover = (e) => {
      e.preventDefault(); return false;
    };

    this.$root.$el.ondrop = (e) => {
      e.preventDefault();
      try {
        this.loadFile(e.dataTransfer.items[0].getAsFile());
      // eslint-disable-next-line no-empty
      } finally {}
    };
  },
};
</script>
