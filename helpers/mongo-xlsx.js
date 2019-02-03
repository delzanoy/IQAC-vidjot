const mongoXlsx = require('mongo-xlsx');

let data = [{
        name: "Peter",
        lastName: "Parker",
        isSpider: true
    },
    {
        name: "Remy",
        lastName: "LeBeau",
        powers: ["kinetic cards"]
    }
];

/* Generate automatic model for processing (A static model should be used) */
let model = mongoXlsx.buildDynamicModel(data);

/* Generate Excel */
mongoXlsx.mongoData2Xlsx(data, model, function (err, data) {
    console.log('File saved at:', data.fullPath);
});