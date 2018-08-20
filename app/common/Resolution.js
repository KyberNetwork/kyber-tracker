const config = {
    seq1: {
        prop: "minuteSeq",
        column: "minute_seq",
        value: 60,
    },
    seq5: {
        prop: "m5Seq",
        column: "m5_seq",
        value: 60 * 5,
    },
    seq15: {
        prop: "m15Seq",
        column: "m15_seq",
        value: 60 * 15,
    },
    seq30: {
        prop: "m30Seq",
        column: "m30_seq",
        value: 60 * 30,
    },
    seq60: {
        prop: "hourSeq",
        column: "hour_seq",
        value: 60 * 60,
    },
    seq120: {
        prop: "h2Seq",
        column: "h2_seq",
        value: 60 * 120,
    },
    seq240: {
        prop: "h4Seq",
        column: "h4_seq",
        value: 60 * 240,
    },
    seq360: {
        prop: "h6Seq",
        column: "h6_seq",
        value: 60 * 360,
    },
    seq720: {
        prop: "h12Seq",
        column: "h12_seq",
        value: 60 * 720,
    },
    seqD: {
        prop: "daySeq",
        column: "day_seq",
        value: 60 * 60 * 24,
    },
    seqW: {
        prop: "weekSeq",
        column: "week_seq",
        value: 60 * 60 * 24 * 7,
    },
    seqM: {
        prop: "monthSeq",
        column: "month_seq",
        value: 60 * 60 * 24 * 30,
    }
  }
const interval = {
    intervald: {
      value: 24*60*60,
      seq: 30
    },
    intervalw: {
      value: 7*24*60*60,
      seq: 240
    },
    intervalm: {
      value: 30*24*60*60,
      seq: 720
    },
    intervaly: {
      value: 365*24*60*60,
      seq: 'D'
    }
};
module.exports = {
    toColumn: (seq) => {
        const item = config["seq" + seq];
        if (!item) return null;

        return item.column;
    },

    toTimestamp: (name, value) => {
        const item = config["seq" + name];
        if (!item) return null;

        return item.value * value;
    },

    addSeqs: (row) => {
        const stamp = row.blockTimestamp || 0;
        for(var key in config) {
            row[config[key].prop] = Math.floor(stamp / config[key].value);
        }
        return row;
    },

    toSeq: (inteval) => {
      const item = interval["interval" + inteval];
      if (!item) return null;
      return item;
    }
};
