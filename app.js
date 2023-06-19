const tsr = require("tesseract.js")
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const multer = require('multer');
const sharp = require("sharp")
const port = 3001;



function findData(arr) {
  let surn, name, nation, placeBirth;

  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[j].length; j++) {
      if (arr[i][j] === "SURNAME") {
        surn = arr[i + 2][j];
      } else if (arr[i][j] === "NAME") {
        name = arr[i + 2][j];
      } else if (arr[i][j] === "NATIONALITY") {
        nation = arr[i + 1][j];
      } else if (arr[i][j] === "PLACE") {
        placeBirth = arr[i + 1][1];
      }
    }
  }

  let result = [surn, name, nation, placeBirth];
  return result;
}



function findAuthority(arr){
  for (let i = 0; i < arr.length; i++){
    for(let j = 0; j < arr[i].length; j++){
      if(arr[i][j] === "AUTHORITY"){
        return arr[i+1].join(' ')
      }
    }
  }
}





function textToArray(textOfTesseract, func) {
  textOfTesseract = textOfTesseract.split("\n");
  for (let i = 0; i < textOfTesseract.length; i++) {
    textOfTesseract[i] = textOfTesseract[i].split(" ");
    func(textOfTesseract[i]); // Call the function passed as a parameter
    if (textOfTesseract[i].length == 0) {
      delete textOfTesseract[i];
    }
  }
  textOfTesseract = textOfTesseract.filter(n => n);
  return textOfTesseract;
}



function sharpImage(image){
  sharp('Images/'+ image)
  //.sharpen(0.5)
  .greyscale()
  .linear(1.6, 0)
  .toFile( 'Images/edited_' + image, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Image sharpened successfully');
    }
  });
}




function isNumber(arr_1, arr_2) {
  for (let i = 0; i < arr_1.length; i++){
    for(let j = 0; j < arr_1[i].length; j++){
      if (!isNaN(arr_1[i][j]) == true && arr_1[i][j].length == 12) {
        console.log(arr_1[i][j] + "was pushed")
        arr_2.push(arr_1[i][j])
      }
      else if(!isNaN(arr_1[i][j].split('.').join('')) == true && arr_1[i][j].length == 10){
        arr_2.push(arr_1[i][j])
      }
      else{
        continue;
      }
    }
  }
  console.log(arr_2)
  return arr_2;
}




function checkText(text) {
  const regex = /^[A-Z0-9.]+$/;
  return regex.test(text);
}








function textFilter(arr) {
  const filteredArr = arr.filter((text) => checkText(text) && text.length > 1);
  const deletedCount = arr.length - filteredArr.length;
  arr.length = 0; // Clear the original array
  Array.prototype.push.apply(arr, filteredArr); // Copy the filtered elements back to the original array
  console.log(`Deleted ${deletedCount} element(s).`);
}



function textToArray(textOfTesseract) {
  textOfTesseract = textOfTesseract.split("\n")
  for (let i = 0; i < textOfTesseract.length; i++){
    textOfTesseract[i] = textOfTesseract[i].split(" ")
   textFilter(textOfTesseract[i])
    if(textOfTesseract[i].length == 0){
      delete textOfTesseract[i]
    }
  }
  console.log(textOfTesseract)
  textOfTesseract = textOfTesseract.filter(n => n)
  return textOfTesseract
}




//Function for saving a data into json file

function dataToJson(text, obj){
  text = textToArray(text)
  let numericData = []
  numericData = isNumber(text, numericData)
  let authority = findAuthority(text)
  let stringData = findData(text)

  obj = {
    first_name: stringData[1],
    last_name: stringData[0],
    citizenship: stringData[2],
    date_of_birth: numericData[1],
    passport_number: text[1][text[1].length - 1],
    issue_date: numericData[2],
    issued_by: authority,
    valid_until: numericData[3],
    place_of_birth: stringData[3],
    IIN: numericData[0]
  }

    //textFilter(text)
  fs.readFile('db.json', 'utf8', (err, data) => {

        let arr = JSON.parse(data);
        arr.push(obj);

        fs.writeFile('db.json', JSON.stringify(arr), (err) => {
          if (err) throw err;
          console.log('Data written to file');
        })
    }
)}


let passportData = {
  first_name: '',
  last_name: '',
  citizenship:'',
  date_of_birth: '',
  passport_number: '',
  issue_date: '',
  issued_by: '',
  valid_until: '',
  place_of_birth: '',
  IIN: ''
}


//function which saved images

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "Images");
    },

    filename: (req, file, cb) => {
        const originalName = path.parse(file.originalname).name;
        const extension = path.extname(file.originalname);
        fullName = originalName + extension
        cb(null, fullName);
    }
  });
  const upload = multer({storage: storage})

console.log(upload.storage.DiskStorage)







//post function with text identifier

app.post('/result', upload.single("image"), (req, res) => {
  sharpImage(fullName)
  tsr.recognize('Images/edited_' + fullName, 'eng+rus', {logger: e => console.log(e.progress)})
  .then(result => {
      const text = result.data.text;
      dataToJson(text, passportData)
      res.send(text)
  })
  .catch(error => {
    console.error(error);
  });
})





//get function

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
  });


app.listen(port)








 /* console.log(text[4][0])
  console.log(text[7][0])
  console.log(text[9][0], text[9][1])
  console.log(text[11][0], text[11][1])
  console.log(text[13][0])
  console.log(text[15][1])
  console.log(text[17])*/
