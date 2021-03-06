const {order} = require('../utils')
module.exports = () => {
    const electronUtil = require('./electronUtil')
    const defaultJsonFile = electronUtil.getAbsolutePath('config/default/sources.json', true);
    const customJsonFile = electronUtil.getAbsolutePath('config/sources.json', true);
    const defaultJson = electronUtil.readJSONFile(defaultJsonFile);
    const customJson = customJsonFile ? electronUtil.readJSONFile(customJsonFile) : {sources:[]};
    const distinctByKey = (arrayObject, key) => {
        const resultsUniq = [];
        arrayObject.forEach(objectElement => {
            const isUnique = resultsUniq.every(resultElement => resultElement[key] !== objectElement[key]);
            if(isUnique) resultsUniq.push(objectElement);
        })
        return resultsUniq;
    }
    const mergedSources = distinctByKey([...defaultJson.sources, ...customJson.sources], 'title');
    const orderByTitle = mergedSources.sort(order.orderByKey('title'));
    return mergedSources;
}

