import Blockly from 'blockly';

Blockly.Blocks.leggi_distanza = {
  init() {
    this.appendDummyInput()
      .appendField('Leggi distanza in ')
      .appendField(new Blockly.FieldVariable('distanza'), 'DISTVAR');
    this.appendDummyInput()
      .appendField('Dal rover')
      .appendField(
        new Blockly.FieldDropdown([
          ['1', '1'],
          ['2', '2'],
          ['3', '3'],
          ['4', '4'],
          ['5', '5'],
        ]),
        'rovNum',
      )
      .appendField(
        new Blockly.FieldImage(
          'https://cdn.pixabay.com/photo/2014/04/02/11/13/wireless-305565_960_720.png',
          90,
          40,
          { alt: '*', flipRtl: 'FALSE' },
        ),
      );
    this.appendStatementInput('code').setCheck(null);
    this.setColour(0);
    this.setTooltip(
      'Legge la distanza e la inserisce nella variabile, poi esegue eventuale altro codice',
    );
    this.setHelpUrl('');
  },
};

Blockly.JavaScript.leggi_distanza = (block) => {
  const rovNum = block.getFieldValue('rovNum');
  const statements = Blockly.JavaScript.statementToCode(block, 'code');
  return `this.mqttSubscribe('atte${rovNum}/distance', (dist) => {\n${statements}\n})\n`;
};


Blockly.JavaScript.leggi_distanza = (block) => {
  // eslint-disable-next-line no-underscore-dangle
  const distvar = Blockly.JavaScript.variableDB_.getName(
    block.getFieldValue('DISTVAR'),
    Blockly.Variables.NAME_TYPE,
  );
  const rovNum = block.getFieldValue('rovNum');
  const inCode = Blockly.JavaScript.statementToCode(block, 'code');
  return `this.mqttSubscribe('atte${rovNum}/distance', (dist) => {
  ${distvar} = dist;
  ${inCode}\n});\n`;
};
