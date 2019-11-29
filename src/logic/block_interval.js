import Blockly from 'blockly';

Blockly.Blocks.interval = {
  init() {
    this.appendDummyInput()
      .appendField('Esegui ogni')
      .appendField(new Blockly.FieldNumber(100, 0, 1000000), 'interval')
      .appendField('ms');
    this.appendStatementInput('code').setCheck(null);
    this.appendValueInput('cond')
      .setCheck('Boolean')
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('finché');
    this.setColour(120);
    this.setTooltip('');
    this.setHelpUrl('');
  },
};

Blockly.JavaScript.interval = (block) => {
  const interval = block.getFieldValue('interval');
  const intCode = Blockly.JavaScript.statementToCode(block, 'code');
  const cond = Blockly.JavaScript.valueToCode(
    block,
    'cond',
    Blockly.JavaScript.ORDER_ATOMIC,
  );
  if (!interval) {
    return "this.prnt('Intervallo ciclo non definito!')";
  }
  if (!cond) {
    return "this.prnt('Condizione ciclo non definita!')";
  }
  if (!intCode) {
    return "this.prnt('Codice ciclo non definito!')";
  }
  const fun = `interval_${Math.floor((Date.now() % 9999)
    + Math.random() * 9999)}`;
  const code = `
  let ${fun} = () => {
    try {
      ${intCode}
    } catch (e) {
      this.stopAll(e, '${fun}');
    }
    if (${cond} && this.runnable) {
      setTimeout(${fun}, ${interval});
    } else {
      this.running -= 1;
    }
  };
  this.running += 1;
  setTimeout(${fun}, 1);\n`;
  return code;
};
