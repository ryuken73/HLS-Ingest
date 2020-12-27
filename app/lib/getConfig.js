// const {remote} = require('electron');
const electronUtil = require('./electronUtil');
const Store = require('electron-store');
// const {app} = require('electron');
// console.log('isRenderer', electronUtil.isRenderer, getPath)

const getCombinedConfig = (params={}) => {
    const {app} = electronUtil.isRenderer ? require('electron').remote : require('electron');
    const {storeName='optionStore', electronPath='home'} = params;
    const defaultJsonFile = electronUtil.getAbsolutePath('config/default/config.json', true);
    const defaultJson = electronUtil.readJSONFile(defaultJsonFile);
    const sourceStore = new Store({
        name: storeName,
        cwd: app.getPath(electronPath)
    })
    const customConfig = sourceStore.store;
    return {...defaultJson, ...customConfig};
}

const getDefaultConfig = () => {
    const defaultJsonFile = electronUtil.getAbsolutePath('config/default/config.json', true);
    const defaultJson = electronUtil.readJSONFile(defaultJsonFile);
    return {...defaultJson};
}
module.exports = {
    getCombinedConfig,
    getDefaultConfig
}
