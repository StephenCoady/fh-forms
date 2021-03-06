require('./../Fixtures/env.js');
var forms = require('../../lib/forms.js');
var mongoose = require('mongoose');
var models = require('../../lib/common/models.js')();
var async = require('async');
var initDatabase = require('./../setup.js').initDatabase;
var assert = require('assert');
var util = require('util');
var _ = require('underscore');
var logger = require('../../lib/common/logger').getLogger();
var moment = require('moment');

var testFilePath = "./test/Fixtures/test.pdf";
var options = {'uri': process.env.FH_DOMAIN_DB_CONN_URL};
var testBigFormId;
var bigFieldIds = {};

var requiredFormId;
var requiredFieldIds = {};

var required2FieldIds = {};
var requiredForm2Id;

var testSubmitFormBaseInfo = {
  "appId": "thisisnowaprojectId123456",
  "appClientId": "thisistheidpassedbytheclient",
  "appCloudName": "appCloudName123456",
  "appEnvironment": "devLive",
  "userId": "user123456",
  "deviceId": "device123456",
  "timezoneOffset" : 120,
  "deviceIPAddress": "192.168.1.1",
  "deviceFormTimestamp": new Date().getTime(),
  "comments": [{
    "madeBy": "somePerson@example.com",
    "madeOn": new Date().getTime(),
    "value": "This is a comment"
  },{
    "madeBy": "somePerson@example.com",
    "madeOn": new Date().getTime(),
    "value": "This is another comment"
  }]
};

module.exports.test = {}; module.exports.test.before = function(finish){
  initDatabase(assert, function(err){
    assert.ok(!err);

    createTestData(assert, function(err){
      assert.ok(!err);
      finish();
    });
  });
}

module.exports.test.after = function(finish){
  forms.tearDownConnection(options, function(err) {
    assert.ok(!err);
    finish();
  });
};



//////////////////////// Testing all of the field types for valid and invalid parameters

module.exports.test.testSubmitText = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["textField"],
    "fieldValues": ["test1", "test2"]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": false}, function(){
    finish();
  });
};

module.exports.test.testSubmitTextTooShort = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["textField"],
    "fieldValues": ["sho", "sho"]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
    finish();
  });
}

module.exports.test.testSubmitTextTooLong = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["textField"],
    "fieldValues": ["test1test1test1test1test1test1", "test1test1test1test1test1test1test1"]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
    finish();
  });
};





module.exports.test.testSubmitTextArea = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["textAreaField"],
    "fieldValues": ["test12", "test12", "test12"]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": false}, function(){
    finish();
  });
};

module.exports.test.testSubmitTextAreaTooLong = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["textAreaField"],
    "fieldValues": ["test1test1test1test1test1", "test2test2test2test2test2", "test12"]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
    finish();
  });
};

module.exports.test.testSubmitTextAreaTooShort = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["textAreaField"],
    "fieldValues": ["sho", "sho", "test12"]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
    finish();
  });
};




module.exports.test.testSubmitFile = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var file1Details = {
    "fileName" : "test.pdf",
    "fileSize" : 123456,
    "fileType" : "application/pdf",
    "fileUpdateTime" : new Date().getTime(),
    "hashName" : "filePlaceHolderhash123456"
  };

  var file2Details = {
    "fileName" : "test2.jpg",
    "fileSize" : 123456,
    "fileType" : "image/jpeg",
    "fileUpdateTime" : new Date().getTime(),
    "hashName" : "filePlaceHolder124124"
  };

  var testValues = [{
    "fieldId" : bigFieldIds["fileField"],
    "fieldValues": [file1Details, file2Details]
  }];

  submission.formFields = testValues;



  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": false}, function(){
    finish();
  });
};

module.exports.test.testSubmitFileWrongPlaceholder = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var file1Details = {
    "fileName" : "test.pdf",
    "fileSize" : 123456,
    "fileType" : "application/pdf",
    "fileUpdateTime" : new Date().getTime(),
    "hashName" : "filePlaceHolderhash123456"
  };

  var file2Details = {
    "fileName" : "test2.jpg",
    "fileSize" : 123456,
    "fileType" : "image/jpeg",
    "fileUpdateTime" : new Date().getTime(),
    "hashName" : "wrongGierlsfdsfdsf"
  };

  var testValues = [{
    "fieldId" : bigFieldIds["fileField"],
    "fieldValues": [file1Details, file2Details]
  }];

  submission.formFields = testValues;


  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
    finish();
  });
};



module.exports.test.testSubmitRadio = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["radioField"],
    "fieldValues": ["radio1", "radio2"]
  }];

  submission.formFields = testValues;



  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": false}, function(){
    finish();
  });
};

module.exports.test.testSubmitRadioWrongOption = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["radioField"],
    "fieldValues": [{
      "values" : ["radio1", "wrongradio2"]
    }]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
    finish();
  });
};


