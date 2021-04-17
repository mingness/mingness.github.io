// Mask Function from https://github.com/processing/p5.js/issues/3900

p5.Graphics.prototype.mask = function (inputMask) {

  if (inputMask === undefined) {
    inputMask = this;
  }
  const currBlend = this.drawingContext.globalCompositeOperation;

  let scaleFactor = 1;
  if (inputMask instanceof p5.Renderer) {
    scaleFactor = inputMask._pInst._pixelDensity;
  }

  const copyArgs = [
    inputMask,
    0,
    0,
    scaleFactor * inputMask.width,
    scaleFactor * inputMask.height,
    0,
    0,
    this.width,
    this.height
  ];

  this.drawingContext.globalCompositeOperation = 'destination-in';
  p5.Renderer2D.prototype.copy.apply(this, copyArgs);
  this.drawingContext.globalCompositeOperation = currBlend;

}


const folderNames = ["01DoylesWest", "02doyles", "05HardwickeZoom",
  "06StGeorgesChurch", "07DorsetSt", "08KeanesCt", "09DenmarkPl",
  "11RiddalsRow", "12RiddallsRow", "13AngelseaMarket", "14MooreSt"];
const captions = ["Doyles Corner, looking west", "Doyles Corner, looking north", "Hardwicke Street towards St George's Church",
  "St George's Church from Dorset Street", "Dorset Street", "Keanes Court, now Church Ave", "Denmark Place, now Ilac Centre",
  "Riddalls Row, now Ilac Centre", "Riddalls Row, now Ilac Centre", "Angelsea Market, now Ilac Centre", "Moore Street"];
const fileImageFront = "F.jpg";
const fileImageBack = "B.jpg";
let frontImages = new Array();
let backImages = new Array();
let frontImage;
let backImage;

let iImage = 0;  // index of folder
let thisMilli = 0;  // counts of last image load
const duration = 10000;  // milliseconds for each image 

const headerHeight = 150;  // pixels buffer for header, just to estimate scaling
const hwRatioTarget = 0.75;  // height to width ratio for image
let hwRatio;
let xOffset;
let thisWidth;
let thisHeight;

let graphic;
let mask;

function preload() {
  for (index = 0; index < folderNames.length; index++) {
    backImages.push(loadImage("images/time-in-place/" + folderNames[index] + "/" + fileImageBack));
    frontImages.push(loadImage("images/time-in-place/" + folderNames[index] + "/" + fileImageFront));
  }
}

function setup() {
  loc = document.getElementById("loc")
  mouseX = width / 2;
  mouseY = height / 2;

  let graphicWidth = windowWidth;
  let graphicHeight = windowHeight - headerHeight;
  let hwRatioWindow = graphicHeight / graphicWidth;
  if (hwRatioWindow > hwRatioTarget) {
    // use full width
    graphicHeight = floor(graphicWidth * hwRatioTarget);
  } else {
    // use full height
    graphicWidth = floor(graphicHeight / hwRatioTarget);
  }
  createCanvas(graphicWidth, graphicHeight);

  graphic = createGraphics(width, height);
  mask = createGraphics(width, height);
  mask.noStroke();

  nextImage();
}

function draw() {
  clear();
  image(frontImage, xOffset, 0, thisWidth, thisHeight);
  graphic.clear();
  graphic.image(backImage, xOffset, 0, thisWidth, thisHeight);

  let m = millis();
  if (m - thisMilli > duration) {
    thisMilli = m;
    iImage = (iImage + 1) % folderNames.length;
    nextImage();
  }

  mask.clear();
  let circleSize = width/3;
  let circleCenterX = max(min(mouseX, xOffset+thisWidth),xOffset);
  let circleCenterY = max(min(mouseY, thisHeight),0);
  mask.ellipse(circleCenterX, circleCenterY, circleSize, circleSize);

  graphic.mask(mask);
  image(graphic, 0, 0, width, height);

  loc.textContent = captions[iImage]
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    iImage = (folderNames.length + iImage - 1) % folderNames.length;
  } else if (keyCode === RIGHT_ARROW) {
    iImage = (iImage + 1) % folderNames.length;
  }

  thisMilli = millis();
  nextImage();
}

function nextImage() {
  backImage = backImages[iImage];
  frontImage = frontImages[iImage];
  hwRatio = backImage.height / backImage.width;

  if (hwRatio <= hwRatioTarget) {
    // use full width
    thisWidth = width;
    thisHeight = width * hwRatio;
    xOffset = 0;
  } else {
    // use full height
    thisWidth = height / hwRatio;
    thisHeight = height;
    xOffset = (width - thisWidth)/2;
  }
}