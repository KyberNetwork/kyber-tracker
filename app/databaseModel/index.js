const { Sequelize, Model, DataTypes, Op } = require('sequelize');
const BigNumber       = require('bignumber.js');

const sequelize = new Sequelize(process.env.MYSQL_DBNAME, process.env.MYSQL_USERNAME, process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_DB_HOST,
    dialect: 'mysql'
});

class KyberTradeModel extends Model { }
KyberTradeModel.init({
    block_number: DataTypes.NUMBER,
    block_hash: DataTypes.STRING,
    block_timestamp: DataTypes.NUMBER,
    tx: DataTypes.STRING,
    unique_tag: DataTypes.STRING,
    source_official: DataTypes.INTEGER,
    dest_official: DataTypes.INTEGER,
    source_reserve: DataTypes.STRING,
    dest_reserve: DataTypes.STRING,
    maker_address: DataTypes.STRING,
    maker_token_address: DataTypes.STRING,
    maker_token_decimal: DataTypes.NUMBER,
    maker_token_symbol: DataTypes.STRING,
    maker_token_amount: DataTypes.STRING,
    taker_address: DataTypes.STRING,
    taker_token_address: DataTypes.STRING,
    taker_token_decimal: DataTypes.NUMBER,
    taker_token_symbol: DataTypes.STRING,
    taker_token_amount: DataTypes.STRING,
    collected_fees: DataTypes.STRING,
    commission: DataTypes.STRING,
    commission_reserve_address: DataTypes.STRING,
    commission_receive_address: DataTypes.STRING,
    burn_fees: DataTypes.STRING,
    source_burn_fee: DataTypes.STRING,
    dest_burn_fee: DataTypes.STRING,
    source_wallet_fee: DataTypes.STRING,
    dest_wallet_fee: DataTypes.STRING,
    burn_reserve_address: DataTypes.STRING,
    minute_seq: DataTypes.NUMBER,
    hour_seq: DataTypes.NUMBER,
    day_seq: DataTypes.NUMBER,
    month: DataTypes.NUMBER,
    year: DataTypes.NUMBER,
    volume_eth: DataTypes.NUMBER,
    volume_usd: DataTypes.NUMBER,
    tx_value_eth: DataTypes.NUMBER,
    tx_value_usd: DataTypes.NUMBER,

    fee_token: DataTypes.STRING,
    fee_platform_wallet: DataTypes.STRING,
    fee_platform: DataTypes.STRING,
    fee_rebate: DataTypes.STRING,
    fee_burn_atm: DataTypes.STRING,
    fee_total_collected: DataTypes.STRING,
}, { sequelize, modelName: 'kyber_trade', freezeTableName:  true, timestamps: false,
    hooks:{
        beforeSave: function(instance){
            if (!instance.burn_fees) instance.burn_fees = 0;
            if (!instance.commission) instance.commission = 0;
            instance.collected_fees = ((new BigNumber(instance.burn_fees)).plus(new BigNumber(instance.commission))).toString();

            instance.minute_seq = Math.floor(instance.block_timestamp / 60);
            instance.hour_seq = Math.floor(instance.block_timestamp / 3600);
            instance.day_seq = Math.floor(instance.block_timestamp / 86400);

            const dt = new Date(instance.block_timestamp * 1000);
            instance.year = dt.getUTCFullYear();
            instance.month = instance.year + ('0' + (dt.getUTCMonth() + 1)).substr(-2);

            return instance
        }
    }
 });

class BurnedFeeModel extends Model { }
BurnedFeeModel.init({
    block_number: DataTypes.NUMBER,
    block_hash: DataTypes.STRING,
    block_timestamp: DataTypes.NUMBER,
    tx: DataTypes.STRING,
    burner_address: DataTypes.STRING,
    burner_contract: DataTypes.STRING,
    reserve_contract: DataTypes.STRING,
    reserve_wallet: DataTypes.STRING,
    amount: DataTypes.STRING,
    year: DataTypes.NUMBER,
    month: DataTypes.NUMBER,
    day_seq: DataTypes.NUMBER,
    hour_seq: DataTypes.NUMBER,
    minute_seq: DataTypes.NUMBER 
}, { sequelize, modelName: 'burned_fee', freezeTableName:  true, underscored: true, timestamps: false});

