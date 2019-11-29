import Blockly from 'blockly';

Blockly.Blocks.speed_control = {
  init() {
    this.appendDummyInput()
      .setAlign(Blockly.ALIGN_CENTRE)
      .appendField('Muovi il rover (velocità)')
      .appendField(new Blockly.FieldDropdown([['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '4'], ['TUTTI', '0']]), 'rovNum');
    this.appendDummyInput()
      .setAlign(Blockly.ALIGN_CENTRE)
      .appendField(new Blockly.FieldImage('http://cdn.onlinewebfonts.com/svg/download_537527.png', 120, 40, { alt: '*', flipRtl: 'FALSE' }));
    this.appendValueInput('speed')
      .setCheck('Number')
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Velocità');
    this.appendValueInput('direzione')
      .setCheck('Number')
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Direzione');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
    this.setTooltip('Muovi il rover');
    this.setHelpUrl('');
  },
};

Blockly.JavaScript.speed_control = (block) => {
  const rovNum = block.getFieldValue('rovNum');
  const speed = Blockly.JavaScript.valueToCode(block, 'speed', Blockly.JavaScript.ORDER_NONE);
  const direzione = Blockly.JavaScript.valueToCode(block, 'direzione', Blockly.JavaScript.ORDER_NONE);
  return `this.mqttPublish('atte${rovNum}/move', ${speed}+' '+${direzione});\n`;
};
