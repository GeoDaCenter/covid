const fs = require('fs');
const Pbf = require('pbf');
const path = require('path');

// Entry ========================================

var Entry = {};

Entry.read = function (pbf, end) {
  return pbf.readFields(Entry._readField, { geoid: 0, vals: [] }, end);
};
Entry._readField = function (tag, obj, pbf) {
  if (tag === 1) obj.geoid = pbf.readVarint(true);
  else if (tag === 2) pbf.readPackedVarint(obj.vals, true);
};
Entry.write = function (obj, pbf) {
  if (obj.geoid) pbf.writeVarintField(1, obj.geoid);
  if (obj.vals) pbf.writePackedVarint(2, obj.vals);
};

// Rows ========================================

var Rows = {};

Rows.read = function (pbf, end) {
  return pbf.readFields(Rows._readField, { dates: [], row: [] }, end);
};
Rows._readField = function (tag, obj, pbf) {
  if (tag === 1) obj.dates.push(pbf.readString());
  else if (tag === 2) obj.row.push(Entry.read(pbf, pbf.readVarint() + pbf.pos));
};
Rows.write = function (obj, pbf) {
  if (obj.dates)
    for (var i = 0; i < obj.dates.length; i++)
      pbf.writeStringField(1, obj.dates[i]);
  if (obj.row)
    for (i = 0; i < obj.row.length; i++)
      pbf.writeMessage(2, Entry.write, obj.row[i]);
};


const directoryPath = path.join(__dirname, '../public/pbf/');

const cleanVals = (vals, multiplier) => {
    const returnVals = [];
    for (let i=0; i<vals.length; i++) {
        if (vals[i] === -999 || vals[i] === -9999) {
            returnVals.push(null);
        } else {
            returnVals.push(vals[i] * multiplier);
        }
    }
    return returnVals;
}
//passsing directoryPath and callback function
console.log('Building timeseries...');
const t0 = new Date()
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
        if (!(file.includes('2020') || file.includes('2021') || file.includes('latest') || file.includes('dotDensity'))){
            const fileName = file.split('.')[0]
            const multiplier = file.split('.').length > 2
                ? +file.split('.')[1].split('-')[1]
                : 1
            const data = fs.readFileSync(`public/pbf/${file}`)
            const pbf = new Pbf(data);
            const {dates,row} = Rows.read(pbf);
            try {
                fs.mkdirSync(`public/timeseries`);
            } catch {}

            try {
                fs.mkdirSync(`public/timeseries/${fileName}`);
            } catch {}

            fs.writeFileSync(`public/timeseries/${fileName}/dates.json`,  `${JSON.stringify(dates)}`)
            row.forEach(entry => {
                fs.writeFileSync(`public/timeseries/${fileName}/${entry.geoid}.json`,  `${JSON.stringify(cleanVals(entry.vals, multiplier))}`)
            })
        }
    });

    console.log(`Done in ${new Date() - t0} ms`);
});