class ReserveTradeModel extends Model { }
ReserveTradeModel.init({
    reserve_id: DataTypes.STRING,
    reserve_address: DataTypes.STRING,
    tx: DataTypes.STRING,
    unique_tag: DataTypes.STRING,
    block_number: DataTypes.NUMBER,
    block_timestamp: DataTypes.NUMBER,
    source_address: DataTypes.STRING,
    source_token_address: DataTypes.STRING,
    source_token_symbol: DataTypes.STRING,
    source_token_decimal: DataTypes.NUMBER,
    dest_address: DataTypes.STRING,
    dest_token_address: DataTypes.STRING,
    dest_token_symbol: DataTypes.STRING,
    dest_token_decimal: DataTypes.NUMBER,
    source_amount: DataTypes.NUMBER,
    dest_amount: DataTypes.NUMBER,
    rate: DataTypes.NUMBER,
    value_eth: DataTypes.NUMBER,
    value_usd: DataTypes.NUMBER,
}, { sequelize, modelName: 'reserve_trade', freezeTableName:  true, underscored: true, timestamps: false});

class ReserveInfoModel extends Model {}
ReserveInfoModel.init({
    reserve_id: DataTypes.STRING,
    reserve_address: DataTypes.STRING,
    reserve_wallet: DataTypes.STRING,
    action: DataTypes.NUMBER,           // 1: list, 2: remove, 3: change wallet
    unique_tag: DataTypes.STRING,
    block_number: DataTypes.NUMBER,
    block_timestamp: DataTypes.NUMBER,
    type: DataTypes.NUMBER,             // reserve type
}, { sequelize, modelName: 'reserve_info', freezeTableName:  true, underscored: true, timestamps: false});


class RebateFeeModel extends Model {}
RebateFeeModel.init({
    tx: DataTypes.STRING,
    token: DataTypes.STRING,
    rebate_wallet: DataTypes.STRING,
    rebate_bps: DataTypes.NUMBER,
    rebate_fee: DataTypes.NUMBER,
    unique_tag: DataTypes.STRING,
    block_number: DataTypes.NUMBER,
    block_timestamp: DataTypes.NUMBER,            // reserve type
}, { sequelize, modelName: 'rebate_fee', freezeTableName:  true, underscored: true, timestamps: false});

class TokenInfoModel extends Model {}
TokenInfoModel.init({
    address: DataTypes.STRING,
    name: DataTypes.STRING,
    symbol: DataTypes.STRING,
    decimal: DataTypes.NUMBER,           // 1: list, 2: remove, 3: change wallet
    hidden: DataTypes.NUMBER,
    delisted: DataTypes.NUMBER,             // reserve type
}, { sequelize, modelName: 'token_info', freezeTableName:  true, underscored: true, timestamps: false});

class Rebate extends Model {} 
Rebate.init({
    reserve_id: DataTypes.NUMBER,
    reserve_address: DataTypes.STRING,
    tx: DataTypes.STRING,
    unique_tag: DataTypes.STRING,
    block_number: DataTypes.NUMBER,
    block_timestamp: DataTypes.NUMBER,
    rebate: DataTypes.NUMBER
}, { sequelize, modelName: 'rebate', freezeTableName:  true, underscored: true, timestamps: false});

class FeeDistributedModel extends Model { }
FeeDistributedModel.init({
    tx: DataTypes.STRING,
    unique_tag: DataTypes.STRING,
    block_number: DataTypes.NUMBER,
    block_timestamp: DataTypes.NUMBER,
    token_address: DataTypes.STRING,
    fee_wei: DataTypes.NUMBER,
    fee_wallet: DataTypes.STRING,
}, { sequelize, modelName: 'fee_distributed', freezeTableName:  true,  underscored: true, timestamps: false});



module.exports = { sequelize, Op, KyberTradeModel, ReserveTradeModel, FeeDistributedModel, ReserveInfoModel, TokenInfoModel, RebateFeeModel}