
<template>
  <q-page class="flex flex-center">
    <q-card style="height:calc(100vh - 8rem);width:calc(100vw - 3rem)">
      <div ref="blockly" style="position:relative"/>
      <q-resize-observer @resize="onResize" />
    </q-card>
    <q-btn @click="openWS" label="Apri workspace" color="purple"/>
    <q-btn class="q-mx-md" @click="saveWS" label="Salva workspace" color="primary"/>
    <q-btn-group>
      <q-btn :loading="running>0 && !runnable" :disabled="!running"
        icon="stop"
        @click="stopAll('STOP')" label="STOP" color="negative"/>
      <q-btn @click="run" icon="play_arrow"
        :disabled="runnable || mqttClient.status !=='connected'"
        :loading="running>0" label="ESEGUI" color="positive"/>
    </q-btn-group>
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
    bgLogo: null,
  }),
  methods: {
    onResize(s) {
      const xr = s.width / 2200;
      const yr = s.height / 300;
      this.$refs.blockly.style.width = `${s.width}px`;
      this.$refs.blockly.style.height = `${s.height}px`;
      if (this.bgLogo) {
        this.bgLogo.setAttribute('transform', `
          translate(${s.width / 2 - 640 * xr + 50},${s.height / 2 - 20 * yr})
          scale(${Math.min(xr, yr)})
        `);
      }
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

    const svgWS = this.$refs.blockly.querySelector('.blocklyWorkspace');
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const pth = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.bgLogo = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    this.bgLogo.appendChild(pth);

    this.bgLogo.setAttribute('style', 'opacity:0.5');

    this.onResize({
      width: this.$refs.blockly.offsetWidth,
      height: this.$refs.blockly.offsetHeight,
    });

    bg.setAttribute('height', '100%');
    bg.setAttribute('width', '100%');
    bg.style = 'fill:#0001';

    pth.setAttribute('stroke', '#0005');
    pth.setAttribute('d', 'M 0.5 0.4707 L 0.5 16 L 15.59 16 L 15.59 15.75 L 96.68 15.75 A 113.7 113.7 0 0 1 142.9 25.28 A 120.8 120.8 0 0 1 180.6 51 A 122.4 122.4 0 0 1 206.1 89.09 A 120.2 120.2 0 0 1 206.1 182.4 A 124.7 124.7 0 0 1 180.6 220.7 A 117 117 0 0 1 96.68 255.7 L 42.78 255.7 L 42.78 256 L 0.5 256 L 0.5 271 L 96.68 271 A 128.9 128.9 0 0 0 148.7 260.3 A 135 135 0 0 0 191.3 231.3 A 137.3 137.3 0 0 0 220 188.5 A 136.7 136.7 0 0 0 220 83.12 L 220 83.19 A 136.7 136.7 0 0 0 191.4 40.14 A 135.1 135.1 0 0 0 148.7 11.14 A 129.1 129.1 0 0 0 96.73 0.4707 L 0.5 0.4707 z M 342.5 0.5098 L 342.5 271 L 357.6 271 L 357.6 0.5098 L 342.5 0.5098 z M 580.4 0.5098 L 464.2 271 L 480.8 271 L 516.3 188 L 516.4 188 L 535.7 143.3 L 590.2 16.51 L 644.7 143.3 L 644.7 143.3 L 657.3 172.7 L 657.3 172.7 L 673.5 210.5 L 699.6 271 L 716.2 271 L 600 0.5098 L 580.4 0.5098 z M 781.9 0.5098 L 766.8 0.9902 L 968.9 271 L 983.8 271 L 985.8 271 L 781.9 0.5098 z M 1176 0.5098 L 1060 271 L 1076 271 L 1107 200.1 L 1107 200 L 1112 188 L 1112 188 L 1126 155 L 1186 16.51 L 1253 172.7 L 1253 172.7 L 1269 210.1 L 1295 271 L 1312 271 L 1195 0.5098 L 1176 0.5098 z');

    svgWS.insertBefore(this.bgLogo, svgWS.firstChild);
    svgWS.insertBefore(bg, svgWS.firstChild);

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
      } catch (_) {}
    };

    document.title = 'AtteONE BLIDLE';
  },
};
</script>
