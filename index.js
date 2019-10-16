#!/usr/bin /env node

const optimist = require('optimist'),
  fs = require('fs'),
  replace = require('replace'),
  htmlparser = require('htmlparser2'),
  chalk = require('chalk'),
  path = require('path'),
  readline = require('readline'),
  request = require('sync-request');

//clear = require('clear');
// question to ask


var html = new String("");
var ARGS = optimist.argv

var output = ARGS["o"];
var dir = ARGS['d'];

//gets input directory parces the file and returns a Promise
//fromReject is a html doc with images in base64 and js files inbeaded
function getInput() {
  return new Promise(function(resolve, reject){
    if (dir === undefined) {
      reject("The in no input.");
    } else {
      const path = require('path');
      try {
        var files = fs.readdirSync(dir.toString());
      } catch (e) {
        console.log("the is a problem with the input. Input is not a directory enter with the -i arrgument");
      }

      var images = [];
      var js = [];
      var preloader64 = '';
      //TODO handle multiple files
      files.forEach(function(file) {
        //gets html text
        if (file.slice(-10) == 'index.html') {
          //check if the file is emty
          html = fs.readFileSync(dir + "/" + file).toString();

        } else if (file.slice(-3) == "png") {
          //gtes png
          let _png64 = "\"data:image/png;base64," +
            fs.readFileSync(dir + "/" + file, 'base64') + "\"\n";
          images.push({
            name: file.substring(0, file.length - 4),
            body: _png64
          });
          //todo still need to add the frames

        } else if (file.slice(-3) == "jpg") {
          //gets jpeg file
          let _jpg64 = "\"data:image/pnd;base64, " + fs.readFileSync(dir + "/" + file, 'base64') + "\"\n";
          images.push({
            name: file.substring(0, file.length - 4),
            body: _jpg64
          });
          //todo still need frames
        } else if (file.slice(-3) == "gif") {
          //gets git file
          if (file.slice3(-3) == "_preloader") {
            preloader64 = "data:image/pnd;base64," + fs.readFileSync(dir + "/" + file, 'base64') + "\"\n";
          } else {
            let _gif64 = "\"data:image/pnd;base64," + fs.readFileSync(dir + "/" + file, 'base64') + "\"\n";
            images.push({
              name: file.substring(0, file.length - 4),
              body: _gif64
            });
          }
        } else if (file.slice(-2) == "js") {
          let _js = ''
          try {
            _js = fs.readFileSync(dir + "/" + file).getBody().toString();
            js.push({
              name: file,
              body: _js
            });
          } catch (e) {
            console.log(chalk.magenta("dude why did you think that would work..."));
          }
        }

      });

      var caseStatement64 = setMultiImage(images);
      //the script
      let s = "src=\"https://s0.2mdn.net/ads/studio/cached_libs/createjs_2015.11.26_54e1c3722102182bb133912ad4442e19_min.js\"+>";
      var r = request('GET', "https://s0.2mdn.net/ads/studio/cached_libs/createjs_2015.11.26_54e1c3722102182bb133912ad4442e19_min.js", false);
      var body = r.getBody().toString();
      var regex = new RegExp(s, 'g');
      //const imgReg = new RegExp("queue\.getResult\(ssMetadata\[i\]\.name", 'gm');
      const st = new RegExp("src:\"[a-zA-Z0-9_.]*\"", 'g');
      const isExisting = st.test(html);
      // Base64 add all
      html = html.replace("ss[ssMetadata[i].name] = new createjs.SpriteSheet( {\"images\": [queue.getResult(ssMetadata[i].name)], \"frames\": ssMetadata[i].frames} )", caseStatement64).replace(st, "src:\"noimage.png\"").replace(regex, ">" + '\n' + body + '\n');
      if (preloader64 != null) {
        html = html.replace("_preloader.gif", preloader64)
      }
      if (js.length != 0) {
        js.forEach(file)
        html = html.replace(file.name, file.body);
      }

    }
    // when there is multiple images this adds all of them to the file.
    var re = "lib.ssMetadata \= (.*(?:\n(?!'\]'$)\^*)*)\n";

    function setMultiImage(images) {

      let newForLoop = "switch (ssMetadata[i].name) {\n";
      images.forEach(function(file) {
        newForLoop = newForLoop + "case \"" + file.name + "\":\n ss[ssMetadata[i].name] = new createjs.SpriteSheet( {\"images\": [" + file.body + "], \"frames\": ssMetadata[i].frames} ) \n break; \n";
      });

      return newForLoop + "}";
    }
    resolve();
  });

}

//get output
let getOutput = function() {
  return new Promise(function(resolve, reject) {
    let result = '';
    try {
      if (output === undefined || output === null) {
          output = dir + "/publish_index.html";
          resolve(output);
      } else if (fs.existsSync(output)) {
        if (fs.statSync(output).isDirectory()) {
          output = output + "/publish_intex.html";
          resolve(output);
        }
      } else {
        reject("problem with output file.");
      }
    } catch (e) {
      reject("promblem getting output");
      console.log(e);
    }

    resolve(output);
  });
}
//check it the file will overwirte data get comfermation or new file.
let validate = function(outputFile) {
  return new Promise(function(resolve, reject) {
    try {
      if (fs.existsSync(outputFile)) {
        //return true false
        console.log(fs.existsSync(outputFile));
        let yn = askYesNo("Output will be writen to \n" + outputFile + ".\n This will over write file. \nIs that ok? ");
        if (yn) {
          resolve(outputFile);
        } else {
          let newFile = askQuestion("Provide an output file location: ");
          newFile = newFile.substring(1,newFile.length-1);
          if (fs.existsSync(newFile)) {
            //file exsaitrs
            let yn = askYesNo("Output will be writen to \n" + newFile + ".\n This will over write file. \nIs that ok? ");
            if(yn){
              resolve(newFile);
            }else{
              reject("Try again with a new output file");
            }
          }else{
            let yn = askYesNo("Output will be writen to " + newFile + ". I that ok? ");
            if (yn) {
              resolve(newFile);
            }else{
              reject("Try again with a new output file");
            }
          }
        }
      } else {
        let yn = askYesNo("Output will be placed in \n " + outputFile + ". Is that ok?");
        if (yn) {
          resolve(outputFile);
        } else {
          let newFile = askQuestion("Provide an output file location: ");

          let yn = askYesNo("Output will be writen to " + newFile + ". Is that ok? ");
          if (yn) {
            resolve(newFile);

          }
        }
      }
    } catch (err) {
      console.log(err + "/n fettal error");
      reject("validate rejected");
    }
  });
}
//writing will only happen after the other stuff
let write = function(file, location) {

  return new Promise(function(resolve, reject) {
    try {
      var writeSteam = fs.createWriteStream(location); //error
      writeSteam.write(file);
      writeSteam.end();
    } catch (err) {
      reject("error wrightToFile with the write part");
    }
    resolve();
  });
}
//this controls the app. insures that the function will exicute in corect order
getInput().then(function (){
  return getOutput();
}).then(function(fromResolve) {
  return validate(fromResolve);
}).then(function(fromResolve) {
  return write(html, fromResolve);
}).catch(function(fromReject) {
  console.log(chalk.magenta(fromReject+"\n please correct error and try again"));
});
//for asking non true false questions
//returns a string
function askQuestion(question) {
  const rl = require('readline-sync');
  var answer = rl.question(question);
  return answer;
}
//for asking true false questions
function askYesNo(question) {
  var query = require('cli-interact').getYesNo;
  var answer = query(question);
  return answer;
}
