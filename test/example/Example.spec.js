/* global describe it */
var assert = require('assert')

describe('Example', () => {
  it('Cheat to end process after running tests...', (done) => {
    assert.equal('1', 1);
    done();

    setTimeout(() => {
      console.log('FINISH TESTS! Exiting...');
      process.exit(0);
    }, 1000);
  });
});
