/* Expose modules for testing in jsdom 
   BECAUSE I DON'T KNOW WHEN TO STOP   */

window.views = {
  layout: require('../../clientapp/views/layout')
};
window.models = {
  appState: require('../../clientapp/models/app-state')
};

