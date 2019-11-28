
<template>
  <q-page class="flex flex-center">
    <q-card style="height:calc(100vh - 10rem);width:calc(100vw - 3rem)">
      <div ref="blockly" style="position:relative"/>
      <q-resize-observer @resize="onResize" />
    </q-card>
    <q-btn @click="saveWS" label="Salva workspace"/>
    <q-btn class="q-ml-md" @click="compile" label="COMPILA workspace"/>
  </q-page>
</template>

<script>
import Blockly from 'blockly';
import Vue from 'vue';
import { getXML } from '../logic/utils';
import '../logic/blkConfig';

const toolbox = getXML(require('../logic/toolbox.xml').default);

Vue.config.ignoredElements = ['xml', 'category', 'block', 'value', 'field'];


export default {
  name: 'PageIndex',
  data: () => ({
    blk: null,
  }),
  methods: {
    onResize(s) {
      this.$refs.blockly.style.width = `${s.width}px`;
      this.$refs.blockly.style.height = `${s.height}px`;
      if (!this.blk) return;
      Blockly.svgResize(this.blk);
    },
    saveWS() {
      return Blockly.Xml.workspaceToDom(this.blk).outerHTML;
    },
    loadWS(xml) {
      if (typeof xml === 'string') {
        xml = (new DOMParser()).parseFromString(xml, 'text/xml').firstChild;
      }
      this.blk.clear();
      Blockly.Xml.domToWorkspace(xml, this.blk);
    },
    compile() {
      Blockly.JavaScript.addReservedWords('code');
      let code = Blockly.JavaScript.workspaceToCode(this.blk);
      code += 'MusicMaker.play();';
      // eslint-disable-next-line no-new-func
      const fun = new Function(code);
      fun();
    },
  },
  mounted() {
    this.blk = Blockly.inject(this.$refs.blockly, {
      toolbox,
      // toolboxPosition: 'end',
      // horizontalLayout: true,
      // scrollbars: false,
    });
    setTimeout(() => {
      this.loadWS('<xml><block type="play_sound" id="v;T(Rg(PQUu}|Rtj=osS" x="183" y="176"><field name="VALUE">sounds/c4.m4a</field></block></xml>');
    }, 3000);
  },
};
</script>
