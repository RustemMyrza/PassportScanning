const tsr = require("tesseract.js")
const express = require('express');
const path = require('path');
const fs = require('fs');
const express = express();
const multer = require('multer');
const port = 3001;



// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_HgIbrNUYJYZ3lJpY8spqgKE8LKj4xKs",
  authDomain: "firstoffirst-ae203.firebaseapp.com",
  projectId: "firstoffirst-ae203",
  storageBucket: "firstoffirst-ae203.appspot.com",
  messagingSenderId: "982110155640",
  appId: "1:982110155640:web:8fb8d80edb07d67eaa8e8d",
  measurementId: "G-3T3ZQ5LDK0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(express);






//Function for saving a data into json file

function dataToJson(text){
    text = text.split(" ")
    fs.readFile('db.json', 'utf8', (err, data) => {

        let arr = JSON.parse(data);
        arr.push(text);

        fs.writeFile('db.json', JSON.stringify(arr), (err) => {
          if (err) throw err;
          console.log('Data written to file');
        })
    }
)}





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








//post function with text identifier

express.post('/result', upload.single("image"), (req, res) => {
    tsr.recognize("Images/" + fullName, 'eng+rus', {logger: e => console.log("ok")})
    .then(result => {

        const text = result.data.text;
        dataToJson(text)
        res.send(text)
      })
      .catch(error => {
        console.error(error);
      });
})





//get function

express.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
  });


express.listen(port)