module.exports.test.testSubmitCheckBox = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["checkboxField"],
    "fieldValues": [{"selections" : ["red", "blue", "green"]}, {"selections" : ["red", "blue", "purple"]}]
  }];

  submission.formFields = testValues;



  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": false}, function(){
    finish();
  });
};

module.exports.test.testSubmitCheckBoxWrongOption = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["checkboxField"],
    "fieldValues": [{"selections" : ["red", "blue", "cyan"]}, {"selections" : ["red", "blue", "purple"]}]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
    finish();
  });
};

module.exports.test.testSubmitCheckBoxTooFewOptions = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["checkboxField"],
    "fieldValues": [{"selections" : ["red"]}, {"selections" : ["red", "blue", "purple"]}]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
    finish();
  });
};

module.exports.test.testSubmitCheckBoxTooManyOptions = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["checkboxField"],
    "fieldValues": [{"selections" : ["red", "blue", "green", "purple"]}, {"selections" : ["red", "blue", "purple"]}]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
    finish();
  });
};







module.exports.test.testSubmitNumber = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["numberField"],
    "fieldValues": [12, " 12 "]
  }];

  submission.formFields = testValues;



  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": false}, function(){
    finish();
  });
};

module.exports.test.testSubmitNumberNotANumber = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["numberField"],
    "fieldValues": [12, "I'm not a number"]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
    finish();
  });
};

module.exports.test.testSubmitNumberTooBig = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["numberField"],
    "fieldValues": [12, 1234212332]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
    finish();
  });
};

module.exports.test.testSubmitNumberTooSmall = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["numberField"],
    "fieldValues": [12, -34]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
    finish();
  });
};




module.exports.test.testSubmitLocationLatLong = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["locationLatLongField"],
    "fieldValues": [{"lat" : "5.555848", "long" : "-52.031250"}, {"lat" : "1.552348", "long" : "-13.031430"}]
  }];

  submission.formFields = testValues;



  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": false}, function(){
    finish();
  });
};

module.exports.test.testSubmitLocationLatLongInvalid = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["locationLatLongField"],
    "fieldValues": [{"latss" : "5.555848", "long" : "-52.031250"}, {"lat" : "fas48", "long" : "-13.031430"}]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
    finish();
  });
};





module.exports.test.testSubmitLocationNorthEast = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["locationNorthEastField"],
    "fieldValues": [{"zone" : "11U", "eastings" : "594934", "northings" : "5636174"}, {"zone" : "12U", "eastings" : "594934", "northings" : "5636174"}]
  }];

  submission.formFields = testValues;



  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": false}, function(){
    finish();
  });
};

module.exports.test.testSubmitLocationNorthEastInvalid = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["locationNorthEastField"],
    "fieldValues": [{"zone" : "", "eastings" : "BAD", "northings" : "5636123474"}, {"zone" : "", "eastings" : "594934", "northings" : "5636174"}]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
    finish();
  });
};



module.exports.test.testSubmitDate = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["dateField"],
    "fieldValues": [moment().format("YYYY/MM/DD"), moment().format("YYYY/MM/DD")]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": false}, function(){
    finish();
  });
};

module.exports.test.testSubmitDateInvalid = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["dateField"],
    "fieldValues": [moment().format("YYYY/MM/DD"), "14*23452346/235236"]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
    finish();
  });
};


module.exports.test.testSubmitDateTime = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["dateTimeField"],
    "fieldValues": [moment().format("YYYY-MM-DD HH:mm:ss"), moment().format("YYYY-MM-DD HH:mm:ss")]
  }];

  submission.formFields = testValues;


  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": false}, function(){
    finish();
  });
};

module.exports.test.testSubmitDateTimeInvalid = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["dateTimeField"],
    "fieldValues": [moment().format("YYYY-MM-DD HH:mm:ss"), "5/11/13 332523:05:54"]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
    finish();
  });
};


module.exports.test.testSaveRequiredFields = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = requiredFormId;

  var testValues = [{
    "fieldId" : requiredFieldIds["requiredTextField1"],
    "fieldValues": ["This was some required text added requiredTextField1.", "This was some required text added requiredTextField1."]
  }, {
    "fieldId" : requiredFieldIds["requiredTextField2"],
    "fieldValues": ["This was some required text added requiredTextField2.", "This was some required text added requiredTextField2."]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": false}, function(){
    finish();
  });
};


module.exports.test.testDidNotSaveRequiredField = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = requiredFormId;

  var testValues = [{
    "fieldId" : requiredFieldIds["requiredTextField1"],
    "fieldValues": ["This was some required text added.", "This was some required text added."]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
    finish();
  });
};

