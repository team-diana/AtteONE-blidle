import Blockly from 'blockly';
import * as It from 'blockly/msg/it';

import { getXML } from './utils';

import './block_movePan';
import './block_moveRover';
import './block_readDist';
import './block_interval';

const toolbox = getXML(require('../logic/toolbox.xml').default);

Blockly.setLocale(It);

Blockly.JavaScript.STATEMENT_PREFIX = 'this.xblk(%1);\n';
Blockly.JavaScript.addReservedWords('this');

const initWorkspace = elm => Blockly.inject(elm,
  {
    toolbox,
    collapse: true,
    comments: true,
    disable: true,
    maxBlocks: Infinity,
    trashcan: true,
    horizontalLayout: false,
    toolboxPosition: 'start',
    css: true,
    media: 'https://blockly-demo.appspot.com/static/media/',
    rtl: false,
    scrollbars: true,
    sounds: true,
    oneBasedIndex: true,
    grid: {
      spacing: 20,
      length: 1,
      colour: '#888',
      snap: true,
    },
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2,
    },
  });

export { initWorkspace };
