/*
  Author: Furqan Kassa
  Date: 2/3/2022
  Course: CSS 484

  The index.js file is about the interactivity of the website and how
  to make the GUI more responsive. 
*/

"use strict";

(function() {

  // an event listener to initialize the application when the page loads
  window.addEventListener("load", init);
  
  // global variables to manipulate the DOM
  let sleepTime = 100;
  let prevClassName = ""; // to remove query image from display
  let index = 0; // to access instructions in the phrase array
  const phrase = ["Select an image to query!", "Please pick an image!", "Try the different sorting algorithms!"];
  let weight = [];
  let sortCheck = false;
  // a function that initializes the buttons on the page
  // associates a buttons function with a specific event handler
  function init() {
    populateView(0); // displays the original image order, passing 0 to pre-process the intensity & color-code values
    const nextBtn = id("next");
    const prevBtn = id("previous");
    const resetBtn = id("reset");
    const intensityBtn = id("intensity");
    const colorCodeBtn = id("color");
    const bothBtn = id("both");
    const checkBtn = id("check");
    // any buttons clicked will call these functions
    nextBtn.addEventListener("click", nextDisplay);
    prevBtn.addEventListener("click", nextDisplay);
    resetBtn.addEventListener("click", resetDisplay);
    bothBtn.addEventListener("click", calcRF);
    checkBtn.addEventListener("click", relevantButtons);
    intensityBtn.addEventListener("click", sortByIntensity);
    colorCodeBtn.addEventListener("click", sortByColorCode);
    typeInstructions(); // writes instructions on top of the page to help users navigate the website
    for(let x = 0; x < 89; x++) {
      weight.push(1 / 89);
    }
    setTimeout(removeLoading, 3500); // a 4 second timer before the loading gif gets removed
  }

  // removes loading gif animation to signify start of application
  function removeLoading() {
    id("preload").classList.add("hidden");
  }

  function relevantButtons() {
    if(!qs(".chosen > img").hasAttribute("src")) {
      qsa(".images input").forEach(element => { element.classList.toggle("hidden") });
      qsa(".images p").forEach(element => { element.classList.toggle("hidden") });
    } else {
      let relevantBtn = qsa(".images input");
      let labelBtn = qsa(".images p");
      for(let x = 0; x < relevantBtn.length; x++) {
        if(qs(".chosen > img").className !== relevantBtn[x].id) {
          relevantBtn[x].classList.toggle("hidden");
          labelBtn[x].classList.toggle("hidden");
        } else if(sortCheck) {
          relevantBtn[x].classList.toggle("hidden");
          labelBtn[x].classList.toggle("hidden");         
        }
      }
    }
  }

  // allows the user to check the other images by clicking the next/prev buttons
  function nextDisplay() {
    // if image 1 isn't hidden, then clicking next goes to the next page
    if(!qs(".images-1").classList.contains("hidden")) {
      if(this.id === "next") {
        qs(".images-1").classList.add("hidden");
        qs(".images-2").classList.remove("hidden");
      }  // if image 2 isn't hidden, then clicking next goes to the image 3 or prev goes to image 1 page
    } else if(!qs(".images-2").classList.contains("hidden")) { 
      qs(".images-2").classList.add("hidden");
      if(this.id === "next") {
        qs(".images-3").classList.remove("hidden");
      } else {
        qs(".images-1").classList.remove("hidden");
      } // if image 3 isn't hidden, then clicking goes to image 2 page
    } else if(!qs(".images-3").classList.contains("hidden")) { 
      qs(".images-3").classList.add("hidden");
      if(this.id === "next") {
        qs(".images-4").classList.remove("hidden");
      } else {
        qs(".images-2").classList.remove("hidden");
      } // if image 4 isn't hidden, then clicking goes to image page 3 or 5 
    } else if(!qs(".images-4").classList.contains("hidden")) { 
      qs(".images-4").classList.add("hidden");
      if(this.id === "next") {
        qs(".images-5").classList.remove("hidden");
      } else {
        qs(".images-3").classList.remove("hidden");
      }
    } else if(!qs(".images-5").classList.contains("hidden")) { 
      if(this.id === "previous") {
        qs(".images-5").classList.add("hidden");
        qs(".images-4").classList.remove("hidden");
      }
    }
  }

  // appends the 100 images to the home page when the application loads
  // calls setUpBins to pre-process the intensity/color-code histogram bins for
  // each images (using a hashmap)
  function populateView(start) {
    let articlePick = "1";
    for(let i = 1; i < 101; i++) {
      let divImage = gen("div"); // holds the image and checkbox button
      let relevant = gen("input"); // checkbox button
      let relevantText = gen("p");
      relevant.id = "img-" + i;
      relevant.type = "checkbox";
      relevantText.textContent = "Relevant";
      let image = gen("img"); // the actual image
      image.src = "images/" + i + ".jpg"; // assigns the source of the image
      image.className = "img-" + i; // assigns a className to the img for quick access to the element
      image.addEventListener("click", queryImage); // makes the button clickable in order to be query image
      divImage.appendChild(image); // apending image to div
      divImage.appendChild(relevant); // appending relevant checkbox button
      if(!id("check").checked) {
        relevant.classList.add("hidden");
        relevantText.classList.add("hidden");
      }
      divImage.appendChild(relevantText); // the text for relevant btn
      qs(".images-" + articlePick).appendChild(divImage); // appends the child to home page
      if(i % 20 === 0 && i !== 100) { // if we reach i % 20, then it creates a next page to display images
        articlePick++;
      }
    }

    id("reset").classList.add("hidden"); // reset button hidden by default until an image is selected
    qs(".images-2").classList.add("hidden"); // hides image-2 to 5 by default 
    qs(".images-3").classList.add("hidden");
    qs(".images-4").classList.add("hidden");
    qs(".images-5").classList.add("hidden");
    if(localStorage.length === 0) { // since it's first time the page loads, we pre-process intensity/color-code histogram bins
      setUpBins();
    } else {
      changeSize();
    }
    if(start === 1) { changeSize(); }; // ensures to get the actual size of images for MD but resizes for better GUI
  }

  // as an image loads, it calculates the histogram bins for the intensity/color-code values
  function setUpBins() {
    let val = qsa(".images img");
    for(let i = 0; i < val.length; i++) {
      val[i].addEventListener("load", async () => { // a promise that halts ensures the bins are calculated
        await createCanvas(val[i]);
      });
    }
  }

  // changes the size of images after getting the pixel data
  function changeSize() {
    let val = qsa(".images img");
    for(let i = 0; i < val.length; i++) {
      val[i].width = 244;
      val[i].height = 126;
    }
  }

  // JavaScript libraries to calculate the values of each individual pixels
  // passes the image as a parameter to access the pixel data
  async function createCanvas(image) {
    const img = new Image();
    img.src = image.src;
    const canvas = gen("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    img.addEventListener("load", async () => {
      await ctx.drawImage(img, 0, 0, image.width, image.height); // draws image to a canvas to get the pixel data
      img.style.display = "none";
      const pixel = await ctx.getImageData(0, 0, canvas.width, canvas.height); // gets the pixel data for each image
      await getIntensityColorCode(pixel.data, image.className); // obtains histogram bins for intensity
      image.width = 244;
      image.height = 126;
    });
  }

  // allows users to reset the display of the application and retain the
  // original order of images prior to using any algorithm.
  function resetDisplay() {
    qs(".chosen > img").removeAttribute("src"); // removes image from the query
    qs(".chosen").removeChild(qs(".chosen > img"));
    qs(".chosen").appendChild(gen("img"));
    sortCheck = false;

    // removes all the images from the page
    qs(".images .images-1").innerHTML = "";
    qs(".images .images-2").innerHTML = "";
    qs(".images .images-3").innerHTML = "";
    qs(".images .images-4").innerHTML = "";
    qs(".images .images-5").innerHTML = "";

    populateView(1); // calls populateView to display all images in original order but passes 1 to not calculate histogram bins again
    id("reset").classList.add("hidden"); // hides reset button
    qs(".images-1").classList.remove("hidden"); // displays the first page
    id("result").textContent = "Choose a method to sort:"; // displays original instrucion
    prevClassName = ""; // query image className gets reset
  }

  // displays the query image on the canvas after a selection
  // shows options for the user to pick a specific algo
  function queryImage() {
    id("result").textContent = "Choose one of the algorithms to sort:";
    id("reset").classList.remove("hidden");
    sortCheck = false;

    // checks if an image was already in query
    // if so, removes it from query display and resets the prevClassName variable
    if(prevClassName.length > 0) {
      qs(prevClassName).classList.remove("hidden");
      let next = qs(prevClassName).nextSibling;
      while(next) {
        if(id("check").checked) {
          next.classList.remove("hidden");
        } else {
          next.classList.add("hidden");
        }
        next = next.nextSibling;
      }
      prevClassName = "";
    }

    qs(".chosen > img").src = this.src;
    qs(".chosen > img").className = this.className;
    prevClassName = ".images ." + this.className; // saves the className of query image to access later
    this.classList.add("hidden");
    let next = this.nextSibling;
    while(next) {
      next.classList.add("hidden");
      next = next.nextSibling;
    }
  }

  // creates the histogram bins for the intensity values of each image
  // adds it to a map for quick access
  // passes pixel.data and image className to identify specific image
  async function getIntensityColorCode(data, number) {
    let historgramBins = Array(25).fill(0); // histogram bin for intensity 
    let colorBins = Array(64).fill(0); // creating the histogram bin of the color code 
    for(let i = 0; i < data.length; i += 4) { // iterates through pixel data, increment by 4 since it's RGBA
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];
      let intensity = (0.299 * red) + (0.587 * green) + (0.114 * blue); // intensity formula
      if(intensity < 250) {
        historgramBins[Math.floor(intensity / 10)] += 1;
      } else {
        historgramBins[Math.floor(intensity / 10) - 1] += 1;
      }
      // convertes pixel values into 8-bit binary numbers
      let redColor = toBinary(data[i]);
      let greenColor = toBinary(data[i + 1]);
      let blueColor = toBinary(data[i + 2]);
      // calculates the most significant bit and appends it a 6-bit binary number
      let binary = redColor.substring(0, 2) + greenColor.substring(0, 2) + blueColor.substring(0, 2);
      const decimal = parseInt(binary, 2);
      colorBins[decimal] += 1; // converts binary number to decimal and updates the color code histogram bin
    }
    localStorage.setItem(number, JSON.stringify([historgramBins, colorBins]));
  }

  // calculates the intensity/color code bins and then concatenates the array
  function calcRF() {
    let concatenateArr = [];
    for(let x = 1; x < 101; x++) {
      let className = "img-" + x;
      let arr = [];
      let intensityArr = JSON.parse(localStorage.getItem(className))[0]; // 25
      let colorCodeArr = JSON.parse(localStorage.getItem(className))[1]; // 64
      
      for(let y = 0; y < intensityArr.length; y++) {
        if("img-25" === className) {
          arr.push(intensityArr[y] / 60501);
        } else {
          arr.push(intensityArr[y] / 98304);
        }
      }

      for(let y = 0; y < colorCodeArr.length; y++) {
        if("img-25" === className) {
          arr.push(colorCodeArr[y] / 60501);
        } else {
          arr.push(colorCodeArr[y] / 98304);
        }
      }
      concatenateArr.push(arr);
    }

    if(qs(".chosen > img").className.length !== 0) {
      findAverageAndSD(concatenateArr); // finds the average and std of the concatenated array
    } else {
      id("result").textContent = "You need to select an image before sorting!";
    }
  }

  // gets the average and sd values to calculate normalized features of the combined query
  function findAverageAndSD(concatenateArr) {
    let avgArr = [];
    let standardDeviationArr = [];
    for(let x = 0; x < concatenateArr[0].length; x++) {
      let sum = 0;
      let currArr = []; // to get the standard deviation of a column
      for(let y = 0; y < concatenateArr.length; y++) {
        sum += concatenateArr[y][x];
        currArr.push(concatenateArr[y][x]);
      }
      standardDeviationArr.push(getSD(currArr));
      avgArr.push(sum / concatenateArr[x].length);
    }

    // normalizes the concatenated array
    normalize(concatenateArr, standardDeviationArr, avgArr);
  }

  // calculates the standard deviation of an array
  function getSD(arr) {
    const n = arr.length;
    const mean = arr.reduce((a, b) => a + b) / n;
    return Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
  }

  // normalies the matrix the concatenated values
  function normalize(concatenateArr, standardDeviationArr, avgArr) {
    // feature1 - average value of feature)/standard deviation // [1, 2, 3]
    let normalized = [];
    for(let x = 0; x < concatenateArr.length; x++) {
      let curr = [];
      for(let i = 0; i < concatenateArr[x].length; i++) {
        if(standardDeviationArr[i] === 0) {
          curr.push(0);
        } else {
          curr.push((concatenateArr[x][i] - avgArr[i]) / standardDeviationArr[i]);
        }
      }
      normalized.push(curr);
    }

    let queryImg = qs(".chosen > img").className;
    queryImg = parseInt(queryImg.substring(queryImg.indexOf("-") + 1, queryImg.length));
    let checkbox = qsa(".images input");
    let relevant = {};

    // relevant image check
    for(let i = 0; i < checkbox.length; i++) {
      let currArr = [];
      if((i === queryImg - 1) || checkbox[i].checked) {
        for(let y = 0; y < normalized[i].length; y++) {
          currArr.push(normalized[i][y]);
        }
        if(i === queryImg - 1) {
          relevant["img-" + i] = currArr;
        } else {
          let index = parseInt(checkbox[i].id.substring(4, checkbox[i].id.length) - 1);
          relevant["img-" + index] = currArr;
        }
      }
    }

    // checks if any relevant images have been selected
    if(Object.keys(relevant).length > 1) { 
      performRF(normalized, queryImg, relevant);
    } else {
      // goes to combined display if only img query is selected
      combinedDisplay(normalized, queryImg);
    }
  }

  // displays intensity + color-coding algorithm together
  function combinedDisplay(normalized, queryImg) {
    if(qs(".chosen > img").hasAttribute("src")) {
      let combinedDisplay = [];      
      sortCheck = true;

      for(let i = 0; i < normalized.length; i++) {
        let manHattanDistance = 0;
        let histogramCompare = normalized[queryImg - 1];
        for(let x = 0; x < normalized[i].length; x++) {
          manHattanDistance += (1 / 89 * Math.abs(histogramCompare[x] - normalized[i][x])); // calculating MD
        }
        combinedDisplay["img-" + (i + 1)] = manHattanDistance;
      }

      displayAlgorithm(combinedDisplay, "Both"); // displays the image order according to their manHattanDistances
    }
  }

  // calculates the updated Sd values of the relevant images only
  // then does the special edge case checks of when Sd == 0
  function performRF(normalized, queryImg, relevant) {
    let updatedWeight = [];

    let SDValues = [];
    for(let x = 0; x < 89; x++) {
      let updatedSD = [];
      for(let y = 0; y < normalized.length; y++) {
        if(relevant.hasOwnProperty("img-" + y)) {
          updatedSD.push(normalized[y][x]);
        }
      }
      if(updatedSD.length > 0) {
        SDValues.push(getSD(updatedSD));
      }
    }
        
    for(let x = 0; x < SDValues.length; x++) {
      if(SDValues[x] === 0) {
        let avg = average(x, relevant);
        if(avg === 0) {
          updatedWeight.push(0);
        } else {
          let revisedSD = 0.5 * findMin(SDValues);
          SDValues[x] = revisedSD;
          updatedWeight.push(1 / SDValues[x]);
        }
      } else {
        updatedWeight.push(1 / SDValues[x]);
      }
    }

    // normalizes the updated weight
    updatedWeightDistance(updatedWeight, normalized, relevant["img-" + (queryImg - 1)]);
  }

  // to find the min of SD != 0 for the special edge case
  function findMin(SDValues) {
    let minVal = 10000;

    for(let x = 0; x < SDValues.length; x++) {
      if(SDValues[x] != 0 && SDValues[x] < minVal) {
        minVal = SDValues[x];
      }
    }

    return minVal;
  }

  // calculates the normalized weight
  // finds the manhattan distance with the new updated weight
  function updatedWeightDistance(updatedWeight, normalized, queryArr) {
    let weightSum = 0;
    let finalWeight = [];
    let updatedRelevancy = {};
    
    for(let x = 0; x < updatedWeight.length; x++) {
      weightSum += updatedWeight[x];
    }

    for(let x = 0; x < updatedWeight.length; x++) {
      weight[x] = updatedWeight[x] / weightSum;
    }
        
    for(let i = 0; i < normalized.length; i++) {
      let currArr = [];
      for(let x = 0; x < normalized[i].length; x++) {
        let val = weight[x] * Math.abs(queryArr[x] - normalized[i][x]);
        currArr.push(val);
      }
      finalWeight.push(currArr);
    }

    for(let i = 0; i < finalWeight.length; i++) {
      let sum = 0;
      for(let x = 0; x < finalWeight[i].length; x++) {
        sum += finalWeight[i][x];
      }
      updatedRelevancy["img-" + (i + 1)] = sum;
    }
    
    displayAlgorithm(updatedRelevancy, "Relevance"); // displays the algorithm
  }

  // finds the average of feature k of only relevant images selected
  function average(column, relevant) {
    let sumColumn = 0;

    for(let i = 0; i < 100; i++) {
      if(relevant.hasOwnProperty("img-" + i)) {
        let arr = relevant["img-" + i];
        sumColumn += arr[column];
      }
    }

    return (sumColumn / Object.keys(relevant).length);
  }

  // once query image selected, calculates the manHattanDistance for each image
  // and comparing it to the query image. Adds manHattanDistance to the hashamp
  function sortByIntensity() {
    if(qs(".chosen > img").hasAttribute("src")) {
      let intensityMap = [];
      let queryImg = qs(".chosen > img");
      let histogramQuery = JSON.parse(localStorage.getItem(queryImg.className))[0];
      let allImages = qsa(".images img");
      intensityMap[queryImg.className] = 0; // the query image has a manHattan distance of 0
      sortCheck = true;
      
      // loops through all images with their respective histogram bins
      // calculates manHattanDistance and creates a mapping for their values
      for(let i = 0; i < allImages.length; i++) {
        if(!allImages[i].classList.contains("hidden")) {
          let manHattanDistance = 0;
          let histogramCompare = JSON.parse(localStorage.getItem(allImages[i].className))[0];
          for(let x = 0; x < histogramQuery.length; x++) {
            let feature1 = 0;
            let feature2 = 0;
            if(queryImg.className === ".img-25") { 
              feature1 = ((histogramQuery[x]) / (60501));
            } else {
              feature1 = ((histogramQuery[x]) / (98304)); 
            }
            if(allImages[i].className === ".img-25") {
              feature2 = ((histogramCompare[i]) / (60501)); 
            } else {
              feature2 = ((histogramCompare[x]) / (98304)); 
            }
            manHattanDistance += Math.abs(feature1 - feature2); // calculating MD
          }
          intensityMap[allImages[i].className] = manHattanDistance;
        }
      }
      displayAlgorithm(intensityMap, "Intensity"); // displays the image order according to their manHattanDistances
    } else {
      // if query image is not selected, instruction pops up to select an image
      id("result").textContent = "You need to select an image before sorting!";
    }
  }

  // uses the hashmap of the manHattanDistance for the intensity values and then
  // sorts the hashmap by its manHattanDistance values. Appends images to the home page
  function displayAlgorithm(algorithmOrder, algorithmName) {
    let sortedMap = [];
    for(let value in algorithmOrder) {
      sortedMap.push([value, algorithmOrder[value]]);
    }

    // sorts the object by its manHattanDistance values
    sortedMap.sort(function(a, b) {
      return a[1] - b[1];
    });

    // clears out all the images in the page
    qs(".images .images-1").innerHTML = "";
    qs(".images .images-2").innerHTML = "";
    qs(".images .images-3").innerHTML = "";
    qs(".images .images-4").innerHTML = "";
    qs(".images .images-5").innerHTML = "";

    // appends images to the page based on their manHattanDistance values
    // let count = 0;
    let articlePick = "1";
    for(let i = 0; i < sortedMap.length; i++) {
      let divImage = gen("div"); // holds the image and checkbox button
      let relevant = gen("input"); // checkbox button
      let relevantText = gen("p");
      relevant.id = sortedMap[i][0];
      relevant.type = "checkbox";
      relevantText.textContent = "Relevant";
      let image = gen("img");
      image.src = "images/" + sortedMap[i][0].substring(4, sortedMap[i][0].length) + ".jpg";
      image.className = sortedMap[i][0];
      image.addEventListener("click", queryImage);
      image.width = 244;
      image.height = 126;
      divImage.appendChild(image); // apending image to div
      divImage.appendChild(relevant); // appending relevant checkbox button
      divImage.appendChild(relevantText); // the text for relevant btn
      if(!id("check").checked) {
        relevant.classList.add("hidden");
        relevantText.classList.add("hidden");
      }
      if(i > 0 && i % 20 === 0) {
        articlePick++;
      }
      qs(".images-" + articlePick).appendChild(divImage);
    }

    // hides all pages except image page 1
    qs(".images-1").classList.remove("hidden");
    qs(".images-2").classList.add("hidden");
    qs(".images-3").classList.add("hidden");
    qs(".images-4").classList.add("hidden");
    qs(".images-5").classList.add("hidden");
    changeResults(algorithmName);
  }

  // displays the results text depending on algorithm
  function changeResults(algorithmName) {
    if(algorithmName === "Intensity") {
      id("result").textContent = "Sorted by the intensity algorithm!";
    } else if(algorithmName === "Color Code") {
      id("result").textContent = "Sorted by the color-code algorithm!";
    } else if(algorithmName === "Both") {
      id("result").textContent = "Sorted by the intensity + color-code algorithm!";
    } else if(algorithmName === "Relevance") {
      id("result").textContent = "Sorted with the relevance feedback algorithm!";
    }
  }

  // once query image selected, calculates the manHattanDistance for each image
  // and comparing it to the query image. Adds manHattanDistance to the hashamp
  function sortByColorCode() {
    if(qs(".chosen > img").hasAttribute("src")) {
      let color = [];
      let queryImg = qs(".chosen > img");
      let histogramQuery = JSON.parse(localStorage.getItem(queryImg.className))[1];
      let allImages = qsa(".images img");
      color[queryImg.className] = 0;
      sortCheck = true;

      for(let i = 0; i < allImages.length; i++) {
        if(!allImages[i].classList.contains("hidden")) {
          let manHattanDistance = 0;
          let histogramCompare = JSON.parse(localStorage.getItem(allImages[i].className))[1];
          for(let x = 0; x < histogramQuery.length; x++) {
            let feature1 = 0;
            let feature2 = 0;
            if(queryImg.className === ".img-25") {
              feature1 = ((histogramQuery[x]) / (60501)); 
            } else {
              feature1 = ((histogramQuery[x]) / (98304)); 
            }
            if(allImages[i].className === ".img-25") {
              feature2 = ((histogramCompare[i]) / (60501)); 
            } else {
              feature2 = ((histogramCompare[x]) / (98304)); 
            }
            manHattanDistance += Math.abs(feature1 - feature2);
          }
          color[allImages[i].className] = manHattanDistance;
        }
      }
      displayAlgorithm(color, "Color Code");
    } else {
      id("result").textContent = "You need to select an image before sorting!";
    }
  }

  // a sleep function that returns a promise for the typeInstructions() method
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // writes our the instructions on how to operate the website.
  // types out multiple instructions for every 30 seconds.
  const typeInstructions = async () => {
    while(true) {
        let word = phrase[index];

        for(let i = 0; i < word.length; i++) {
          id("text").innerText = word.substring(0, i + 1);
          await sleep(sleepTime);
        }

        await sleep(sleepTime * 30.5);

        for(let i = word.length; i > 0; i--) {
          id("text").innerText = word.substring(0, i - 1);
          await sleep(sleepTime);
        }

        await sleep(sleepTime * 5);

        if(index === phrase.length - 1) {
          index = 0;
        } else {
          index++;
        }
      }
    }
  
  /*
   * Converts digits into an 8-bit binary number
   */
  function toBinary(num) {
    let binaryStr = Number(num).toString(2);
    while(binaryStr.length < 8) {
      binaryStr = "0" + binaryStr;
    }
    return binaryStr;
  }

  /*
   * Generates a new HTML element in the DOM
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

  /**
   * Finds the element with the specified ID attribute.
   *
   * @param {string} id - element ID
   * @returns {HTMLElement} DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  } 

  /**
   * Finds the first element with the specified class attribute or
   * element type.
   *
   * @param {string} selector - element type or class attribute
   * @returns {HTMLElement} DOM object associated with parameter.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Finds all elements with the specified class attribute or
   * element type.
   *
   * @param {string} selector - element type or class attribute
   * @returns {HTMLElement} DOM object associated with parameter.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

})();