module.exports.test.testDidNotSaveRequiredFieldFormUpdated = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = requiredFormId;



  var testValues = [{
    "fieldId" : requiredFieldIds["requiredTextField1"],
    "fieldValues": ["This was some required text added requiredTextField1.", "This was some required text added requiredTextField1."]
  }, {
    "fieldId" : requiredFieldIds["requiredTextField2"],
    "fieldValues": ["This was some required text added requiredTextField2.", "This was some required text added requiredTextField2."]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": false}, function(){

    //Submission was successfull as it is valid.

    //Adding another required field and try agai
    addNewField(assert, requiredFormId, true, function(err){
      assert.ok(!err);

      //New page is now saved. Try the submission again -- should fail and return the current form definition
      submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true, "newFormDefinition": true}, function(){
        finish();
      });
    });
  });
};

module.exports.test.testSaveRequiredFieldsFormUpdated = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = requiredForm2Id;

  var testValues = [{
    "fieldId" : required2FieldIds["requiredTextField1"],
    "fieldValues": ["This was some required text added requiredTextField1.", "This was some required text added requiredTextField1."]
  }, {
    "fieldId" : required2FieldIds["requiredTextField2"],
    "fieldValues": ["This was some required text added requiredTextField2.", "This was some required text added requiredTextField2."]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": false}, function(){

    addNewField(assert, requiredForm2Id, false, function(err){
      assert.ok(!err);

      submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": false}, function(){
        finish();
      });
    });
  });
};


//MATRIX FIELDS ARE NOT DEFINED IN APPFORMS. Not included
//module.exports.test.testSubmitMatrix = function(finish){
//  var submission = testSubmitFormBaseInfo;
//  submission.formId = testBigFormId;
//
//  var testValues = [{
//    "fieldId" : bigFieldIds["matrixField"],
//    "fieldValues": [{
//      "values" : [{
//        "key" : "matrow1",
//        "value": "matCol1"
//      },{
//        "key" : "matrow2",
//        "value": "matCol3"
//      },{
//        "key" : "matrow3",
//        "value": "matCol2"
//      }]
//    }, {
//      "values" : [{
//        "key" : "matrow1",
//        "value": "matCol2"
//      },{
//        "key" : "matrow2",
//        "value": "matCol4"
//      },{
//        "key" : "matrow3",
//        "value": "matCol5"
//      }]
//    }]
//  }];
//
//  submission.formFields = testValues;
//
//  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": false}, function(){
//    finish();
//  });
//};
//
//module.exports.test.testSubmitMatrixInvalidRow = function(finish){
//  var submission = testSubmitFormBaseInfo;
//  submission.formId = testBigFormId;
//
//  var testValues = [{
//    "fieldId" : bigFieldIds["matrixField"],
//    "fieldValues": [{
//      "values" : [{
//        "key" : "matrow1",
//        "value": "matCol1"
//      },{
//        "key" : "matrow22",
//        "value": "matCol3"
//      },{
//        "key" : "matrow3",
//        "value": "matCol2"
//      }]
//    }, {
//      "values" : [{
//        "key" : "matrow1",
//        "value": "matCol2"
//      },{
//        "key" : "matrow2",
//        "value": "matCol4"
//      },{
//        "key" : "matrow3",
//        "value": "matCol5"
//      }]
//    }]
//  }];
//
//  submission.formFields = testValues;
//
//  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
//    finish();
//  });
//};
//
//module.exports.test.testSubmitMatrixInvalidCol = function(finish){
//  var submission = testSubmitFormBaseInfo;
//  submission.formId = testBigFormId;
//
//  var testValues = [{
//    "fieldId" : bigFieldIds["matrixField"],
//    "fieldValues": [{
//      "values" : [{
//        "key" : "matrow1",
//        "value": "matCol1"
//      },{
//        "key" : "matrow22",
//        "value": "matCol3"
//      },{
//        "key" : "matrow3",
//        "value": "matCol2"
//      }]
//    }, {
//      "values" : [{
//        "key" : "matrow1",
//        "value": "matCol2"
//      },{
//        "key" : "matrow2",
//        "value": "matCol4"
//      },{
//        "key" : "matrow3",
//        "value": "matCol54"
//      }]
//    }]
//  }];
//
//  submission.formFields = testValues;
//
//  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
//    finish();
//  });
//};
//
//module.exports.test.testSubmitMatrixInvalidMissingValue = function(finish){
//  var submission = testSubmitFormBaseInfo;
//  submission.formId = testBigFormId;
//
//  var testValues = [{
//    "fieldId" : bigFieldIds["matrixField"],
//    "fieldValues": [{
//      "values" : [{
//        "key" : "matrow1",
//        "value": "matCol1"
//      },{
//        "key" : "matrow22",
//        "value": "matCol3"
//      },{
//        "key" : "matrow3",
//        "value": "matCol2"
//      }]
//    }, {
//      "values" : [{
//        "key" : "matrow1",
//        "value": "matCol2"
//      },{
//        "key" : "matrow2",
//        "value": "matCol4"
//      }]
//    }]
//  }];
//
//  submission.formFields = testValues;
//
//  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
//    finish();
//  });
//};




