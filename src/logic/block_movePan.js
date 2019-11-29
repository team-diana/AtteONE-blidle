import Blockly from 'blockly';

Blockly.Blocks.pan_control = {
  init() {
    this.appendDummyInput()
      .appendField('Muovi torretta del rover')
      .appendField(new Blockly.FieldDropdown([['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['TUTTI', '0']]), 'rovNum');
    this.appendDummyInput()
      .appendField(new Blockly.FieldImage('http://cdn.onlinewebfonts.com/svg/img_226124.png', 180, 40, { alt: '*', flipRtl: 'FALSE' }));
    this.appendValueInput('pan')
      .setCheck('Number')
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('Angolo');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(0);
    this.setTooltip('Muovi torretta');
    this.setHelpUrl('');
  },
};


Blockly.JavaScript.pan_control = (block) => {
  const angle = Blockly.JavaScript.valueToCode(block, 'pan', Blockly.JavaScript.ORDER_ATOMIC);
  const rovNum = block.getFieldValue('rovNum');

  return `this.mqttPublish('atte${rovNum}/pan', ''+${angle})\n`;
};
