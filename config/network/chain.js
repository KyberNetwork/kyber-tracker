module.exports = function(chain) {
    chain = chain || process.env.NODE_ENV || 'production'; 
    return require(`./${chain}`);
}
