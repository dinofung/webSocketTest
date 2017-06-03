'use strict';
// import extend from 'extend';
let extend = require('extend');
let a = {
    "_id": "1s6f1assdf1s655s31s",
    "fileName": "EW44F #1",
    "customerCode": "EBD",
    "brandCode": "PYE",
    "year": "2017",
    "seasonCode": "SS",
    "lastModifiedBy": "lucychu@esquel.com",
    "lastModifiedAt": "2017-04-28 12:58:32",
    "createBy": "lucychu@esquel.com",
    "createAt": "2017-04-28 12:58:32",
    "content": [
        {
            "_id": "4ga31g643asf4ga1aas3g1as31",
            "header": {
                "colHeaders": [
                    "COMBO",
                    "FABRICATION"
                ],
                "columns": [
                    {
                        "_id": "2xf5dafa5b41b65fhhsba",
                        "data": "1.value",
                        "type": "numeric",
                        "width": 40,
                        "attribute": "HL"
                    },
                    {
                        "_id": "ghghxggh1d1h6sd4166dh",
                        "data": "2.value",
                        "type": "text",
                        "attribute": ""
                    }
                ]
            },
            "body": [
                {
                    "1": {
                        "value": "combo1",
                        "conversationId": null,
                        "cellId": "s36dh464h654hs4h6s4sdr"
                    },
                    "2": {
                        "value": "fabrication1",
                        "conversationId": "g6h1sd63hs41s6h4fd51a6g4",
                        "cellId": "a5fhsh46g4sh46t4s4gss6d"
                    },
                    "_id": "684gdf3h1s6hd3a6ga3adg"
                },
                {
                    "1": {
                        "value": "combo2",
                        "conversationId": "6b4s6d63sdf4h65s6bfd46a3sd",
                        "cellId": "4d6fhb4a646s1bs46ss34"
                    },
                    "2": {
                        "value": "fabrication2",
                        "conversationId": null,
                        "cellId": "z6f7jsd634js6f4df34j6"
                    },
                    "_id": "3sd4h61g6df44g61gadsg1"
                }
            ]
        }
    ]
};

let b = {
    "fileName": "AAAA",
    "content": [{
        "_id": "4ga31g643asf4ga1aas3g1as31",
        "body": [{
            "_id": "3sd4h61g6df44g61gadsg1",
            "2": {
                "value": "modified",
                "conversationId": "11111111111111"
            }
        }]
    }]
};

const testAssign = (o1, o2) => {
    console.time("testAssign");
    //console.log("testAssign");
    let c = Object.assign({}, o1, o2);
    console.log(JSON.stringify(c,null,2));
    console.timeEnd("testAssign");
}

const testExtend = (o1, o2) => {
    console.time("testExtend");
    // console.log("testExtend");
    let c = extend( {}, o1, o2);
    console.log(JSON.stringify(c,null,2));
    console.timeEnd("testExtend");
}

testExtend(a, b);
testAssign(a, b);