function addNewField(assert, formId, fieldRequired, cb){
  //Need to create a form that contains every possible field type.
  var connection = mongoose.createConnection(options.uri);

  //Set up the connection
  models.init(connection);

  //Creating a theme
  var Form = models.get(connection, models.MODELNAMES.FORM);
  var Field = models.get(connection, models.MODELNAMES.FIELD);
  var Page = models.get(connection, models.MODELNAMES.PAGE);


  var newRequiredField = new Field({
    "name":"newRequiredField",
    "helpText":"This is a new required text field",
    "type":"text",
    "repeating":true,
    "fieldOptions":{
      "definition":{
        "maxRepeat":5,
        "minRepeat":2
      },
      "validation":{
        "min":20,
        "max":100
      }
    },
    "required":fieldRequired
  });

  newRequiredField.save(function(err){
    assert.ok(!err);

    Form.findOne({"_id" : formId}).populate("pages").exec(function(err, result){
      assert.ok(!err);
      assert.ok(result);
      assert.ok(result.pages);
      assert.ok(Array.isArray(result.pages));
      assert.ok(result.pages[0]);

      //Update the page
      Page.findOne({"_id": result.pages[0]._id}, function(err, foundPage){
        assert.ok(!err);

        foundPage.fields.push(newRequiredField._id);
        foundPage.save(function(err){
          assert.ok(!err);

          connection.close(function(err){
            if(err) console.log(err);

            return cb();
          });
        });
      });
    });
  });
}

module.exports.test.testSubmitDropdown = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  submission.formFields = [{
    "fieldId" : bigFieldIds["dropdownField"],
    "fieldValues": ["dropdownVal1", "dropdownVal2"]
  }];

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": false}, function(){
    finish();
  });
};

module.exports.test.testSubmitDropdownWrongOption = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  var testValues = [{
    "fieldId" : bigFieldIds["dropdownField"],
    "fieldValues": ["dropdownVal1", "wrongVal"]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": true}, function(){
    finish();
  });
};

module.exports.test.testSubmitUpdate = function(finish){
  var submission = testSubmitFormBaseInfo;
  submission.formId = testBigFormId;

  // submit some test values to test form submission endpoint
  var testValues = [{
    "fieldId" : bigFieldIds["textField"],
    "fieldValues": ["test1", "test2"]
  }];

  submission.formFields = testValues;

  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": false}, function(err, res){
    assert.ok(!err, err);
    assert.ok(res);
    assert.equal(res.formSubmission.status, "pending");

    // keep track of updatedTimestamp, and make sure it changes with subsequent updates
    var updatedTimestamp = res.formSubmission.updatedTimestamp.getTime();
    assert.ok(updatedTimestamp);

    // verify test values
    assert.equal(res.formSubmission.formFields[0].fieldValues[0], "test1");
    assert.equal(res.formSubmission.formFields[0].fieldValues[1], "test2");

    // update test values and call update
    var updatedValues = [{
      "fieldId" : bigFieldIds["textField"],
      "fieldValues": ["test1updated", "test2updated"]
    }];
    submission._id = res.formSubmission._id;
    submission.formFields = updatedValues;
    submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": false}, function(err, res){
      assert.ok(!err, err);
      assert.ok(res);
      assert.equal(res.formSubmission.status, "pending");
      assert.notEqual(updatedTimestamp, res.formSubmission.updatedTimestamp.getTime());
      updatedTimestamp = res.formSubmission.updatedTimestamp.getTime();

      // verify updated test values
      assert.equal(res.formSubmission._id.toString(), submission._id.toString());
      assert.equal(res.formSubmission.formFields[0].fieldValues[0], "test1updated");
      assert.equal(res.formSubmission.formFields[0].fieldValues[1], "test2updated");

      // complete submission
      forms.completeFormSubmission({"uri": process.env.FH_DOMAIN_DB_CONN_URL, "submission": {"submissionId" : submission._id}}, function(err, res){
        assert.ok(!err, err);
        assert.ok(res);
        assert.equal(res.formSubmission.status, "complete", "should be COMPLETE submission: " + util.inspect(res.formSubmission));
        assert.notEqual(updatedTimestamp, res.formSubmission.updatedTimestamp.getTime());
        updatedTimestamp = res.formSubmission.updatedTimestamp.getTime();

        // read submission back
        forms.getSubmission(options, {_id: submission._id}, function (err, res){
          assert.ok(!err, err);
          assert.ok(res);
          assert.equal(res.status, "complete");
          assert.equal(updatedTimestamp, res.updatedTimestamp.getTime());

          // verify test values
          assert.equal(res._id.toString(), submission._id.toString());
          assert.equal(res.formFields[0].fieldValues[0], "test1updated");
          assert.equal(res.formFields[0].fieldValues[1], "test2updated");
          finish();
        });
      });
    });
  });
};

