// utils/generateCompanyId.js
const { customAlphabet } = require( 'nanoid' );

const nanoid = customAlphabet( '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5 );

function generateCompanyId () {
  return `TM-${ nanoid() }`;
}

module.exports = { generateCompanyId };