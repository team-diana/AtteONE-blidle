import Blockly from 'blockly';

Blockly.Blocks.leggi_distanza = {
  init() {
    this.appendDummyInput()
      .appendField('Leggi distanza dal rover')
      .appendField(new Blockly.FieldDropdown([['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']]), 'rovNum');
    this.appendDummyInput()
      .setAlign(Blockly.ALIGN_CENTRE)
      .appendField(new Blockly.FieldImage('https://cdn.pixabay.com/photo/2014/04/02/11/13/wireless-305565_960_720.png', 190, 40, { alt: '*', flipRtl: 'FALSE' }));
    this.appendDummyInput();
    this.appendStatementInput('code')
      .setCheck(null);
    this.setColour(0);
    this.setTooltip('');
    this.setHelpUrl('');
  },
};

Blockly.JavaScript.speed_control = (block) => {
  const rovNum = block.getFieldValue('rovNum');
  const statements = Blockly.JavaScript.statementToCode(block, 'code');
  return `this.mqttSubscribe('atte${rovNum}/distance', (dist) => {\n${statements}\n})\n`;
};