module.exports.test.testSubmitUpdateFileField = function(finish){
  var submission = _.omit(testSubmitFormBaseInfo, "_id");
  submission.formId = testBigFormId;


  var file1Details = {
    "fileName" : "test.pdf",
    "fileSize" : 123456,
    "fileType" : "application/pdf",
    "fileUpdateTime" : new Date().getTime(),
    "hashName" : "filePlaceHolderhash123456"
  };

  var file2Details = {
    "fileName" : "test.pdf",
    "fileSize" : 123456,
    "fileType" : "application/pdf",
    "fileUpdateTime" : new Date().getTime(),
    "hashName" : "filePlaceHolder124124"
  };

  var testValues = [{
    "fieldId" : bigFieldIds["fileField"],
    "fieldValues": [file1Details, file2Details]
  }];

  submission.formFields = testValues;

  // create submission with file placeholder
  submitAndCheckForm(assert, submission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : submission, "errExpected": false}, function(err, res){
    assert.ok(!err, err);
    assert.ok(res);
    assert.equal(res.formSubmission.status, "pending");

    // keep track of updatedTimestamp, and make sure it changes with subsequent updates
    var updatedTimestamp = res.formSubmission.updatedTimestamp.getTime();
    assert.ok(updatedTimestamp);

    var submission = res.formSubmission;

    // upload file 1, verify ok
    var testFileSubmission = {"submissionId" : submission._id, "fileId": "filePlaceHolderhash123456", "fieldId": bigFieldIds["fileField"], "fileStream" : testFilePath, "keepFile" : true};
    forms.submitFormFile({"uri": process.env.FH_DOMAIN_DB_CONN_URL, "submission" : testFileSubmission}, function(err, res){
      assert.ok(!err, err);
      assert.ok(res);
      assert.equal(res.formSubmission.status, "pending");
      assert.notEqual(updatedTimestamp, res.formSubmission.updatedTimestamp.getTime());
      updatedTimestamp = res.formSubmission.updatedTimestamp.getTime();

      // upload file 2, verify ok
      var testFileSubmission = {"submissionId" : submission._id, "fileId": "filePlaceHolder124124", "fieldId": bigFieldIds["fileField"], "fileStream" : testFilePath, "keepFile" : true};
      forms.submitFormFile({"uri": process.env.FH_DOMAIN_DB_CONN_URL, "submission" : testFileSubmission}, function(err, res){
        assert.ok(!err, err);
        assert.ok(res);
        assert.equal(res.formSubmission.status, "pending");
        assert.notEqual(updatedTimestamp, res.formSubmission.updatedTimestamp.getTime());
        updatedTimestamp = res.formSubmission.updatedTimestamp.getTime();

        // complete submission, verify ok
        forms.completeFormSubmission({"uri": process.env.FH_DOMAIN_DB_CONN_URL, "submission": {"submissionId" : submission._id}}, function(err, res){
          assert.ok(!err, err);
          assert.ok(res);
          var submission = res.formSubmission;
          assert.equal(submission.status, "complete");
          assert.notEqual(updatedTimestamp, res.formSubmission.updatedTimestamp.getTime());
          updatedTimestamp = res.formSubmission.updatedTimestamp.getTime();

          var wrongFileDetails = {
            "fileName" : "test.pdf",
            "fileSize" : 123456,
            "fileType" : "application/pdf",
            "fileUpdateTime" : new Date().getTime(),
            "hashName" : "a_new_id"
          };

          // update file field, modifying an id
          // verify update failed, not allowed to modify ids
          var updatedSubmission = JSON.parse(JSON.stringify(submission));
          updatedSubmission.formFields[0].fieldId = bigFieldIds["fileField"]; // reset fieldId to just the id, not the full field definition, as returned when reading a field
          updatedSubmission.formFields[0].fieldValues[1] = wrongFileDetails;
          submitAndCheckForm(assert, updatedSubmission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL, "errExpected": true}, function(err){
            assert.ok(err);
            assert.equal(false, err.valid);
            //Repeating field error messages are in the same index as the value entered.
            assert.equal(err[bigFieldIds["fileField"]].errorMessages[0], null);
            assert.equal(err[bigFieldIds["fileField"]].errorMessages[1], "Invalid file placeholder texta_new_id");

            // update file field, adding an id
            // verify update failed, not allow to add new ids, only placeholders
            var updatedSubmission = JSON.parse(JSON.stringify(submission));
            updatedSubmission.formFields[0].fieldId = bigFieldIds["fileField"]; // reset fieldId to just the id, not the full field definition, as returned when reading a field
            updatedSubmission.formFields[0].fieldValues.push(wrongFileDetails);
            submitAndCheckForm(assert, updatedSubmission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL, "errExpected": true}, function(err){
              assert.ok(err);

              logger.debug("err", err, bigFieldIds["fileField"]);
              assert.equal(false, err.valid);
              //Repeating field error messages are in the same index as the value entered.
              assert.equal(err[bigFieldIds["fileField"]].errorMessages[0], null);
              assert.equal(err[bigFieldIds["fileField"]].errorMessages[1], null);
              assert.equal(err[bigFieldIds["fileField"]].errorMessages[2], "Invalid file placeholder texta_new_id");

              // update file field, adding a placeholder
              // verify update ok, and placeholder added, status pending as we've a placeholder waiting
              var updatedSubmission = JSON.parse(JSON.stringify(submission));
              updatedSubmission.formFields[0].fieldId = bigFieldIds["fileField"];
              //All files submissions should be objects, not strings.
              var newPlaceHolder = {
                "fileName" : "test.pdf",
                "fileSize" : 123456,
                "fileType" : "application/pdf",
                "fileUpdateTime" : new Date().getTime(),
                "hashName" : "filePlaceHolderhash777777"
              };
              // reset fieldId to just the id, not the full field definition, as returned when reading a field
              updatedSubmission.formFields[0].fieldValues.push(newPlaceHolder);
              submitAndCheckForm(assert, updatedSubmission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : updatedSubmission, "errExpected": false}, function(err, res){
                assert.ok(!err, err);
                assert.ok(res);
                assert.equal(res.formSubmission.status, "pending");
                assert.notEqual(updatedTimestamp, res.formSubmission.updatedTimestamp.getTime());
                updatedTimestamp = res.formSubmission.updatedTimestamp.getTime();

                // update file field, removing an id
                // verify update ok, and file id removed, status pending
                updatedSubmission.formFields[0].fieldId = bigFieldIds["fileField"]; // reset fieldId to just the id, not the full field definition, as returned when reading a field
                updatedSubmission.formFields[0].fieldValues.shift(); // remove first id
                submitAndCheckForm(assert, updatedSubmission, {"uri": process.env.FH_DOMAIN_DB_CONN_URL,  "expectedSubmissionJSON" : updatedSubmission, "errExpected": false}, function(err, res){
                  assert.ok(!err, err);
                  assert.ok(res);
                  assert.equal(res.formSubmission.status, "pending");
                  assert.notEqual(updatedTimestamp, res.formSubmission.updatedTimestamp.getTime());
                  updatedTimestamp = res.formSubmission.updatedTimestamp.getTime();

                  // upload file for new placeholder
                  // verify ok, status pending
                  var testFileSubmission = {"submissionId" : submission._id, "fileId": "filePlaceHolderhash777777", "fieldId": bigFieldIds["fileField"], "fileStream" : testFilePath, "keepFile" : true};
                  forms.submitFormFile({"uri": process.env.FH_DOMAIN_DB_CONN_URL, "submission" : testFileSubmission}, function(err, res){
                    assert.ok(!err, err);
                    assert.ok(res.formSubmission.status === "pending");
                    assert.notEqual(updatedTimestamp, res.formSubmission.updatedTimestamp.getTime());
                    updatedTimestamp = res.formSubmission.updatedTimestamp.getTime();

                    // complete submission
                    // verify ok, status complete
                    forms.completeFormSubmission({"uri": process.env.FH_DOMAIN_DB_CONN_URL, "submission": {"submissionId" : submission._id}}, function(err, res){
                      assert.ok(!err, err);
                      assert.ok(res);
                      assert.ok(res.status === "complete");
                      assert.equal(res.formSubmission.status, "complete");
                      assert.equal(res.formSubmission.formFields[0].fieldValues.length, 2, res.formSubmission.formFields[0].fieldValues);
                      assert.notEqual(updatedTimestamp, res.formSubmission.updatedTimestamp.getTime());
                      updatedTimestamp = res.formSubmission.updatedTimestamp.getTime();

                      // read back submission
                      // verify ok, status complete
                      forms.getSubmission(options, {_id: submission._id}, function (err, res){
                        assert.ok(!err, err);
                        assert.ok(res);
                        assert.equal(res._id.toString(), submission._id.toString());
                        assert.equal(res.status, "complete");
                        assert.equal(res.formFields[0].fieldValues.length, 2, res.formFields[0].fieldValues);
                        assert.equal(updatedTimestamp, res.updatedTimestamp.getTime());

                        finish();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};


function checkSubmissionExists(assert, submissionId, options, cb){
  //Need to create a form that contains every possible field type.
  var connection = mongoose.createConnection(options.uri);

  //Set up the connection
  models.init(connection);

  var FormSubmission = models.get(connection, models.MODELNAMES.FORM_SUBMISSION);

  FormSubmission.findOne({"_id": submissionId}, function(subErr, result){
    assert.ok(!subErr);
    assert.ok(result);

    //submissionId, timestamp are dynamic, need to check they exist first.
    assert.ok(result.masterFormTimestamp); //Checking for the masterFormTimestamp
    assert.ok(result.deviceFormTimestamp); //Checking for the masterFormTimestamp
    assert.ok(result.submissionStartedTimestamp); //Checking for the masterFormTimestamp
    assert.ok(result.submissionCompletedTimestamp); //Checking for the submissionCompletedTimestamp -- This will be default 0 as complete has not been saved yet

    var submissionJSON = result.toJSON();

    //timestamp, formId, submissionId already checked.
    delete submissionJSON._id;
    delete submissionJSON.masterFormTimestamp;
    delete submissionJSON.submissionStartedTimestamp;
    delete submissionJSON.submissionCompletedTimestamp;

    //Now full comparison with the expected form submission definition.
    var expectedSubmissionJSON = options.expectedSubmissionJSON;
    expectedSubmissionJSON.status = "pending";//Status for these tests will always be pending
    
    connection.close(function(err){
      if(err) console.log("Mongoose Conn Err", err);

      cb(subErr, result);
    });
  });
}


function submitAndCheckForm(assert, submission, options, cb ){

  if(!submission._id){
    submission._id = null;
  }

  forms.submitFormData({"uri" : process.env.FH_DOMAIN_DB_CONN_URL, "submission" : submission}, function(err, result){
    if(options.errExpected){
      if(!result.error) console.log(JSON.stringify(submission), result, options);
      assert.ok(!err);
      assert.ok(result.error);
      return cb(result.error, result);
    } else {
      if(result.error) console.log(result.error);
      assert.ok(!err, "No error expected for submitFormData " + util.inspect(err));
      assert.ok(result, "Result Object Expected for submitFormData");
      assert.ok(!result.error, "No error expected for submitFormData " + util.inspect(result.error));
      assert.ok(result.submissionId, "Expected submissionId from result but got nothing: submitFormData");
      assert.ok(result.formSubmission, "Expected form submission return object but got nothing");
      assert.ok(result.formSubmission.appId, "Expected appId from result but got nothing: submitFormData: " + util.inspect(result));
      assert.ok(result.formSubmission.appClientId, "Expected clientAppId from result but got nothing: submitFormData" + util.inspect(result));
      assert.ok(result.formSubmission.appId === "thisisnowaprojectId123456", "Expected result appId to be thisisnowaprojectId123456 but was " + result.formSubmission.appId);
      assert.ok(result.formSubmission.appClientId === "thisistheidpassedbytheclient", "Expected result clientAppId to be thisistheidpassedbytheclient but was " + result.formSubmission.clientAppId);

      if(options.newFormDefinition){
        assert.ok(result.updatedFormDefinition);
        assert.ok(result.updatedFormDefinition.fieldRef);
        assert.ok(result.updatedFormDefinition.pageRef);
      }

      checkSubmissionExists(assert, result.submissionId, options, function(err){
        assert.ok(!err);
        return cb(null, result);
      });
    }
  });
}



function createTestData(assert, cb){

  //Need to create a form that contains every possible field type.
  var connection = mongoose.createConnection(options.uri);

  //Set up the connection
  models.init(connection);

  //Creating a theme
  var Form = models.get(connection, models.MODELNAMES.FORM);
  var Field = models.get(connection, models.MODELNAMES.FIELD);
  var Page = models.get(connection, models.MODELNAMES.PAGE);

  async.series([saveBigForm, saveRequiredForm, saveNotRequiredForm], function(err){
    assert.ok(!err);

    connection.close(function(err){
      if (err) console.log(err);
      assert.ok(!err);

      return cb();
    });
  });

  function saveNotRequiredForm(cb){
    var requiredForm = new Form({"updatedBy" : "user2@example.com", "createdBy" : "user2@example.com", "name" : "requiredForm2", "description": "This form2 is for testing required fields."});
    var testRequiredPage = new Page({"name" : "testRequiredPage2", "createdBy" : "user2@example.com", "description": "This is a test page for required fields."});
    var fields = [];

    var requiredField1 = new Field({
      "name":"requiredTextField1",
      "helpText":"This is a required text field",
      "type":"text",
      "repeating":true,
      "fieldOptions":{
        "definition":{
          "maxRepeat":5,
          "minRepeat":2
        },
        "validation":{
          "min":20,
          "max":100
        }
      },
      "required":true
    });
    var requiredField2 = new Field({
      "name":"requiredTextField2",
      "helpText":"This is another required text field",
      "type":"text",
      "repeating":true,
      "fieldOptions":{
        "definition":{
          "maxRepeat":5,
          "minRepeat":2
        },
        "validation":{
          "min":20,
          "max":100
        }
      },
      "required":true
    });
    fields.push(requiredField1);
    fields.push(requiredField2);

    saveSingleForm(fields, testRequiredPage, requiredForm, function(err, formId, fieldIds){
      assert.ok(!err);
      assert.ok(formId);

      required2FieldIds = fieldIds;
      requiredForm2Id = formId;
      cb();
    });
  }

  function saveBigForm(cb){
    var testFieldsForm = new Form({"updatedBy" : "user@example.com", "createdBy" : "user@example.com", "name" : "testFieldsForm", "description": "This form is for testing fields."});
    var testPage = new Page({"name" : "testPage", "description": "This is a test page for the win."});

    var testData = require("./../Fixtures/formSubmissions.js");

    var textField = new Field(testData.textFieldData);
    var textAreaField = new Field(testData.textAreaFieldData);
    var numberField = new Field(testData.numberFieldData);
    var emailAddressField = new Field(testData.emailAddressFieldData);
    var radioField = new Field(testData.radioFieldData);
    var dropdownField = new Field(testData.dropdownFieldData);
    var matrixField = new Field(testData.matrixFieldData);
    var checkboxField = new Field(testData.checkboxFieldData);
    var locationLatLongField = new Field(testData.locationLatLongFieldData);
    var locationNorthEastField = new Field(testData.locationNorthEastFieldData);
    var locationMapField = new Field(testData.locationMapFieldData);
    var dateField = new Field(testData.dateFieldData);
    var timeField = new Field(testData.timeFieldData);
    var dateTimeField = new Field(testData.dateTimeFieldData);
    var sectionBreakField = new Field(testData.sectionBreakFieldData);
    var sectionBreak2Field = new Field(testData.sectionBreak2FieldData);
    var fileField = new Field(testData.fileFieldData);
    var photoField = new Field(testData.photoFieldData);
    var signatureField = new Field(testData.photoFieldData);


    var fields = [];
    fields.push(textField);
    fields.push(textAreaField);
    fields.push(numberField);
    fields.push(sectionBreakField);
    fields.push(emailAddressField);
    fields.push(radioField);
    fields.push(matrixField);
    fields.push(checkboxField);
    fields.push(dropdownField);
    fields.push(locationLatLongField);
    fields.push(sectionBreak2Field);
    fields.push(locationNorthEastField);
    fields.push(locationMapField);
    fields.push(dateField);
    fields.push(timeField);
    fields.push(dateTimeField);
    fields.push(fileField);
    fields.push(photoField);
    fields.push(signatureField);

    saveSingleForm(fields, testPage, testFieldsForm, function(err, formId, fieldIds){
      assert.ok(!err);
      assert.ok(formId);
      assert.ok(fieldIds);

      bigFieldIds = fieldIds;
      testBigFormId = formId;
      cb();
    });
  }

  function saveRequiredForm(cb){
    var requiredForm = new Form({"updatedBy" : "user@example.com", "createdBy" : "user@example.com", "name" : "requiredForm", "description": "This form is for testing required fields."});
    var testRequiredPage = new Page({"name" : "testRequiredPage", "description": "This is a test page for required fields."});
    var fields = [];

    var requiredField1 = new Field({
      "name":"requiredTextField1",
      "helpText":"This is a required text field",
      "type":"text",
      "repeating":true,
      "fieldOptions":{
        "definition":{
          "maxRepeat":5,
          "minRepeat":2
        },
        "validation":{
          "min":20,
          "max":100
        }
      },
      "required":true
    });
    var requiredField2 = new Field({
      "name":"requiredTextField2",
      "helpText":"This is another required text field",
      "type":"text",
      "repeating":true,
      "fieldOptions":{
        "definition":{
          "maxRepeat":5,
          "minRepeat":2
        },
        "validation":{
          "min":20,
          "max":100
        }
      },
      "required":true
    });
    fields.push(requiredField1);
    fields.push(requiredField2);

    saveSingleForm(fields, testRequiredPage, requiredForm, function(err, formId, fieldIds){
      assert.ok(!err);
      assert.ok(formId);
      assert.ok(fieldIds);

      requiredFieldIds = fieldIds;
      requiredFormId = formId;
      cb();
    });
  }

  function saveSingleForm(fields, testPage, testFieldsForm, cb){
    var globalFormId;
    var fieldIds = {};
    async.series([saveFields, savePage, saveForm], function(err){
      if(err) console.log(err);
      cb(err, globalFormId, fieldIds);
    });

    function saveForm(cb){
      testFieldsForm.pages.push(testPage);
      testFieldsForm.save(function(err){
        if(err) console.log(err);
        assert.ok(!err);

        assert.ok(testFieldsForm._id);
        globalFormId = testFieldsForm._id;

        cb(err);
      });
    }

    function savePage(cb){
      async.eachSeries(fields, function(field, cb){
        testPage.fields.push(field);
        cb();
      }, function(err){
        if(err) console.log(err);
        assert.ok(!err);
        testPage.save(cb);
      });
    }

    function saveFields(cb){
      async.eachSeries(fields, function(field, cb){
        field.save(function(err){
          if(err) console.log(err);
          assert.ok(!err);
          assert.ok(field._id);

          fieldIds[field.name] = field._id;

          cb(err);
        });
      }, function(err){
        if(err) console.log(err);
        assert.ok(!err);

        cb(err, globalFormId, fieldIds);
      });
    }
  }
}
